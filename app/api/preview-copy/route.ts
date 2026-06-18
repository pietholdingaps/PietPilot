import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GeneratedSiteCopy } from "@/lib/siteTypes";

const ALL_SERVICES_FALLBACK = [
  "Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs",
  "Free estimates", "Maintenance plans", "Upgrades & replacements", "Routine servicing",
];

// Parse the owner's free-text services input into a clean array of service names.
// Handles comma-separated, newline-separated, bullet points, numbered lists, etc.
function parseServicesInput(raw: string): string[] {
  if (!raw || raw.trim() === "—") return [];
  return raw
    .split(/[\n,;•\-–]+/)
    .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim()) // remove "1. " or "1) " prefixes
    .filter((s) => s.length > 1 && s.length < 80)       // skip empty or absurdly long
    .slice(0, 20);                                        // cap at 20
}

const fallbackCopy = (businessName: string, trade: string, area: string, licenseNumber?: string): GeneratedSiteCopy => ({
  headline: `${trade || "Trusted local"} services you can count on`,
  subheadline: `${businessName || "We"} proudly serve ${area || "the local area"} with fast, reliable work and honest pricing.`,
  about: `${businessName || "Our team"} is a local, trusted name for ${trade || "trade"} work in ${area || "the area"}. We focus on doing the job right the first time, with clear communication every step of the way.`,
  servicesIntro: "Here's what we can help you with:",
  services: ["Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs", "Free estimates", "Maintenance plans"],
  allServices: ALL_SERVICES_FALLBACK,
  ctaText: "Get a Free Quote",
  trustLine: `Proudly serving ${area || "your area"}`,
  responsePromise: "We respond within 24 hours — guaranteed.",
  guaranteeLine: licenseNumber
    ? `Fully licensed & insured for your peace of mind — License #${licenseNumber}.`
    : "Fully licensed & insured for your peace of mind.",
  whyChooseUs: {
    title: `Why choose ${businessName || "us"}?`,
    points: [
      "Local, reliable, and easy to reach",
      "Honest pricing with no surprises",
      "Quality work, done right the first time",
    ],
  },
  process: [
    { title: "Reach out", description: "Call, message, or fill out our form and tell us what you need." },
    { title: "Free assessment", description: "We visit (or review your details) and give you a clear, honest quote." },
    { title: "We get to work", description: "Our team shows up on time and does the job right the first time." },
    { title: "Job done, guaranteed", description: "We walk you through the finished work and stand behind it." },
  ],
  serviceDetails: [
    "Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs", "Free estimates", "Maintenance plans",
  ].map((title) => ({
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    description: `${businessName || "We"} provide reliable ${title.toLowerCase()} for homes and businesses across ${area || "the local area"}. Our ${trade || "experienced"} team gets the job done right, on time, and at a fair price — with clear communication every step of the way. Get in touch today for a free quote.`,
    faqs: [
      { question: `How much does ${title.toLowerCase()} cost?`, answer: `Pricing depends on the size and scope of your project. Contact ${businessName || "us"} for a free, no-obligation quote.` },
      { question: "How soon can you start?", answer: `We aim to respond quickly and schedule the work as soon as possible — get in touch and we'll find a time that works for you.` },
      { question: "Do you offer a guarantee?", answer: licenseNumber ? `Yes — ${businessName || "we"} stand behind our work and are fully licensed & insured (License #${licenseNumber}).` : `Yes — ${businessName || "we"} stand behind our work and are fully licensed & insured for your peace of mind.` },
    ],
  })),
});

export async function POST(req: NextRequest) {
  let businessName = "", trade = "", area = "", licenseNumber = "";
  try {
    const body = await req.json();
    ({ businessName, trade, area, licenseNumber } = body);
    const { hours, services, experience, about, address, whyChooseUs } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ copy: fallbackCopy(businessName, trade, area, licenseNumber) });
    }

    const parsedServices = parseServicesInput(services);
    const servicesBlock = parsedServices.length > 0
      ? `The owner listed these EXACT services. Your 'services' array must contain ALL of them and NOTHING else:\n${parsedServices.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
      : `Services offered (raw): ${services || "—"}`;

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

6. LOCAL SEO: Mention the area (${area || "local area"}) and specific service combinations naturally throughout descriptions. E.g. "roof repairs in ${area || "the local area"}", "terrace builders serving ${area || "the local area"}".

Here is the business information:

Business name: ${businessName || "—"}
Trade: ${trade || "—"}
Area covered: ${area || "—"}
Business address: ${address || "—"}
Opening hours: ${hours || "—"}
Experience: ${experience || "—"}
License/insurance number: ${licenseNumber || "—"}
Why customers should choose them (in the owner's own words): ${whyChooseUs || "—"}
About the business (in the owner's own words): ${about || "—"}

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

    let copy: GeneratedSiteCopy | null = null;
    try {
      copy = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      copy = match ? JSON.parse(match[0]) : null;
    }

    // Safety net: if AI returned generic services despite instructions, override with parsed input
    if (copy && parsedServices.length > 0) {
      const genericNames = ["repairs & maintenance", "new installations", "inspections", "emergency call-outs", "free estimates", "maintenance plans", "upgrades & replacements", "routine servicing"];
      const aiServices = copy.services || [];
      const genericCount = aiServices.filter((s) => genericNames.includes(s.toLowerCase())).length;
      if (genericCount > aiServices.length / 2) {
        copy.services = parsedServices;
        copy.allServices = parsedServices;
      }
    }

    return NextResponse.json({ copy: copy || fallbackCopy(businessName, trade, area, licenseNumber) });
  } catch (err) {
    console.error("Preview copy error:", err);
    // Always return usable copy so the user never gets stuck on a loading screen.
    return NextResponse.json({ copy: fallbackCopy(businessName, trade, area, licenseNumber) });
  }
}
