import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { themes } from "@/app/components/GeneratedSite";
import { getPhotosForTrade } from "@/lib/stockPhotos";
import { GeneratedSiteCopy } from "@/lib/siteTypes";

export const dynamic = "force-dynamic";

const fallbackCopy = (businessName: string, trade: string, area: string): GeneratedSiteCopy => ({
  headline: `${trade || "Trusted local"} services you can count on`,
  subheadline: `${businessName || "We"} proudly serve ${area || "the local area"} with fast, reliable work and honest pricing.`,
  about: `${businessName || "Our team"} is a local, trusted name for ${trade || "trade"} work in ${area || "the area"}. We focus on doing the job right the first time, with clear communication every step of the way.`,
  servicesIntro: "Here's what we can help you with:",
  services: ["Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs", "Free estimates", "Maintenance plans"],
  ctaText: "Get a Free Quote",
  trustLine: `Proudly serving ${area || "your area"}`,
  responsePromise: "We respond within 24 hours — guaranteed.",
  guaranteeLine: "Fully licensed & insured for your peace of mind.",
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

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;

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
    submission.generated_copy || fallbackCopy(submission.business_name, submission.trade, submission.area);

  const serviceIndex = (copy.serviceDetails || []).findIndex((s) => s.slug === slug);
  const service = copy.serviceDetails?.[serviceIndex];

  if (!service) notFound();

  const theme = themes[submission.template as string] || themes.classic;
  const photos = getPhotosForTrade(submission.trade || "");
  const allImages = [photos.hero, ...photos.gallery];
  const image = allImages[serviceIndex % allImages.length];

  const businessName = submission.business_name || "Your Business";
  const phone = submission.phone || "";
  const email = submission.email || "";

  return (
    <div style={{ background: theme.bg, color: theme.text }} className="min-h-screen font-sans antialiased">
      {/* NAV */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ borderColor: `${theme.text}10`, background: theme.navBg }}>
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <a href={`/site/${id}`} className="text-lg font-extrabold tracking-tight">{businessName}</a>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium" style={{ color: theme.muted }}>
            <a href={`/site/${id}#about`} className="hover:opacity-70 transition-opacity">About</a>
            <a href={`/site/${id}#services`} className="hover:opacity-70 transition-opacity">Services</a>
            <a href={`/site/${id}#contact`} className="hover:opacity-70 transition-opacity">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            {email && (
              <a
                href={`mailto:${email}`}
                className="hidden md:inline text-sm font-semibold hover:opacity-70 transition-opacity"
                style={{ color: theme.muted }}
              >
                {email}
              </a>
            )}
            <a
              href={`tel:${phone}`}
              style={{ background: theme.accent, color: theme.accentText }}
              className="text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
            >
              {phone}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative">
        <div
          className="relative min-h-[420px] bg-cover bg-center flex items-end"
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
          <div className="relative max-w-4xl mx-auto px-6 w-full pb-16 pt-28">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6"
              style={{ background: `${theme.accent}26`, color: "#fff", border: `1px solid ${theme.accent}55` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
              {submission.trade || "Our service"} · {submission.area || "Local area"}
            </div>
            <h1 className="text-[2.4rem] sm:text-5xl font-extrabold leading-[1.05] tracking-tight text-white max-w-2xl">
              {service.title}
            </h1>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg leading-relaxed mb-10" style={{ color: theme.muted }}>{service.description}</p>

          <div
            className="rounded-3xl p-10 text-center relative overflow-hidden"
            style={{ background: theme.card, border: `1px solid ${theme.text}14` }}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Need {service.title.toLowerCase()}?</h2>
            <p className="mb-7 text-base" style={{ color: theme.muted }}>{copy.responsePromise}</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`tel:${phone}`}
                style={{ background: theme.accent, color: theme.accentText }}
                className="inline-flex items-center justify-center gap-2 font-bold text-base px-8 py-4 rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.4)] hover:scale-[1.02] transition-transform"
              >
                Call now: {phone}
              </a>
              {email && (
                <a
                  href={`mailto:${email}`}
                  style={{ borderColor: `${theme.text}25`, color: theme.text }}
                  className="inline-flex items-center justify-center gap-2 font-bold text-base px-8 py-4 rounded-xl border hover:opacity-80 transition-opacity"
                >
                  Email us: {email}
                </a>
              )}
            </div>
          </div>

          <div className="mt-10 text-center">
            <a href={`/site/${id}#services`} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: theme.accent }}>
              ← Back to all services
            </a>
          </div>
        </div>
      </section>

      <footer className="py-10 px-6 border-t text-center" style={{ borderColor: `${theme.text}10` }}>
        <p className="text-xs" style={{ color: theme.muted }}>
          Website by PietPilot · © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
