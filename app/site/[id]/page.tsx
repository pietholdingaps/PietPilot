import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import GeneratedSite from "@/app/components/GeneratedSite";
import { GeneratedSiteCopy } from "@/lib/siteTypes";

export const dynamic = "force-dynamic";

// Strip double "License #License #" from any string recursively
function stripDoubleLicense(obj: unknown): unknown {
  if (typeof obj === "string") return obj.replace(/license\s*#\s*license\s*#\s*/gi, "License #");
  if (Array.isArray(obj)) return obj.map(stripDoubleLicense);
  if (obj && typeof obj === "object")
    return Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, stripDoubleLicense(v)]));
  return obj;
}

// Parse raw services string into array — same logic as generate-site
function parseServices(raw: string): string[] {
  if (!raw || raw.trim() === "—") return [];
  return raw
    .split(/[\n,;•\-–]+/)
    .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim())
    .filter((s) => s.length > 1 && s.length < 80)
    .slice(0, 20);
}

const fallbackCopy = (businessName: string, trade: string, area: string, licenseNumber: string, rawServices: string): GeneratedSiteCopy => {
  // Use customer's actual services — never hardcoded generics
  const services = parseServices(rawServices);
  const serviceList = services.length > 0 ? services : [`${trade || "Trade"} services`];
  const licLine = licenseNumber
    ? `Fully licensed & insured — License #${licenseNumber}.`
    : "Fully licensed & insured for your peace of mind.";
  return {
    headline: `${trade || "Trusted local"} services you can count on`,
    subheadline: `${businessName || "We"} proudly serve ${area || "the local area"} with fast, reliable work and honest pricing.`,
    about: `${businessName || "Our team"} serves ${area || "the local area"} with professional ${trade || "trade"} work. We get the job done right the first time, with honest pricing and clear communication every step of the way.`,
    servicesIntro: `Here's what ${businessName || "we"} can help you with:`,
    services: serviceList,
    allServices: serviceList,
    ctaText: "Get a Free Quote",
    trustLine: `Proudly serving ${area || "your area"}`,
    responsePromise: "We respond within 24 hours — guaranteed.",
    guaranteeLine: licLine,
    whyChooseUs: {
      title: `Why choose ${businessName || "us"}?`,
      points: [
        "Local, reliable, and easy to reach",
        "Honest pricing with no surprises",
        "Quality work, done right the first time",
      ],
    },
    process: [
      { title: "Reach out", description: "Call, message, or fill out our form and tell us what you need." },
      { title: "Free assessment", description: "We visit (or review your details) and give you a clear, honest quote." },
      { title: "We get to work", description: "Our team shows up on time and gets the job done right." },
      { title: "Job done, guaranteed", description: `${businessName || "We"} stand${businessName ? "s" : ""} behind our work — guaranteed.` },
    ],
    serviceDetails: serviceList.map((title) => ({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: `${businessName || "We"} provide professional ${title.toLowerCase()} services across ${area || "the local area"}. Get in touch today for a free, no-obligation quote.`,
      faqs: [
        { question: `How much does ${title.toLowerCase()} cost?`, answer: `Pricing depends on the scope of your project. Contact ${businessName || "us"} for a free quote.` },
        { question: "How soon can you start?", answer: "We aim to respond quickly — get in touch and we'll find a time that works for you." },
        { question: "Do you offer a guarantee?", answer: licenseNumber ? `Yes — ${businessName || "we"} stand${businessName ? "s" : ""} behind our work and are fully licensed & insured (License #${licenseNumber}).` : `Yes — ${businessName || "we"} stand${businessName ? "s" : ""} behind our work and are fully licensed & insured.` },
      ],
    })),
  };
};

export default async function GeneratedSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: submission } = await supabase
    .from("onboarding_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (!submission) notFound();

  // Strip "License #" prefix from the raw DB value so we never get "License #License #TX-123"
  const licenseClean = (submission.license_number || "").replace(/^license\s*#?\s*/i, "").trim();

  const rawCopy: GeneratedSiteCopy =
    submission.generated_copy || fallbackCopy(submission.business_name, submission.trade, submission.area, licenseClean, submission.services || "");

  // Run stripDoubleLicense on EVERY string in the copy — catches any old saved copy with the bug
  const copy = stripDoubleLicense(rawCopy) as GeneratedSiteCopy;

  return (
    <GeneratedSite
      data={{
        id,
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
        reviews: submission.reviews && submission.reviews.length > 0
          ? submission.reviews
          : submission.review_text
            ? [{ text: submission.review_text, author: submission.review_author || "" }]
            : [],
        ownerName: submission.owner_name || "",
        ownerBio: submission.owner_bio || "",
        ownerPhotoUrl: submission.owner_photo_url || "",
        customImages: submission.custom_images || undefined,
        hiddenSections: submission.hidden_sections || [],
        trustpilotUrl: submission.trustpilot_url || "",
        googleReviewsUrl: submission.google_reviews_url || "",
      }}
    />
  );
}
