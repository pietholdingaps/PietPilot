import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { siteId, ads } = await req.json();
  if (!siteId) return NextResponse.json({ error: "Missing siteId" }, { status: 400 });

  const { data: current } = await supabase
    .from("onboarding_submissions")
    .select("generated_ads")
    .eq("id", siteId)
    .single();

  await supabase.from("onboarding_submissions").update({
    generated_ads: { ...current?.generated_ads, ads }
  }).eq("id", siteId);

  return NextResponse.json({ ok: true });
}
