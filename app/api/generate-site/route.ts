import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { generateServiceDescription } from "@/lib/serviceDescriptions";

export const maxDuration = 60; // Allow up to 60s for AI generation + Pexels calls

/** Maps a service name to a precise Pexels search query for the best photo result */
function getPexelsQuery(serviceName: string): string {
  const s = serviceName.toLowerCase();
  // Roofing — checked first to avoid "tile roof" matching flooring
  if (/roof|roofing|gutter|fascia|soffit|shingle/.test(s)) return "roofer on rooftop shingles installation";
  // Decking / patio / terrace
  if (/deck|terrace|patio|veranda|pergola/.test(s)) return "wooden deck garden patio outdoor";
  // Flooring — tile/slate removed to avoid roofing ambiguity
  if (/floor|flooring|vinyl|laminate|hardwood|parquet|carpet|tiling/.test(s)) return "hardwood floor installation wood planks";
  // Kitchen
  if (/kitchen|worktop|cabinet|cupboard/.test(s)) return "modern kitchen renovation white cabinets";
  // Bathroom
  if (/bathroom|shower|bath|wet room/.test(s)) return "modern bathroom renovation shower";
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

    // Pre-extract numbers from experience/about so AI can't hallucinate defaults
    const rawExperience = submission.experience || "";
    const rawAbout = submission.about || "";
    // Match years in both English ("year", "years") and Danish ("år", "årig")
    const yearsMatch = (rawExperience + " " + rawAbout).match(/(\d+)\s*\+?\s*(year|years|yr|yrs|år|årig)/i);
    const jobsMatch = (rawExperience + " " + rawAbout).match(/(\d[\d,\.]+)\s*\+?\s*(job|jobs|project|projects|home|homes|roof|roofs|house|houses|property|properties|customer|customers|client|clients|repair|repairs|install|installations|vehicle|vehicles|system|systems|unit|units|opgave|opgaver|kunde|kunder)/i);
    const extractedYears = yearsMatch ? `${yearsMatch[1]}+` : null;
    const extractedJobs = jobsMatch ? `${jobsMatch[1].replace(/[,\.]/g, "")}+` : null;

    const licenseClean = (submission.license_number || "").replace(/^license\s*#?\s*/i, "").trim();

    const hardFacts = [
      extractedYears ? `- Years in business: ${extractedYears} — USE THIS EXACT NUMBER in stats and headline` : null,
      extractedJobs ? `- Jobs/projects completed: ${extractedJobs} — USE THIS EXACT NUMBER in stats` : null,
      licenseClean ? `- License/insurance number: ${licenseClean} — when you write the guaranteeLine, write ONLY "License #${licenseClean}" — do NOT write "License #License #${licenseClean}"` : null,
    ].filter(Boolean).join("\n");

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const prompt = `You are a copywriter building a real website for a real local tradesperson. Your job is to write copy that feels 100% specific to THIS business — not generic filler that could apply to anyone.

${hardFacts ? `⚠️ HARD FACTS — these are extracted directly from what the owner wrote. Use them verbatim, do not change or round them:\n${hardFacts}\n` : ""}

CRITICAL RULES — follow these exactly or the website will be useless:

1. SERVICES — THIS IS THE MOST IMPORTANT RULE:
${servicesBlock}
NEVER use generic services like "Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs", "Free estimates", or "Maintenance plans" UNLESS those exact words appear in the list above. The 'services' array in your JSON must match this list exactly (cleaned up to 2-5 word names).

2. EXPERIENCE & STATS: Use the EXACT numbers from the HARD FACTS above. If the owner said 13 years, write 13+ not 5+. If they said 4000 jobs, write 4000+ not 200+. Never use placeholder defaults when real numbers are available.

3. ABOUT: Use the owner's own words as your raw material. Include their specific specialties (e.g. galvanized pipes, old homes, no-mess policy), years in business, and what makes them different. Do NOT replace specific details with generic phrases.

4. WHY CHOOSE US: Base the 'points' directly on what the owner wrote. Use their actual reasons — do not substitute with generic points unless the owner specifically mentioned those things.

5. FAQ: Each service's FAQ questions must be specific to THAT service. For "Water Heater Repair" ask about tank vs tankless, lifespan, signs it needs replacing. For "Leak Detection" ask about hidden leaks, methods used, damage prevention. Do NOT copy-paste the same 3 questions for every service.

6. SERVICE DESCRIPTIONS: Each serviceDetails description must mention something specific to that exact service — not a template sentence. "Drain Cleaning" ≠ "Water Heater Repair" ≠ "Leak Detection". Make them clearly different.

7. GRAMMAR: Use correct subject-verb agreement. "[Business name] stands behind our work" not "stand behind". Check every sentence.

8. LOCAL SEO: Mention the area (${submission.area || "local area"}) and specific service combinations naturally.

Here is the business information:

Business name: ${submission.business_name || "—"}
Trade: ${submission.trade || "—"}
Area covered: ${submission.area || "—"}
Business address: ${submission.address || "—"}
Opening hours: ${submission.hours || "—"}
Experience: ${rawExperience || "—"}
License/insurance number: ${licenseClean || "—"}
Why customers should choose them (in the owner's own words): ${submission.why_choose_us || "—"}
About the business (in the owner's own words): ${rawAbout || "—"}

Respond with ONLY valid JSON (no markdown, no code fences) in exactly this shape:
{
  "headline": "short punchy hero headline — lead with their exact years of experience if given (e.g. '13 Years of Trusted Plumbing Across Austin'). Max 10 words. NEVER end with 'services you can count on' or any generic suffix. NEVER repeat the word 'services' twice.",
  "subheadline": "one sentence using the business name, area, and a specific benefit from what they told us — not a generic line",
  "about": "3-4 sentences in third person using their specific details — years in business, specialties, what they care about, what makes them different. Reference specific things they mentioned (materials, methods, policies). Do NOT use filler like 'local trusted name'.",
  "servicesIntro": "one short sentence introducing the services — mention their trade and area",
  "services": ["array of their exact services, 2-5 word names, ALL of them, NOTHING added"],
  "allServices": ["identical to services"],
  "ctaText": "short CTA button text",
  "trustLine": "credibility line leading with their exact years of experience — e.g. '13+ years serving homeowners across Austin and surrounding areas'",
  "responsePromise": "short reassuring line about getting in touch — NEVER promise a specific time frame like '1 hour' or '24 hours'. Instead use phrases like 'get in touch and we will respond promptly' or 'contact us for a free quote'",
  "guaranteeLine": "trust line with license if provided — format: 'Fully licensed & insured — License #${licenseClean || "XXXXX"}' — ONE 'License #' only, never doubled",
  "whyChooseUs": { "title": "Why choose [Business Name]?", "points": ["3 punchy points taken DIRECTLY from what the owner wrote — their actual reasons"] },
  "process": [{ "title": "2-4 word step title", "description": "one sentence" }, { "title": "...", "description": "..." }, { "title": "...", "description": "..." }, { "title": "...", "description": "..." }],
  "stats": [{ "value": "${extractedYears || "5+"}", "label": "Years in Business" }, { "value": "${extractedJobs || "200+"}", "label": "Jobs Completed" }, { "value": "5★", "label": "Average Rating" }, { "value": "100%", "label": "Licensed & Insured" }],
  "serviceDetails": [{ "title": "exact service name", "slug": "url-slug", "description": "3-4 sentences specific to THIS service — mention the service name, what the customer gets, any relevant specifics from the owner's input. MUST be unique — not the same template repeated.", "faqs": [{ "question": "specific question about this service", "answer": "..." }, { "question": "...", "answer": "..." }, { "question": "...", "answer": "..." }] }]
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

    // FORCE the extracted stats values — never let AI use default placeholders when we have real numbers
    if (extractedYears || extractedJobs) {
      if (!Array.isArray(copy.stats)) {
        copy.stats = [
          { value: extractedYears || "5+", label: "Years in Business" },
          { value: extractedJobs || "200+", label: "Jobs Completed" },
          { value: "5★", label: "Average Rating" },
          { value: "100%", label: "Licensed & Insured" },
        ];
      } else {
        if (extractedYears) copy.stats[0] = { ...copy.stats[0], value: extractedYears, label: "Years in Business" };
        if (extractedJobs) copy.stats[1] = { ...copy.stats[1], value: extractedJobs, label: "Jobs Completed" };
        // Always fix stats 3 and 4
        copy.stats[2] = { value: "5★", label: "Average Rating" };
        copy.stats[3] = { value: "100%", label: "Licensed & Insured" };
      }
    }

    // Strip double "License #" from ALL string values in the copy (recursively)
    function stripDoubleLicense(obj: unknown): unknown {
      if (typeof obj === "string") return obj.replace(/license\s*#\s*license\s*#\s*/gi, "License #");
      if (Array.isArray(obj)) return obj.map(stripDoubleLicense);
      if (obj && typeof obj === "object") {
        return Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, stripDoubleLicense(v)]));
      }
      return obj;
    }
    copy = stripDoubleLicense(copy) as typeof copy;

    // Fix "Services services" / "Service services" / any double-word variant in headline
    if (typeof copy.headline === "string") {
      copy.headline = copy.headline.replace(/\bservices?\s+services?\b/gi, "services");
    }

    // Always enforce the owner's own services — never let AI substitute or invent
    if (parsedServices.length > 0) {
      copy.services = parsedServices;
      copy.allServices = parsedServices;

      // Match serviceDetails to the real services list.
      // Strategy: try title match first, then fall back to same index position.
      // This preserves AI-written descriptions even when AI used slightly different title wording.
      const existingDetails = Array.isArray(copy.serviceDetails) ? copy.serviceDetails : [];

      function findDetailForService(serviceName: string, idx: number) {
        const nameKey = serviceName.toLowerCase().replace(/[^a-z0-9]/g, "");
        const words = serviceName.toLowerCase().split(/\s+/);
        // 1. Exact title match
        let found = existingDetails.find((d: {title?: string}) =>
          (d.title || "").toLowerCase().replace(/[^a-z0-9]/g, "") === nameKey
        );
        // 2. Any word in common
        if (!found) found = existingDetails.find((d: {title?: string}) =>
          words.some((w) => w.length > 3 && (d.title || "").toLowerCase().includes(w))
        );
        // 3. Same index position (AI usually outputs in same order)
        if (!found && existingDetails[idx]) found = existingDetails[idx];
        return found;
      }

      // First pass: build service details using AI-generated copy where available
      const biz = submission.business_name || "We";
      const areaStr = submission.area || "the local area";
      copy.serviceDetails = parsedServices.map((serviceName, idx) => {
        const existing = findDetailForService(serviceName, idx);
        const slug = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const description = existing?.description || generateServiceDescription(serviceName, biz, areaStr);
        return {
          title: serviceName,
          slug,
          description,
          faqs: existing?.faqs || [],
        };
      });

      // Second pass: dedicated AI call to write unique SEO descriptions for ALL services.
      // This runs for EVERY service the customer listed — no category limits.
      try {
        const descPrompt = `You are an SEO copywriter. Write a unique, specific 2-3 sentence description for each service below.

Rules:
- Each description must be COMPLETELY DIFFERENT from the others — not the same template with the service name swapped in
- Mention the specific service by name in a natural way
- Include the business name and location once each
- Focus on what the customer gets: quality, peace of mind, specific process, materials, or outcome relevant to THAT service
- Vary the opening sentence structure across descriptions
- No generic filler like "professional services" or "get in touch today"

Business: ${biz}
Location: ${areaStr}
Trade background: ${submission.trade || "general trades"}

Services to describe:
${parsedServices.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Return ONLY valid JSON with no markdown: {"descriptions": {"exact service name": "description", ...}}`;

        const descMsg = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content: descPrompt }],
        });
        const descText = descMsg.content.find((b) => b.type === "text");
        const descRaw = descText && "text" in descText ? descText.text : "{}";
        let descJson: { descriptions?: Record<string, string> } = {};
        try {
          descJson = JSON.parse(descRaw);
        } catch {
          const m = descRaw.match(/\{[\s\S]*\}/);
          if (m) descJson = JSON.parse(m[0]);
        }
        if (descJson.descriptions) {
          copy.serviceDetails = copy.serviceDetails.map((detail: { title: string; slug: string; description: string; faqs: unknown[] }) => {
            const aiDesc = descJson.descriptions![detail.title]
              || descJson.descriptions![detail.title.toLowerCase()]
              || descJson.descriptions![Object.keys(descJson.descriptions!).find(k => k.toLowerCase() === detail.title.toLowerCase()) || ""];
            return aiDesc ? { ...detail, description: aiDesc } : detail;
          });
        }
      } catch {
        // Description AI call failed — keep first-pass descriptions
      }
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
