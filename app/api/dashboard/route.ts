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
    .select("id, business_name, trade, area, phone, email, address, hours, logo_url, template, generated_copy, project_photos, review_text, review_author, reviews, owner_name, owner_bio, owner_photo_url, custom_images")
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
