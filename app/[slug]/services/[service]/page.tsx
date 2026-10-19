import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { themes } from "@/app/components/GeneratedSite";
import { getPhotoForService } from "@/lib/stockPhotos";
import { GeneratedSiteCopy } from "@/lib/siteTypes";
import LeadForm from "@/app/components/LeadForm";
import { generateServiceDescription } from "@/lib/serviceDescriptions";
import Anthropic from "@anthropic-ai/sdk";
import { buildServicePageMetadata, buildServiceSchema, buildFaqSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

const RESERVED = ["api", "dashboard", "onboarding", "site", "leads", "ads", "profile", "login", "contact", "sitemap", "robots"];

const TITLE_LOWER = new Set(["and","or","of","in","the","a","an","to","for","at","by","with","from","on","as","but","nor","so","yet"]);
function toTitleCase(s: string) {
  return s.split(" ").map((w, i) =>
    i === 0 || !TITLE_LOWER.has(w.toLowerCase())
      ? w.charAt(0).toUpperCase() + w.slice(1)
      : w.toLowerCase()
  ).join(" ");
}

const GENERIC_PATTERN = /provide(s)? (expert|professional|skilled) .+ (services|work) (for|across|in)|Done right, on time|brings the right skills, tools, and experience/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateAndSaveDescription(supabase: any, siteId: string, serviceName: string, businessName: string, area: string, trade: string, currentCopy: GeneratedSiteCopy): Promise<string> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `Write a unique, specific 2-3 sentence SEO description for the following trade service.
Rules:
- Be specific to THIS service — not generic trade copy
- Mention the business name (${businessName}) and location (${area}) naturally once each
- Focus on the specific outcome relevant to ${serviceName}
- Do NOT start with "${businessName}"
- Return ONLY the description text, no quotes, no JSON
Business: ${businessName}, Trade: ${trade}, Location: ${area}, Service: ${serviceName}`,
      }],
    });
    const text = msg.content.find((b) => b.type === "text");
    const description = text && "text" in text ? text.text.trim() : "";
    if (!description) return "";
    const updatedDetails = (currentCopy.serviceDetails || []).map((d) =>
      d.title.toLowerCase() === serviceName.toLowerCase() ? { ...d, description } : d
    );
    await supabase.from("onboarding_submissions").update({ generated_copy: { ...currentCopy, serviceDetails: updatedDetails } }).eq("id", siteId);
    return description;
  } catch { return ""; }
}

function parseServices(raw: string): string[] {
  if (!raw || raw.trim() === "—") return [];
  return raw.split(/[\n,;•\-–]+/).map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim()).filter((s) => s.length > 1 && s.length < 80).slice(0, 20);
}

const fallbackCopy = (businessName: string, trade: string, area: string, licenseNumber: string, rawServices?: string): GeneratedSiteCopy => {
  const serviceList = rawServices ? parseServices(rawServices) : [];
  const services = serviceList.length > 0 ? serviceList : [`${trade || "Trade"} services`];
  return {
    headline: `${trade || "Trusted local"} services you can count on`,
    subheadline: `${businessName || "We"} serve ${area || "the local area"} with fast, reliable work and honest pricing.`,
    about: `${businessName || "Our team"} serves ${area || "the local area"} with professional ${trade || "trade"} work.`,
    servicesIntro: `Here's what ${businessName || "we"} can help you with:`,
    services,
    allServices: services,
    ctaText: "Get a Free Quote",
    trustLine: `Proudly serving ${area || "your area"}`,
    responsePromise: "We respond within 24 hours — guaranteed.",
    guaranteeLine: licenseNumber ? `Fully licensed & insured — License #${licenseNumber}.` : "Fully licensed & insured.",
    whyChooseUs: { title: `Why choose ${businessName || "us"}?`, points: ["Local, reliable, and easy to reach", "Honest pricing with no surprises", "Quality work, done right the first time"] },
    process: [
      { title: "Reach out", description: "Call or fill out our form." },
      { title: "Free assessment", description: "We visit and give you a clear, honest quote." },
      { title: "We get to work", description: "Our team shows up on time and gets it done." },
      { title: "Job done, guaranteed", description: `${businessName || "We"} stand${businessName ? "s" : ""} behind our work.` },
    ],
    serviceDetails: services.map((title) => ({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: generateServiceDescription(title, businessName, area || "the local area"),
      faqs: [
        { question: `How much does ${title.toLowerCase()} cost?`, answer: `Contact ${businessName || "us"} for a free, no-obligation quote.` },
        { question: "How soon can you start?", answer: "Get in touch and we'll find a time that works for you." },
        { question: "Do you offer a guarantee?", answer: licenseNumber ? `Yes — fully licensed & insured (License #${licenseNumber}).` : "Yes — we stand behind our work." },
      ],
    })),
  };
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string; service: string }> }): Promise<Metadata> {
  const { slug, service } = await params;
  if (RESERVED.includes(slug)) return { title: "PietPilot" };
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from("onboarding_submissions").select("business_name, trade, area, phone, slug, id, generated_copy").eq("slug", slug).single();
  if (!data) return { title: "PietPilot" };
  const copy = data.generated_copy as { serviceDetails?: { title: string; slug: string }[] } | null;
  const svc = copy?.serviceDetails?.find(s => s.slug === service);
  const serviceName = svc?.title || service.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return buildServicePageMetadata(serviceName, { businessName: data.business_name || "Your Business", trade: data.trade || "", area: data.area || "", phone: data.phone || "", slug, siteId: data.id }, service);
}

