import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data: submission, error: fetchError } = await supabase
      .from("onboarding_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const prompt = `You are a copywriter building a real website for a real local tradesperson. Your job is to write copy that feels 100% specific to THIS business — not generic filler that could apply to anyone.

CRITICAL RULES — follow these exactly or the website will be useless:

1. SERVICES: Look at "Services offered" below. Convert EVERY service the owner listed into the 'services' array. Do not skip any. Do not add any they didn't mention. Do not replace their services with generic ones like "Repairs & maintenance", "Inspections", or "Emergency call-outs" unless the owner explicitly wrote those words. If they listed 8 services, return 8. If they listed 14, return 14.

2. EXPERIENCE: If the owner mentioned years of experience (e.g. "8 years", "over a decade"), use it prominently in the headline or subheadline AND in the trustLine. Do not bury it.

3. ABOUT: Use the owner's own words as your raw material. Do not replace specific details (years in business, number of jobs done, what they care about, what makes them different) with generic phrases. The 'about' field should read like it was written BY this specific business, not by a template.

4. WHY CHOOSE US: Base the 'points' directly on what the owner wrote under "Why customers should choose them". Use their actual reasons — do not substitute with generic points like "honest pricing" or "quality work" unless the owner specifically mentioned those things.

5. FAQ: Each service's FAQ questions must be specific to THAT service. For "Roof Repairs" ask about storm damage, repair vs replacement, timeframes. For "Terrace Construction" ask about materials, planning permission, maintenance. Do NOT ask generic questions like "How much does [service] cost?" and "How soon can you start?" for every single service — vary them based on what customers actually wonder about for that specific job.

6. LOCAL SEO: Mention the area (${submission.area || "local area"}) and specific service combinations naturally throughout descriptions.

Here is the business information:

Business name: ${submission.business_name || "—"}
Trade: ${submission.trade || "—"}
Area covered: ${submission.area || "—"}
Business address: ${submission.address || "—"}
Opening hours: ${submission.hours || "—"}
Services offered: ${submission.services || "—"}
Experience: ${submission.experience || "—"}
License/insurance number: ${submission.license_number || "—"}
Why customers should choose them (in the owner's own words): ${submission.why_choose_us || "—"}
About the business (in the owner's own words): ${submission.about || "—"}

Respond with ONLY valid JSON (no markdown, no code fences) in exactly this shape:
{
  "headline": "short punchy hero headline — if they have years of experience, lead with it (e.g. '8 Years of Trusted Roofing & Carpentry in Næstved'). Max 10 words.",
  "subheadline": "one sentence that uses the business name, area, and a specific benefit from what they told us — not a generic line",
  "about": "3-4 sentences written in third person using the owner's own details as the source — include their years in business, what they specialise in, what they care about, and what makes them different. Do NOT use placeholder phrases like 'local trusted name' or 'clear communication' unless the owner said that.",
  "servicesIntro": "one short sentence introducing the services list — mention their trade and area",
  "services": "an array — one short name (2-5 words) per service the owner listed under 'Services offered'. Include ALL of them. Add NOTHING they didn't mention.",
  "allServices": "identical to 'services' — do not add anything",
  "ctaText": "short CTA button text",
  "trustLine": "a credibility line that leads with their years of experience if they gave it — e.g. '8+ years serving homeowners across Næstved and surrounding areas'",
  "responsePromise": "a short reassuring line about response time — invent something reasonable if not stated",
  "guaranteeLine": "a trust line — include license/insurance number if provided",
  "whyChooseUs": { "title": "Why choose [Business Name]?", "points": ["3 short punchy points taken DIRECTLY from what the owner wrote under 'Why customers should choose them' — these must be their actual reasons, not invented ones"] },
  "process": [{ "title": "2-4 word step title", "description": "one sentence" }, ...4 steps total],
  "serviceDetails": "one object per service in the 'services' array, same order — each with: 'title' (same as service name), 'slug' (lowercase hyphenated URL slug), 'description' (3-4 sentence SEO paragraph mentioning the specific service, the business name, the area, and what the customer gets — make each one unique and specific), 'faqs' (3 FAQ objects — questions must be specific to THIS service, not copy-pasted generics — vary them across services)"
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";

    let copy;
    try {
      copy = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      copy = match ? JSON.parse(match[0]) : null;
    }

    if (!copy) {
      return NextResponse.json({ error: "Could not generate site copy" }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("onboarding_submissions")
      .update({ generated_copy: copy })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to save generated copy:", updateError);
    }

    return NextResponse.json({ ok: true, copy });
  } catch (err) {
    console.error("Generate site error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
