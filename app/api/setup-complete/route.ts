import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { siteId, step } = await req.json();
  if (!siteId || !step) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const admin = createSupabaseAdmin();

  // Read current setup_completed
  const { data } = await admin
    .from("onboarding_submissions")
    .select("setup_completed")
    .eq("id", siteId)
    .single();

  const current = (data?.setup_completed as Record<string, boolean>) || {};
  const updated = { ...current, [step]: true };

  await admin
    .from("onboarding_submissions")
    .update({ setup_completed: updated })
    .eq("id", siteId);

  return NextResponse.json({ ok: true });
}
