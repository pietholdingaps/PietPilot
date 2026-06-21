import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import GeneratedSite from "@/app/components/GeneratedSite";
import { GeneratedSiteCopy } from "@/lib/siteTypes";
import { buildSiteMetadata, buildLocalBusinessSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

const RESERVED = ["api", "dashboard", "onboarding", "site", "leads", "ads", "profile", "login", "contact", "sitemap", "robots"];

async function getSiteBySlug(slug: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from("onboarding_submissions").select("*").eq("slug", slug).single();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.includes(slug)) return { title: "PietPilot" };
  const data = await getSiteBySlug(slug);
  if (!data) return { title: "PietPilot" };
  const copy = data.generated_copy as { stats?: { value: string; label: string }[] } | null;
  return buildSiteMetadata({
    businessName: data.business_name || "Your Business",
    trade: data.trade || "",
    area: data.area || "",
    phone: data.phone || "",
    email: data.email || "",
    hours: data.hours || "",
    licenseNumber: data.license_number || "",
    slug,
    siteId: data.id,
    stats: copy?.stats,
  });
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED.includes(slug)) notFound();

  const submission = await getSiteBySlug(slug);
  if (!submission) notFound();

  const copy = (submission.generated_copy || {}) as GeneratedSiteCopy;

  const localBusinessSchema = buildLocalBusinessSchema({
    businessName: submission.business_name || "Your Business",
    trade: submission.trade || "",
    area: submission.area || "",
    phone: submission.phone || "",
    email: submission.email || "",
    address: submission.address || "",
    hours: submission.hours || "",
    licenseNumber: submission.license_number || "",
    slug,
    siteId: submission.id,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <GeneratedSite
        data={{
          id: submission.id,
          businessName: submission.business_name || "Your Business",
          trade: submission.trade || "",
          area: submission.area || "",
          phone: submission.phone || "",
          email: submission.email || "",
          address: submission.address || "",
          licenseNumber: (submission.license_number || "").replace(/^license\s*#?\s*/i, "").trim(),
          logoUrl: submission.logo_url || "",
          hours: submission.hours || "",
          template: submission.template || "classic",
          copy,
          projectPhotos: submission.project_photos || [],
          reviews: submission.reviews?.length > 0
            ? submission.reviews
            : submission.review_text
              ? [{ text: submission.review_text, author: submission.review_author || "" }]
              : [],
          ownerName: submission.owner_name || "",
          ownerBio: submission.owner_bio || "",
          ownerPhotoUrl: submission.owner_photo_url || "",
          customImages: submission.custom_images || undefined,
          hiddenSections: submission.hidden_sections || [],
          sectionOrder: submission.section_order || undefined,
          trustpilotUrl: submission.trustpilot_url || "",
          googleReviewsUrl: submission.google_reviews_url || "",
        }}
      />
    </>
  );
}
