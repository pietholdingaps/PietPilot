import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GeneratedSiteCopy } from "@/lib/siteTypes";

const fallbackCopy = (businessName: string, trade: string, area: string): GeneratedSiteCopy => ({
  headline: `${trade || "Trusted local"} services you can count on`,
  subheadline: `${businessName || "We"} proudly serve ${area || "the local area"} with fast, reliable work and honest pricing.`,
  about: `${businessName || "Our team"} is a local, trusted name for ${trade || "trade"} work in ${area || "the area"}. We focus on doing the job right the first time, with clear communication every step of the way.`,
  servicesIntro: "Here's what we can help you with:",
  services: ["Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs"],
  ctaText: "Get a Free Quote",
  trustLine: `Proudly serving ${area || "your area"}`,
  responsePromise: "We respond within 24 hours — guaranteed.",
  guaranteeLine: "Fully licensed & insured for your peace of mind.",
  process: [
    { title: "Reach out", description: "Call, message, or fill out our form and tell us what you need." },
    { title: "Free assessment", description: "We visit (or review your details) and give you a clear, honest quote." },
    { title: "We get to work", description: "Our team shows up on time and does the job right the first time." },
    { title: "Job done, guaranteed", description: "We walk you through the finished work and stand behind it." },
  ],
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, trade, area, hours, services, experience, about } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ copy: fallbackCopy(businessName, trade, area) });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const prompt = `You are a copywriter for a marketing platform that builds websites for local tradespeople (plumbers, electricians, roofers, etc).

Write website copy for this business based on what the owner told us:

Business name: ${businessName || "—"}
Trade: ${trade || "—"}
Area covered: ${area || "—"}
Opening hours: ${hours || "—"}
Services offered: ${services || "—"}
Experience: ${experience || "—"}
About the business (in the owner's own words): ${about || "—"}

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

    let copy: GeneratedSiteCopy | null = null;
    try {
      copy = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      copy = match ? JSON.parse(match[0]) : null;
    }

    return NextResponse.json({ copy: copy || fallbackCopy(businessName, trade, area) });
  } catch (err) {
    console.error("Preview copy error:", err);
    return NextResponse.json({ copy: null }, { status: 500 });
  }
}
