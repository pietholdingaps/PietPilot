import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const admin = createSupabaseAdmin();
  const supabase = await createSupabaseServer();

  // Get authenticated user from session
  const { data: { user } } = await supabase.auth.getUser();

  // Fall back to ?site= param for admin/testing access
  const siteIdParam = req.nextUrl.searchParams.get("site");

  let submission = null;

  if (user) {
    // Look up by authenticated user_id
    const { data } = await admin
      .from("onboarding_submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    submission = data;
  }

  // Fallback: explicit site ID (admin access or legacy test sites)
  if (!submission && siteIdParam) {
    const { data } = await admin
      .from("onboarding_submissions")
      .select("*")
      .eq("id", siteIdParam)
      .single();
    submission = data;
  }

  if (!submission) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const { data: leads } = await admin
    .from("leads")
    .select("id, name, contact, email, phone, message, created_at, status")
    .eq("site_id", submission.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ site: submission, leads: leads || [] });
}
