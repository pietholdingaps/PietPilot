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

    const prompt = `You are a copywriter for a marketing platform that builds websites for local tradespeople (plumbers, electricians, roofers, etc).

Write website copy for this business based on what the owner told us:

Business name: ${submission.business_name || "—"}
Trade: ${submission.trade || "—"}
Area covered: ${submission.area || "—"}
Opening hours: ${submission.hours || "—"}
Services offered: ${submission.services || "—"}
Experience: ${submission.experience || "—"}
About the business (in the owner's own words): ${submission.about || "—"}

Write in a confident, friendly, local-business tone — never generic corporate fluff. Use specific details from what the owner wrote whenever possible.

Respond with ONLY valid JSON (no markdown, no code fences) in exactly this shape:
{
  "headline": "short, punchy hero headline (max 8 words)",
  "subheadline": "one sentence expanding on the headline, focused on the customer's benefit",
  "about": "a warm 3-4 sentence About section written in third person, based on what the owner shared",
  "servicesIntro": "one short sentence introducing the services list",
  "services": ["4 to 6 short service names, each 2-5 words"],
  "ctaText": "short call-to-action button text (e.g. 'Get a Free Quote')",
  "trustLine": "one short credibility line using their experience info, e.g. '15+ years serving Austin homeowners'",
  "responsePromise": "a short reassuring line about how fast they respond, e.g. 'We respond within 24 hours — guaranteed.' (invent a reasonable promise if not stated)",
  "guaranteeLine": "a short trust/insurance/guarantee line, e.g. 'Fully licensed & insured for your peace of mind.' (invent something reasonable and trade-appropriate if not stated)",
  "process": "an array of exactly 4 objects, each with a short 'title' (2-4 words, e.g. 'Reach out', 'Free assessment', 'We get to work', 'Job done, guaranteed') and a one-sentence 'description' explaining that step of working with this business"
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
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
