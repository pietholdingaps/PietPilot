import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const siteId = req.nextUrl.searchParams.get("site");
  if (!siteId) {
    return NextResponse.json({ error: "Missing site id" }, { status: 400 });
  }

  const { data: submission, error: siteError } = await supabase
    .from("onboarding_submissions")
    .select("*")
    .eq("id", siteId)
    .single();

  if (siteError || !submission) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, contact, message, created_at")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ site: submission, leads: leads || [] });
}
