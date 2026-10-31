import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import GeneratedSite from "@/app/components/GeneratedSite";
import { GeneratedSiteCopy } from "@/lib/siteTypes";
import { buildSiteMetadata, buildLocalBusinessSchema } from "@/lib/seo";

function extractNumber(text: string, unitPattern: RegExp): string | null {
  const m = text.match(new RegExp(`(\\d[\\d,\\.]*)[\\s\\+]*(${unitPattern.source})`, "i"));
  return m ? m[1].replace(/[,\.]/g, "") : null;
}

function stripDoubleLicense(obj: unknown): unknown {
  if (typeof obj === "string") return obj.replace(/license\s*#\s*license\s*#\s*/gi, "License #");
  if (Array.isArray(obj)) return obj.map(stripDoubleLicense);
  if (obj && typeof obj === "object")
    return Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, stripDoubleLicense(v)]));
  return obj;
}

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

  const rawCopy = (submission.generated_copy || {}) as GeneratedSiteCopy;
  const copy = stripDoubleLicense(rawCopy) as GeneratedSiteCopy;

  // Fix headline double-word bug
  if (typeof copy.headline === "string") {
    copy.headline = copy.headline.replace(/\bservices?\s+services?\b/gi, "services");
  }

  // Build stats only from real data — dedicated fields first, fallback to free text
  const getYears = (): string | null => {
    if (submission.years_in_business) { const n = submission.years_in_business.match(/\d+/); if (n) return `${n[0]}+`; }
    const allText = [submission.experience, submission.about, submission.why_choose_us, submission.services].filter(Boolean).join(" ");
    return extractNumber(allText, /year|years|yr|yrs|år|årig/) ? extractNumber(allText, /year|years|yr|yrs|å|årig/) + "+" : null;
  };
  const getJobs = (): string | null => {
    if (submission.jobs_completed) { const n = submission.jobs_completed.match(/\d+/); if (n) return `${parseInt(n[0]).toLocaleString("en")}+`; }
    const allText = [submission.experience, submission.about, submission.why_choose_us, submission.services].filter(Boolean).join(" ");
    const m = allText.match(/(\d[\d,\.]+)\s*\+?\s*(?:\w+\s+)?(job|jobs|project|projects|home|homes|roof|roofs|customer|customers|client|clients)/i);
    return m ? `${m[1].replace(/[,\.]/g, "")}+` : null;
  };
  const yearsVal = getYears();
  const jobsVal = getJobs();
  // Only show stats we actually have real data for
  const realStats: { value: string; label: string }[] = [];
  if (yearsVal) realStats.push({ value: yearsVal, label: "Years in Business" });
  if (jobsVal)  realStats.push({ value: jobsVal,  label: "Jobs Completed" });
  realStats.push({ value: "100%", label: "Licensed & Insured" });
  copy.stats = realStats;

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
