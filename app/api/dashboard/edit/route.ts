import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GeneratedSiteCopy } from "@/lib/siteTypes";

function rebuildServiceDetails(
  newServices: string[],
  currentCopy: GeneratedSiteCopy,
  businessName: string,
  area: string
) {
  return newServices.map((title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = (currentCopy.serviceDetails || []).find(
      (d) => d.title.toLowerCase() === title.toLowerCase() || d.slug === slug
    );
    return existing
      ? { ...existing, title, slug }
      : {
          title, slug,
          description: `${businessName || "We"} provide professional ${title.toLowerCase()} services across ${area || "the local area"}. Contact us today for a free, no-obligation quote.`,
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
      siteId, businessName, phone, email, address, hours, logoUrl, template,
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
        phone,
        email,
        address,
        hours,
        logo_url: logoUrl || null,
        template: template || "classic",
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
