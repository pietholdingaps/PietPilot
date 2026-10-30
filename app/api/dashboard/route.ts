import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const admin = createSupabaseAdmin();
  const siteIdParam = req.nextUrl.searchParams.get("site");

  let submission = null;

  // Try auth-based lookup (may fail if supabase/ssr not available)
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await admin
        .from("onboarding_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      submission = data;
    }
  } catch {
    // fall through to site ID lookup
  }

  // Fallback: explicit site ID
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

  // Ensure setup_completed is included
  const setupCompleted = (submission.setup_completed as Record<string, boolean>) || {};

  const { data: leads } = await admin
    .from("leads")
    .select("id, name, contact, email, phone, message, created_at, status")
    .eq("site_id", submission.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ site: submission, leads: leads || [] });
}
