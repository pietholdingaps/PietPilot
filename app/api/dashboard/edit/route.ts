import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GeneratedSiteCopy } from "@/lib/siteTypes";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    const { siteId, businessName, phone, email, address, hours, logoUrl, headline, subheadline, about } = body;

    if (!siteId) {
      return NextResponse.json({ error: "Missing site id" }, { status: 400 });
    }

    const { data: existing, error: fetchError } = await supabase
      .from("onboarding_submissions")
      .select("generated_copy")
      .eq("id", siteId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const currentCopy: GeneratedSiteCopy | null = existing.generated_copy;
    const updatedCopy = currentCopy
      ? {
          ...currentCopy,
          headline: headline ?? currentCopy.headline,
          subheadline: subheadline ?? currentCopy.subheadline,
          about: about ?? currentCopy.about,
        }
      : null;

    const { error: updateError } = await supabase
      .from("onboarding_submissions")
      .update({
        business_name: businessName,
        phone,
        email,
        address,
        hours,
        logo_url: logoUrl || null,
        ...(updatedCopy ? { generated_copy: updatedCopy } : {}),
      })
      .eq("id", siteId);

    if (updateError) {
      console.error("Dashboard edit error:", updateError);
      return NextResponse.json({ error: "Could not save changes" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Dashboard edit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
