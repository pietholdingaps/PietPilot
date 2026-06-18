import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

/** Maps a service name to a precise Pexels search query for the best photo result */
function getPexelsQuery(serviceName: string): string {
  const s = serviceName.toLowerCase();
  // Decking / patio / terrace
  if (/deck|terrace|patio|veranda|pergola/.test(s)) return "wooden deck garden patio outdoor";
  // Flooring
  if (/floor|vinyl|laminate|hardwood|parquet|carpet|tile|tiling/.test(s)) return "hardwood floor installation wood planks";
  // Kitchen
  if (/kitchen|worktop|cabinet|cupboard/.test(s)) return "modern kitchen renovation white cabinets";
  // Bathroom
  if (/bathroom|shower|bath|wet room/.test(s)) return "modern bathroom renovation shower tiles";
  // Roofing
  if (/roof|slate|tile|gutter|fascia|soffit/.test(s)) return "roofer roofing tiles roof repair";
  // Fencing
  if (/fenc|gate|railing|balustrade/.test(s)) return "garden fence wood panel new fence";
  // Windows / doors
  if (/window|door|glazing|conservatory/.test(s)) return "window installation double glazing home";
  // Painting / decorating
  if (/paint|decorat|plaster|render/.test(s)) return "interior painting decorator wall paint";
  // Landscaping
  if (/landscap|garden|turf|lawn|grass|plant|hedge/.test(s)) return "landscaping garden design lawn";
  // Electrical
  if (/electr|wiring|fuse|solar|ev charger|smart/.test(s)) return "electrician wiring electrical panel home";
  // Plumbing
  if (/plumb|boiler|radiator|heating|pipe/.test(s)) return "plumber boiler installation heating home";
  // HVAC / air con
  if (/hvac|air con|heat pump|ventilat/.test(s)) return "hvac air conditioning unit installation";
  // Extension / building
  if (/extension|conversion|loft|build/.test(s)) return "house extension building construction";
  // Carpentry / joinery
  if (/carpent|joineri|stair|shed|garage/.test(s)) return "carpentry joinery wood work craftsman";
  // Driveway / masonry
  if (/drive|block pav|mason|concrete|paving|pathway/.test(s)) return "block paving driveway new stone path";
  // Default: just use the service name
  return serviceName;
}

function parseServicesInput(raw: string): string[] {
  if (!raw || raw.trim() === "—") return [];
  return raw
    .split(/[\n,;•\-–]+/)
    .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim())
    .filter((s) => s.length > 1 && s.length < 80)
    .slice(0, 20);
}

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

    const parsedServices = parseServicesInput(submission.services || "");
    const servicesBlock = parsedServices.length > 0
      ? `The owner listed these EXACT services. Your 'services' array must contain ALL of them and NOTHING else:\n${parsedServices.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
      : `Services offered (raw): ${submission.services || "—"}`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const prompt = `You are a copywriter building a real website for a real local tradesperson. Your job is to write copy that feels 100% specific to THIS business — not generic filler that could apply to anyone.

CRITICAL RULES — follow these exactly or the website will be useless:

1. SERVICES — THIS IS THE MOST IMPORTANT RULE:
${servicesBlock}
NEVER use generic services like "Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs", "Free estimates", or "Maintenance plans" UNLESS those exact words appear in the list above. The 'services' array in your JSON must match this list exactly (cleaned up to 2-5 word names).

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
  "stats": "an array of 3-4 objects shown as trust badges under the hero — extract from what the owner told us. Examples: years of experience ('8+' / 'Years Experience'), projects completed ('500+' / 'Projects Completed'), service radius ('50km' / 'Service Radius'), response time ('Same day' / 'Response Time'). Only include stats you can actually infer from their answers — do not invent numbers not mentioned.",
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

    // Always enforce the owner's own services — never let AI substitute or invent
    if (parsedServices.length > 0) {
      copy.services = parsedServices;
      copy.allServices = parsedServices;

      // Also fix serviceDetails so titles/slugs match the real services
      const existingDetails = Array.isArray(copy.serviceDetails) ? copy.serviceDetails : [];
      copy.serviceDetails = parsedServices.map((serviceName, i) => {
        const existing = existingDetails[i];
        const slug = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return {
          title: serviceName,
          slug,
          description: existing?.description || `${submission.business_name || "We"} provide professional ${serviceName.toLowerCase()} services across ${submission.area || "the local area"}.`,
          faqs: existing?.faqs || [],
        };
      });
    }

    // Pexels: fetch a relevant photo for each service if API key is available
    const pexelsKey = process.env.PEXELS_API_KEY;
    if (pexelsKey && Array.isArray(copy.serviceDetails)) {
      for (const detail of copy.serviceDetails) {
        try {
          // Map common service names to better Pexels search terms
          const serviceQuery = getPexelsQuery(detail.title);
          const query = encodeURIComponent(serviceQuery);
          const pRes = await fetch(
            `https://api.pexels.com/v1/search?query=${query}&per_page=3&orientation=landscape`,
            { headers: { Authorization: pexelsKey } }
          );
          if (pRes.ok) {
            const pData = await pRes.json();
            const photo = pData.photos?.[0];
            const photoUrl = photo?.src?.large || photo?.src?.medium;
            if (photoUrl) (detail as Record<string, unknown>).photo = photoUrl;
          }
        } catch {
          // Pexels lookup failed — no problem, falls back to keyword matching
        }
      }
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
