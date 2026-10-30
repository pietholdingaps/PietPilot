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
  // Pool / spa
  if (/pool|swim|spa|hot tub/.test(s)) return "swimming pool backyard blue water";
  // Pool leak detection
  if (/leak detect/.test(s)) return "pool leak detection technician equipment";
  // Insulation
  if (/spray foam|blown.in|insulation|attic insul|basement insul|air seal/.test(s)) return "spray foam insulation contractor home";
  // Pest control
  if (/pest|termite|rodent|bed bug|mosquito|exterminator/.test(s)) return "pest control exterminator spraying home";
  // Garage door
  if (/garage door|spring replac|opener|panel replac|cable repair/.test(s)) return "garage door installation modern home";
  // Drywall / plastering
  if (/drywall|plaster|skim coat|popcorn ceil/.test(s)) return "drywall installation professional smooth wall";
  // Solar
  if (/solar|battery storage|ev charger|ground.mounted|roof.mounted/.test(s)) return "solar panel installation rooftop residential";
  // Carpentry / joinery
  if (/carpent|joineri|stair|shed/.test(s)) return "carpentry joinery wood work craftsman";
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

    // Pre-extract numbers from ALL text fields — so AI can't hallucinate defaults
    const rawExperience = submission.experience || "";
    const rawAbout = submission.about || "";
    // Search across ALL free-text fields (some owners put years in "why_choose_us" or even "services")
    const allSearchText = [rawExperience, rawAbout, submission.why_choose_us || "", submission.services || ""].join(" ");
    // Match years in both English ("year", "years") and Danish ("år", "årig")
    const yearsMatch = allSearchText.match(/(\d+)\s*\+?\s*(year|years|yr|yrs|år|årig)/i);
    const jobsMatch = allSearchText.match(/(\d[\d,\.]+)\s*\+?\s*(?:\w+\s+)?(job|jobs|project|projects|home|homes|roof|roofs|house|houses|property|properties|customer|customers|client|clients|repair|repairs|install|installations|vehicle|vehicles|system|systems|unit|units|call|calls|treatment|treatments|service|fence|pool|opgave|opgaver|kunde|kunder)/i);
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

5. GRAMMAR: Use correct subject-verb agreement. "[Business name] stands behind our work" not "stand behind". Check every sentence.

6. LOCAL SEO: Mention the area (${submission.area || "local area"}) naturally.

Here is the business information:

Business name: ${submission.business_name || "—"}
Trade: ${submission.trade || "—"}
Area covered: ${submission.area || "—"}
Experience: ${rawExperience || "—"}
License/insurance number: ${licenseClean || "—"}
Why customers should choose them: ${submission.why_choose_us || "—"}
About the business: ${rawAbout || "—"}

