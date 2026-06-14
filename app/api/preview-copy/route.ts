import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GeneratedSiteCopy } from "@/lib/siteTypes";

const ALL_SERVICES_FALLBACK = [
  "Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs",
  "Free estimates", "Maintenance plans", "Upgrades & replacements", "Routine servicing",
];

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

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const prompt = `You are a copywriter for a marketing platform that builds websites for local tradespeople (plumbers, electricians, roofers, etc).

Write website copy for this business based on what the owner told us:

Business name: ${businessName || "—"}
Trade: ${trade || "—"}
Area covered: ${area || "—"}
Business address: ${address || "—"}
Opening hours: ${hours || "—"}
Services offered: ${services || "—"}
Experience: ${experience || "—"}
License/insurance number: ${licenseNumber || "—"}
Why customers should choose them (in the owner's own words): ${whyChooseUs || "—"}
About the business (in the owner's own words): ${about || "—"}

Write in a confident, friendly, local-business tone — never generic corporate fluff. Use specific details from what the owner wrote whenever possible.

Respond with ONLY valid JSON (no markdown, no code fences) in exactly this shape:
{
  "headline": "short, punchy hero headline (max 8 words)",
  "subheadline": "one sentence expanding on the headline, focused on the customer's benefit",
  "about": "a warm 3-4 sentence About section written in third person, based on what the owner shared",
  "servicesIntro": "one short sentence introducing the services list",
  "services": ["exactly 6 short service names, each 2-5 words"],
  "allServices": "an array of 8-12 short service names (2-5 words each) covering everything mentioned in 'Services offered', expanded with closely related services a business like this would realistically also offer — used for a full services list on the site",
  "ctaText": "short call-to-action button text (e.g. 'Get a Free Quote')",
  "trustLine": "one short credibility line using their experience info, e.g. '15+ years serving Austin homeowners'",
  "responsePromise": "a short reassuring line about how fast they respond, e.g. 'We respond within 24 hours — guaranteed.' (invent a reasonable promise if not stated)",
  "guaranteeLine": "a short trust/insurance/guarantee line, e.g. 'Fully licensed & insured for your peace of mind.' If a license/insurance number was provided, naturally include it (e.g. 'Fully licensed & insured — License #12345'). Otherwise invent something reasonable and trade-appropriate.",
  "whyChooseUs": "an object with 'title' (e.g. 'Why choose [Business Name]?') and 'points' (an array of exactly 3 short, punchy reasons customers should pick this business — base these on what the owner said about why customers should choose them, and on their experience/about info; each point max 8 words)",
  "process": "an array of exactly 4 objects, each with a short 'title' (2-4 words, e.g. 'Reach out', 'Free assessment', 'We get to work', 'Job done, guaranteed') and a one-sentence 'description' explaining that step of working with this business",
  "serviceDetails": "an array of exactly 6 objects — one per service in the 'services' array, in the same order — each with: 'title' (same as the service name), 'slug' (lowercase, hyphenated, URL-safe version of the title, e.g. 'drain-cleaning'), 'description' (a unique, SEO-friendly 3-4 sentence paragraph about this specific service for this business — mention the trade, the local area, and what the customer gets, written naturally for search engines and real readers), and 'faqs' (an array of exactly 3 objects, each with a short 'question' a real customer would ask about this specific service, e.g. cost, timing, what's included, and a helpful 2-3 sentence 'answer' written from this business's perspective)"
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1536,
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

    return NextResponse.json({ copy: copy || fallbackCopy(businessName, trade, area, licenseNumber) });
  } catch (err) {
    console.error("Preview copy error:", err);
    // Always return usable copy so the user never gets stuck on a loading screen.
    return NextResponse.json({ copy: fallbackCopy(businessName, trade, area, licenseNumber) });
  }
}