export default async function SlugServicePage({ params }: { params: Promise<{ slug: string; service: string }> }) {
  const { slug, service: serviceSlug } = await params;
  if (RESERVED.includes(slug)) notFound();

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: submission } = await supabase.from("onboarding_submissions").select("*").eq("slug", slug).single();
  if (!submission) notFound();

  const licenseClean = (submission.license_number || "").replace(/^license\s*#?\s*/i, "").trim();
  const copy: GeneratedSiteCopy = submission.generated_copy || fallbackCopy(submission.business_name, submission.trade, submission.area, licenseClean, submission.services || "");

  const serviceIndex = (() => {
    const details = copy.serviceDetails || [];
    const exact = details.findIndex((s) => s.slug === serviceSlug);
    if (exact !== -1) return exact;
    return details.findIndex((s) => s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === serviceSlug);
  })();

  let serviceDetail = copy.serviceDetails?.[serviceIndex];
  if (!serviceDetail) notFound();

  if (!serviceDetail.description || GENERIC_PATTERN.test(serviceDetail.description)) {
    const aiDesc = await generateAndSaveDescription(supabase, submission.id, serviceDetail.title, submission.business_name || "", submission.area || "", submission.trade || "", copy);
    if (aiDesc) serviceDetail = { ...serviceDetail, description: aiDesc };
  }

  const theme = themes[submission.template as string] || themes.classic;
  const image = getPhotoForService(serviceDetail.title, submission.trade || "", serviceIndex);
  const businessName = submission.business_name || "Your Business";
  const phone = submission.phone || "";
  const email = submission.email || "";
  const area = submission.area || "";

  const siteUrl = `https://pietpilot.com/${slug}`;
  const serviceUrl = `${siteUrl}/services/${serviceSlug}`;
  const serviceSchema = buildServiceSchema(serviceDetail.title, serviceDetail.description || "", businessName, phone, area, serviceUrl);
  const faqSchema = serviceDetail.faqs && serviceDetail.faqs.length > 0 ? buildFaqSchema(serviceDetail.faqs) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <div style={{ background: theme.bg, color: theme.text }} className="min-h-screen font-sans antialiased">
        {/* NAV */}
        <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ borderColor: `${theme.text}10`, background: theme.navBg }}>
          <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
            <a href={`/${slug}`} className="text-lg font-extrabold tracking-tight">{businessName}</a>
            <div className="hidden sm:flex items-center gap-8 text-sm font-medium" style={{ color: theme.muted }}>
              <a href={`/${slug}#about`} className="hover:opacity-70 transition-opacity">About</a>
              <details className="relative group">
                <summary className="list-none cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1.5 select-none">
                  We offer <span className="text-[10px] mt-0.5">▾</span>
                </summary>
                <div className="absolute top-full left-0 mt-2 rounded-xl shadow-xl border py-2 min-w-[180px] z-50" style={{ background: theme.bg, borderColor: `${theme.text}12` }}>
                  {(copy.serviceDetails || []).map((s) => (
                    <a key={s.slug} href={`/${slug}/services/${s.slug}`} className="block px-4 py-2.5 text-sm hover:opacity-70 transition-opacity" style={{ color: theme.text }}>
                      {toTitleCase(s.title)}
                    </a>
                  ))}
                </div>
              </details>
              {submission.project_photos && submission.project_photos.length > 0 && (
                <a href={`/${slug}/work`} className="hover:opacity-70 transition-opacity">Our Work</a>
              )}
              <a href={`/${slug}#contact`} className="hover:opacity-70 transition-opacity">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              {email && <a href={`mailto:${email}`} className="hidden md:inline text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: theme.muted }}>{email}</a>}
              <a href={`tel:${phone}`} style={{ background: theme.accent, color: theme.accentText }} className="text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity">{phone}</a>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="relative">
          <div className="relative min-h-[420px] bg-cover bg-center flex items-end" style={{ backgroundImage: `url(${image})` }}>
            <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
            <div className="relative max-w-4xl mx-auto px-6 w-full pb-16 pt-28">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6" style={{ background: `${theme.accent}26`, color: "#fff", border: `1px solid ${theme.accent}55` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
                {submission.trade || "Our service"} · {submission.area || "Local area"}
              </div>
              <h1 className="text-[2.4rem] sm:text-5xl font-extrabold leading-[1.05] tracking-tight text-white max-w-2xl">
                {toTitleCase(serviceDetail.title)}
              </h1>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg leading-relaxed mb-10" style={{ color: theme.muted }}>{serviceDetail.description}</p>
            <div className="rounded-3xl p-10 text-center relative overflow-hidden" style={{ background: theme.card, border: `1px solid ${theme.text}14` }}>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Need {toTitleCase(serviceDetail.title)}?</h2>
              <p className="mb-7 text-base" style={{ color: theme.muted }}>{copy.responsePromise}</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href={`tel:${phone}`} style={{ background: theme.accent, color: theme.accentText }} className="inline-flex items-center justify-center gap-2 font-bold text-base px-8 py-4 rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.4)] hover:scale-[1.02] transition-transform">
                  Call now: {phone}
                </a>
                {email && (
                  <a href={`mailto:${email}`} style={{ borderColor: `${theme.text}25`, color: theme.text }} className="inline-flex items-center justify-center gap-2 font-bold text-base px-8 py-4 rounded-xl border hover:opacity-80 transition-opacity">
                    Email us: {email}
                  </a>
                )}
              </div>
            </div>
            <div className="mt-10 text-center">
              <a href={`/${slug}#services`} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: theme.accent }}>← Back to all services</a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        {serviceDetail.faqs && serviceDetail.faqs.length > 0 && (
          <section className="py-20 px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>FAQ</div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Frequently asked questions</h2>
              </div>
              <div className="space-y-4">
                {serviceDetail.faqs.map((faq, i) => (
                  <div key={i} className="rounded-2xl p-6" style={{ background: theme.card, border: `1px solid ${theme.text}12` }}>
                    <h3 className="font-bold text-lg mb-2">{faq.question ?? faq.q}</h3>
                    <p className="text-base leading-relaxed" style={{ color: theme.muted }}>{faq.answer ?? faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* WHY CHOOSE US */}
        {copy.whyChooseUs?.points?.length > 0 && (
          <section className="py-20 px-6" style={{ background: theme.card }}>
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>Why us</div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{copy.whyChooseUs.title}</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                {copy.whyChooseUs.points.map((point, i) => (
                  <div key={i} className="rounded-2xl p-7 text-center" style={{ background: theme.bg, border: `1px solid ${theme.text}12` }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 mx-auto font-extrabold text-base" style={{ background: `${theme.accent}1a`, color: theme.accent, border: `1px solid ${theme.accent}40` }}>✓</div>
                    <p className="font-bold text-base">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CONTACT */}
        <section className="py-20 px-6">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Get in touch</h2>
              <p className="text-base" style={{ color: theme.muted }}>{copy.responsePromise}</p>
            </div>
            <LeadForm siteId={submission.id} accent={theme.accent} accentText={theme.accentText} textColor={theme.text} mutedColor={theme.muted} cardBg={theme.card} borderColor={`${theme.text}14`} />
          </div>
        </section>

        <footer className="py-10 px-6 border-t text-center" style={{ borderColor: `${theme.text}10` }}>
          <p className="text-xs" style={{ color: theme.muted }}>Website by PietPilot · © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </>
  );
}