Respond with ONLY valid JSON (no markdown, no code fences) in exactly this shape:
{
  "headline": "short punchy hero headline — lead with their exact years of experience if given (e.g. '13 Years of Trusted Plumbing Across Austin'). Max 10 words. NEVER end with 'services you can count on'. NEVER repeat 'services' twice.",
  "subheadline": "one sentence using the business name, area, and a specific benefit — not generic",
  "about": "3-4 sentences using their specific details — years, specialties, what makes them different. No filler.",
  "servicesIntro": "one short sentence introducing the services",
  "services": ["their exact services, 2-5 word names, ALL of them, NOTHING added"],
  "allServices": ["identical to services"],
  "ctaText": "short CTA button text",
  "trustLine": "credibility line leading with their exact years of experience",
  "responsePromise": "short reassuring contact line — no specific time promises like '1 hour' or '24 hours'",
  "guaranteeLine": "Fully licensed & insured — License #${licenseClean || "XXXXX"}",
  "whyChooseUs": { "title": "Why choose [Business Name]?", "points": ["3 punchy points from what the owner wrote"] },
  "process": [{ "title": "2-4 word step", "description": "one sentence" }, { "title": "...", "description": "..." }, { "title": "...", "description": "..." }, { "title": "...", "description": "..." }],
  "stats": [{ "value": "${extractedYears || "5+"}", "label": "Years in Business" }, { "value": "${extractedJobs || "200+"}", "label": "Jobs Completed" }, { "value": "5★", "label": "Average Rating" }, { "value": "100%", "label": "Licensed & Insured" }]
}`;

    // Validation function — detects failed/generic generations
    function isValidCopy(c: Record<string, unknown>): boolean {
      if (!c || typeof c !== "object") return false;
      const headline = (c.headline as string || "").toLowerCase();
      // Reject generic headlines
      if (headline.includes("services you can count on")) return false;
      if (headline.includes("proudly serve")) return false;
      if (headline.length < 10) return false;
      // Reject if service descriptions are all identical
      const details = c.serviceDetails as { description?: string }[] | undefined;
      if (details && details.length >= 2) {
        const first = details[0]?.description?.slice(0, 80) || "";
        const second = details[1]?.description?.slice(0, 80) || "";
        if (first && first === second) return false;
        // Reject if descriptions use wrong-trade templates
        const allDescs = details.map(d => d.description || "").join(" ").toLowerCase();
        if (allDescs.includes("poor windows and doors cost you") ||
            allDescs.includes("your roof is your home's first line of defence") ||
            allDescs.includes("from safety inspections to full rewires")) return false;
      }
      return true;
    }

    let copy: Record<string, unknown> | null = null;

    // Try up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          messages: [{ role: "user", content: prompt }],
        });

        const textBlock = message.content.find((b) => b.type === "text");
        const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";

        let parsed: Record<string, unknown> | null = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          const match = raw.match(/\{[\s\S]*\}/);
          parsed = match ? JSON.parse(match[0]) : null;
        }

        if (parsed && isValidCopy(parsed)) {
          copy = parsed;
          break;
        }
        console.warn(`generate-site attempt ${attempt} failed validation for site ${id}`);
      } catch (err) {
        console.warn(`generate-site attempt ${attempt} error:`, err);
      }
    }

    if (!copy) {
      return NextResponse.json({ error: "Could not generate site copy after 3 attempts" }, { status: 500 });
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

    // Fix "[Business Name] stand behind" → "stands behind" (grammar)
    function fixStandsBehind(obj: unknown): unknown {
      if (typeof obj === "string") {
        return obj.replace(/([A-Z][^.!?]{2,60}?)\s+stand behind/g, (_, subj) => {
          const lower = subj.trim().toLowerCase();
          if (lower === "we" || lower === "our team" || lower === "the team") return `${subj} stand behind`;
          return `${subj} stands behind`;
        });
      }
      if (Array.isArray(obj)) return obj.map(fixStandsBehind);
      if (obj && typeof obj === "object")
        return Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, fixStandsBehind(v)]));
      return obj;
    }
    copy = fixStandsBehind(copy) as typeof copy;

    // Build serviceDetails entirely from code — no AI call needed, no timeout risk
    if (parsedServices.length > 0) {
      copy.services = parsedServices;
      copy.allServices = parsedServices;

      const biz = submission.business_name || "We";
      const areaStr = submission.area || "the local area";
      const licLine = licenseClean
        ? `Yes — ${biz} ${biz !== "We" ? "is" : "are"} fully licensed & insured (License #${licenseClean}).`
        : `Yes — ${biz} ${biz !== "We" ? "is" : "are"} fully licensed & insured for your peace of mind.`;

      const seenDescriptions = new Set<string>();
      copy.serviceDetails = parsedServices.map((serviceName) => {
        const slug = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        let description = generateServiceDescription(serviceName, biz, areaStr);
        // Dedup: if identical to a previous description, generate a simple variant
        const key = description.slice(0, 100);
        if (seenDescriptions.has(key)) {
          description = `${biz} provides professional ${serviceName.toLowerCase()} services across ${areaStr}. Our experienced team delivers quality results tailored to your specific needs. Contact us today for a free quote.`;
        }
        seenDescriptions.add(description.slice(0, 100));
        return {
          title: serviceName,
          slug,
          description,
          faqs: [
            {
              question: `How much does ${serviceName.toLowerCase()} cost?`,
              answer: `Pricing depends on the scope of your project. Contact ${biz} for a free, no-obligation quote.`,
            },
            {
              question: "Are you licensed and insured?",
              answer: licLine,
            },
            {
              question: "How soon can you start?",
              answer: `Get in touch and we'll work around your schedule to find the earliest available time.`,
            },
          ],
        };
      });
    }

    // Pexels: fetch photos for all services in parallel to save time
    const pexelsKey = process.env.PEXELS_API_KEY;
    if (pexelsKey && Array.isArray(copy.serviceDetails)) {
      await Promise.all(copy.serviceDetails.map(async (detail) => {
        try {
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
          // Pexels lookup failed — falls back to keyword matching
        }
      }));
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
