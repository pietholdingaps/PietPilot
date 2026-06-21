import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  try {
    const { siteId, focusService, dailyBudget } = await req.json();
    if (!siteId) return NextResponse.json({ error: "Missing siteId" }, { status: 400 });

    const { data: site } = await supabase
      .from("onboarding_submissions")
      .select("business_name, trade, area, address, services, generated_copy")
      .eq("id", siteId)
      .single();

    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const businessName = site.business_name || "this business";
    const area = site.area || site.address || "the local area";
    const allServices = (site.generated_copy as { services?: string[] })?.services || site.services?.split(",").map((s: string) => s.trim()) || [];
    const targetService = focusService === "all" ? null : focusService;

    const prompt = `You are a Google Ads expert writing high-converting search ads for a local trade business.

Business: ${businessName}
Trade: ${site.trade}
Location: ${area}
Services: ${allServices.join(", ")}
${targetService ? `FOCUS: Generate ads specifically for "${targetService}" — this is what they want MORE of.` : "FOCUS: Generate general ads covering their main services."}
Daily budget: $${dailyBudget || 20}

Generate 3 Google Search Ad variations. Each ad must have:
- 3 headlines (MAX 30 characters each — count carefully, this is critical)
- 2 descriptions (MAX 90 characters each)
- These must be compelling, specific to their location and trade, and drive calls/inquiries

Also generate:
- 10 keywords they should target (mix of exact and phrase match, local intent)
- 5 negative keywords (to exclude irrelevant clicks)

Return ONLY valid JSON:
{
  "ads": [
    {
      "headlines": ["Headline 1", "Headline 2", "Headline 3"],
      "descriptions": ["Description 1 max 90 chars", "Description 2 max 90 chars"]
    }
  ],
  "keywords": ["keyword 1", "keyword 2"],
  "negativeKeywords": ["negative 1", "negative 2"],
  "estimatedClicksPerDay": 5,
  "estimatedLeadsPerMonth": 8
}`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (msg.content[0] as { text: string }).text.replace(/```json\n?|```/g, "").trim();
    const ads = JSON.parse(raw);

    const newCampaign = {
      id: `camp_${Date.now()}`,
      ads: ads.ads,
      keywords: ads.keywords,
      focusService: targetService || "all",
      dailyBudget: dailyBudget || 20,
      paused: false,
      startedAt: new Date().toISOString(),
    };

    // Load existing campaigns and add new one
    const { data: existing } = await supabase
      .from("onboarding_submissions")
      .select("generated_ads")
      .eq("id", siteId)
      .single();

    const existingCampaigns: unknown[] = (existing?.generated_ads as { campaigns?: unknown[] })?.campaigns || [];
    const campaigns = [...existingCampaigns, newCampaign];

    await supabase.from("onboarding_submissions").update({
      generated_ads: { campaigns }
    }).eq("id", siteId);

    return NextResponse.json({ ok: true, campaign: newCampaign, campaigns });
  } catch (err) {
    console.error("Generate ads error:", err);
    return NextResponse.json({ error: "Could not generate ads" }, { status: 500 });
  }
}
