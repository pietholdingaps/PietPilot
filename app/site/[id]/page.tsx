import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import GeneratedSite from "@/app/components/GeneratedSite";
import { GeneratedSiteCopy } from "@/lib/siteTypes";

export const dynamic = "force-dynamic";

const fallbackCopy = (businessName: string, trade: string, area: string, licenseNumber?: string): GeneratedSiteCopy => ({
  headline: `${trade || "Trusted local"} services you can count on`,
  subheadline: `${businessName || "We"} proudly serve ${area || "the local area"} with fast, reliable work and honest pricing.`,
  about: `${businessName || "Our team"} is a local, trusted name for ${trade || "trade"} work in ${area || "the area"}. We focus on doing the job right the first time, with clear communication every step of the way.`,
  servicesIntro: "Here's what we can help you with:",
  services: ["Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs", "Free estimates", "Maintenance plans"],
  allServices: [
    "Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs",
    "Free estimates", "Maintenance plans", "Upgrades & replacements", "Routine servicing",
  ],
  ctaText: "Get a Free Quote",
  trustLine: `Proudly serving ${area || "your area"}`,
  responsePromise: "We respond within 24 hours — guaranteed.",
  guaranteeLine: licenseNumber
    ? `Fully licensed & insured for your peace of mind — License #${licenseNumber}.`
    : "Fully licensed & insured for your peace of mind.",
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
    { title: "We get to work", description: "Our team shows up on time and does the job right the first time." },
    { title: "Job done, guaranteed", description: "We walk you through the finished work and stand behind it." },
  ],
  serviceDetails: [
    "Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs", "Free estimates", "Maintenance plans",
  ].map((title) => ({
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    description: `${businessName || "We"} provide reliable ${title.toLowerCase()} for homes and businesses across ${area || "the local area"}. Our ${trade || "experienced"} team gets the job done right, on time, and at a fair price — with clear communication every step of the way. Get in touch today for a free quote.`,
  })),
});

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

  const copy: GeneratedSiteCopy =
    submission.generated_copy || fallbackCopy(submission.business_name, submission.trade, submission.area, submission.license_number);

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
        licenseNumber: submission.license_number || "",
        logoUrl: submission.logo_url || "",
        hours: submission.hours || "",
        template: submission.template || "classic",
        copy,
      }}
    />
  );
}
