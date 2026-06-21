import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GeneratedSiteCopy } from "@/lib/siteTypes";
import { generateServiceDescription } from "@/lib/serviceDescriptions";

function rebuildServiceDetails(
  newServices: string[],
  currentCopy: GeneratedSiteCopy,
  businessName: string,
  area: string
) {
  const existing = currentCopy.serviceDetails || [];
  return newServices.map((title, idx) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const titleKey = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const words = title.toLowerCase().split(/\s+/);
    // 1. Exact slug or case-insensitive title match
    let found = existing.find(
      (d) => d.slug === slug || d.title.toLowerCase().replace(/[^a-z0-9]/g, "") === titleKey
    );
    // 2. Word-overlap match (any word > 3 chars in common)
    if (!found) found = existing.find((d) =>
      words.some((w) => w.length > 3 && d.title.toLowerCase().includes(w))
    );
    // 3. Same index — preserves order if AI used slightly different names
    if (!found && existing[idx]) found = existing[idx];

    return found
      ? { ...found, title, slug }
      : {
          title, slug,
          description: generateServiceDescription(title, businessName, area || "the local area"),
          faqs: [],
        };
  });
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    const {
      siteId, businessName, phone, email, address, hours, logoUrl, template, licenseNumber, accountName, ownerEmail, notifyEmail, notifySms, googleAdsCustomerId, googleAdsConnected,
      headline, subheadline, ctaText, about, guaranteeLine, responsePromise, trustLine,
      services, serviceDescriptions, whyPoints, processSteps, stats,
      trustpilotUrl, googleReviewsUrl,
      projectPhotos,
      ownerName, ownerBio, ownerPhotoUrl,
      customImages, hiddenSections, sectionOrder,
    } = body;

    if (!siteId) return NextResponse.json({ error: "Missing site id" }, { status: 400 });

    const { data: existing, error: fetchError } = await supabase
      .from("onboarding_submissions")
      .select("generated_copy, business_name, area")
      .eq("id", siteId)
      .single();

    if (fetchError || !existing) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const currentCopy: GeneratedSiteCopy | null = existing.generated_copy;
    const bName = businessName || existing.business_name || "";
    const bArea = address || existing.area || "";

    // When services are edited, we need to merge descriptions separately
    // (because serviceDescriptions is keyed by title, which may have changed)
    const updatedServiceDetails = services && currentCopy
      ? rebuildServiceDetails(services, currentCopy, bName, bArea).map((d) => ({
          ...d,
          description: serviceDescriptions?.[d.title] ?? d.description,
        }))
      : currentCopy
        ? (serviceDescriptions
            ? (currentCopy.serviceDetails || []).map((d) => ({
                ...d,
                description: serviceDescriptions[d.title] ?? d.description,
              }))
            : currentCopy.serviceDetails)
        : null;

    const updatedCopy: GeneratedSiteCopy | null = currentCopy
      ? {
          ...currentCopy,
          ...(headline !== undefined && { headline }),
          ...(subheadline !== undefined && { subheadline }),
          ...(ctaText !== undefined && { ctaText }),
          ...(about !== undefined && { about }),
          ...(guaranteeLine !== undefined && { guaranteeLine }),
          ...(responsePromise !== undefined && { responsePromise }),
          ...(trustLine !== undefined && { trustLine }),
          ...(services && { services, allServices: services }),
          ...(whyPoints && { whyChooseUs: { ...currentCopy.whyChooseUs, points: whyPoints } }),
          ...(processSteps && { process: processSteps }),
          ...(stats && { stats }),
          ...(updatedServiceDetails && { serviceDetails: updatedServiceDetails }),
        }
      : null;

    const { error: updateError } = await supabase
      .from("onboarding_submissions")
      .update({
        business_name: businessName,
        ...(accountName !== undefined && { account_name: accountName }),
        ...(ownerEmail !== undefined && { owner_email: ownerEmail }),
        ...(notifyEmail !== undefined && { notify_email: notifyEmail }),
        ...(notifySms !== undefined && { notify_sms: notifySms }),
        ...(googleAdsCustomerId !== undefined && { google_ads_customer_id: googleAdsCustomerId }),
        ...(googleAdsConnected !== undefined && { google_ads_connected: googleAdsConnected }),
        phone,
        email,
        address,
        hours,
        logo_url: logoUrl || null,
        template: template || "classic",
        license_number: licenseNumber !== undefined ? licenseNumber : undefined,
        trustpilot_url: trustpilotUrl || null,
        google_reviews_url: googleReviewsUrl || null,
        project_photos: projectPhotos?.length > 0 ? projectPhotos : null,
        owner_name: ownerName || null,
        owner_bio: ownerBio || null,
        owner_photo_url: ownerPhotoUrl || null,
        custom_images: customImages || null,
        hidden_sections: hiddenSections || [],
        section_order: sectionOrder || null,
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
