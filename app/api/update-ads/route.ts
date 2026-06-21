import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { siteId, campaignId, paused, dailyBudget, deleteCampaign } = await req.json();
  if (!siteId) return NextResponse.json({ error: "Missing siteId" }, { status: 400 });

  const { data: current } = await supabase
    .from("onboarding_submissions")
    .select("generated_ads")
    .eq("id", siteId)
    .single();

  const data = current?.generated_ads as { campaigns?: { id: string; paused?: boolean; dailyBudget?: number }[] } | null;
  let campaigns = data?.campaigns || [];

  if (campaignId) {
    if (deleteCampaign) {
      campaigns = campaigns.filter(c => c.id !== campaignId);
    } else {
      campaigns = campaigns.map(c => c.id === campaignId ? {
        ...c,
        ...(paused !== undefined && { paused }),
        ...(dailyBudget !== undefined && { dailyBudget }),
      } : c);
    }
  }

  await supabase.from("onboarding_submissions").update({
    generated_ads: { campaigns }
  }).eq("id", siteId);

  return NextResponse.json({ ok: true, campaigns });
}
