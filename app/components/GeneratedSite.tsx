import { SiteData } from "@/lib/siteTypes";
import { getPhotosForTrade, getPhotoForService } from "@/lib/stockPhotos";
import LeadForm from "./LeadForm";
import ServicesCarousel from "./ServicesCarousel";

export type Theme = {
  bg: string; text: string; muted: string; card: string; accent: string; accentText: string; heroOverlay: string; navBg: string;
};

export const themes: Record<string, Theme> = {
  classic: {
    bg: "#ffffff", text: "#0f1729", muted: "#5b6472", card: "#f6f8fb",
    accent: "#1d4ed8", accentText: "#ffffff",
    heroOverlay: "linear-gradient(115deg, rgba(15,23,41,0.82) 0%, rgba(15,23,41,0.45) 55%, rgba(15,23,41,0.25) 100%)",
    navBg: "rgba(255,255,255,0.85)",
  },
  bold: {
    bg: "#0a0a0f", text: "#f5f5f7", muted: "#9d9da8", card: "#15151d",
    accent: "#f59e0b", accentText: "#0a0a0f",
    heroOverlay: "linear-gradient(115deg, rgba(10,10,15,0.88) 0%, rgba(10,10,15,0.5) 55%, rgba(10,10,15,0.25) 100%)",
    navBg: "rgba(10,10,15,0.75)",
  },
  warm: {
    bg: "#fdf6ee", text: "#3a2e26", muted: "#8a7a6d", card: "#f6ebdd",
    accent: "#e2725b", accentText: "#ffffff",
    heroOverlay: "linear-gradient(115deg, rgba(58,46,38,0.78) 0%, rgba(58,46,38,0.42) 55%, rgba(58,46,38,0.2) 100%)",
    navBg: "rgba(253,246,238,0.85)",
  },
};

const LOWER_WORDS = new Set(["and","or","of","in","the","a","an","to","for","at","by","with","from","on","as","but","nor","so","yet"]);
function toTitleCase(s: string) {
  return s
    .split(" ")
    .map((w, i) =>
      i === 0 || !LOWER_WORDS.has(w.toLowerCase())
        ? w.charAt(0).toUpperCase() + w.slice(1)
        : w.toLowerCase()
    )
    .join(" ");
}

const DEFAULT_SECTION_ORDER = [
  "hero", "stats", "about", "why", "services",
  "process", "reviews", "area", "contact", "owner", "photos",
];

export default function GeneratedSite({ data }: { data: SiteData }) {
  const theme = themes[data.template] || themes.classic;
  const photos = getPhotosForTrade(data.trade);
  const { copy } = data;
  const guaranteeLine = (copy.guaranteeLine || "").replace(/license\s*#\s*license\s*#\s*/gi, "License #");
  const servicesGrid = copy.services || [];
  const hidden = new Set(data.hiddenSections || []);
  const sectionOrder = data.sectionOrder || DEFAULT_SECTION_ORDER;

  // ── Stats: use AI-generated or build fallback ──
  const statsData = (() => {
    if (copy.stats && copy.stats.length > 0) return copy.stats;
    const fallback: { value: string; label: string }[] = [];
    const yearsMatch = (copy.trustLine || "").match(/(\d+)\+?\s*year/i);
    fallback.push({ value: yearsMatch ? `${yearsMatch[1]}+` : "5+", label: "Years Experience" });
    const jobsMatch = (copy.about || "").match(/(\d[\d,]+)\+?\s*(job|project|home|customer|client)/i);
    fallback.push({ value: jobsMatch ? `${jobsMatch[1].replace(/,/g, "")}+` : "200+", label: "Jobs Completed" });
    const areaCity = (data.area || "Local Area").split(/\s+and\s+/i)[0].split(/[,&]/)[0].trim().split(" ").slice(0, 1).join(" ");
    fallback.push({ value: areaCity, label: "Service Area" });
    fallback.push({ value: "1 Hour", label: "Response Time" });
    return fallback;
  })();

  // ── Section renderers ──────────────────────────────────────────────────────

  function renderHero() {
    return (
      <section key="hero" className="relative">
        <div
          className="relative min-h-[620px] bg-cover bg-center flex items-end"
          style={{ backgroundImage: `url(${data.customImages?.hero || photos.hero})` }}
        >
          <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
          <div className="relative max-w-6xl mx-auto px-6 w-full pb-20 pt-32">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6"
              style={{ background: `${theme.accent}26`, color: "#fff", border: `1px solid ${theme.accent}55` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
              Serving {data.area || "your area"}
            </div>
            <h1 className="text-[2.6rem] sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5 text-white max-w-2xl">
              {copy.headline}
            </h1>
            <p className="text-lg text-white/80 mb-9 max-w-xl leading-relaxed">{copy.subheadline}</p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`tel:${data.phone}`}
                style={{ background: theme.accent, color: theme.accentText }}
                className="inline-flex items-center justify-center gap-2 font-bold text-base px-8 py-4 rounded-xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition-transform"
              >
                {copy.ctaText || "Get a Free Quote"}
                <span aria-hidden>→</span>
              </a>
              <a href={`tel:${data.phone}`} className="text-white font-semibold text-base hover:text-white/80 transition-colors">
                {data.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderStats() {
    if (hidden.has("stats")) return null;
    return (
      <section key="stats" className="py-8 px-6 border-b" style={{ borderColor: `${theme.text}0d`, background: theme.card }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {statsData.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: theme.accent }}>{s.value}</div>
              <div className="text-xs font-bold uppercase tracking-[0.15em] mt-1" style={{ color: theme.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function renderAbout() {
    if (hidden.has("about")) return null;
    return (
      <section key="about" id="about" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div className="rounded-3xl overflow-hidden aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos.gallery[0]} alt={`${data.trade || "Tradesperson"} at work`} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>About us</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight">The team behind {data.businessName}</h2>
            <p className="text-lg leading-relaxed mb-6" style={{ color: theme.muted }}>{copy.about}</p>
            <div className="flex items-center gap-3 text-sm font-semibold" style={{ color: theme.text }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${theme.accent}1a`, color: theme.accent, border: `1px solid ${theme.accent}40` }}
              >✓</div>
              {guaranteeLine}
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderWhy() {
    if (hidden.has("why") || !copy.whyChooseUs?.points?.length) return null;
    return (
      <section key="why" className="py-24 px-6" style={{ background: theme.card }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>Why us</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{copy.whyChooseUs.title}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {copy.whyChooseUs.points.map((point, i) => (
              <div key={i} className="rounded-2xl p-7 text-center" style={{ background: theme.bg, border: `1px solid ${theme.text}12` }}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 mx-auto font-extrabold text-sm tracking-widest"
                  style={{ background: `${theme.accent}1a`, color: theme.accent, border: `1px solid ${theme.accent}40` }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="font-bold text-base">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderServices() {
    if (hidden.has("services")) return null;
    return (
      <section key="services" id="services" className="py-24 px-6" style={{ background: theme.card }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>What we do</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Our services</h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: theme.muted }}>{copy.servicesIntro}</p>
          </div>
          <ServicesCarousel
            theme={theme}
            items={servicesGrid.map((s, i) => {
              const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              // Match by title (case-insensitive) first, then by slug, then by index
              const detail = copy.serviceDetails?.find(
                (d) => d.title.toLowerCase() === s.toLowerCase() || d.slug === slug
              ) || copy.serviceDetails?.[i];
              const customImg = data.customImages?.services?.[slug];
              const stockFallback = getPhotoForService(s, data.trade, i);
              const pexelsPhoto = (detail as { photo?: string } | undefined)?.photo;
              return {
                title: s,
                description: detail?.description || "",
                image: customImg || pexelsPhoto || stockFallback,
                fallbackImage: customImg ? undefined : stockFallback,
                href: `/site/${data.id}/services/${slug}`,
              };
            })}
          />
        </div>
      </section>
    );
  }

  function renderProcess() {
    if (hidden.has("process") || !copy.process?.length) return null;
    return (
      <section key="process" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>How it works</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Working with {data.businessName}</h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: theme.muted }}>{copy.responsePromise}</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {copy.process.map((step, i) => (
              <div key={i} className="relative rounded-2xl p-7" style={{ background: theme.card, border: `1px solid ${theme.text}12` }}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 font-extrabold text-base"
                  style={{ background: `${theme.accent}1a`, color: theme.accent, border: `1px solid ${theme.accent}40` }}
                >{i + 1}</div>
                <p className="font-bold text-base mb-1.5">{step.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderReviews() {
    if (hidden.has("reviews") || (!data.trustpilotUrl && !data.googleReviewsUrl)) return null;
    return (
      <section key="reviews" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>What customers say</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Read our reviews</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: theme.muted }}>
              We&apos;re proud of the work we do — see what our customers have to say.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {data.trustpilotUrl && (
              <a href={data.trustpilotUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl px-8 py-6 hover:scale-[1.02] transition-transform"
                style={{ background: theme.card, border: `1px solid ${theme.text}12` }}>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-[#00b67a] text-3xl font-extrabold leading-none">★★★★★</div>
                  <div className="text-xs font-bold tracking-widest uppercase" style={{ color: "#00b67a" }}>Trustpilot</div>
                </div>
                <div>
                  <div className="font-bold text-base mb-0.5">Read our Trustpilot reviews</div>
                  <div className="text-sm" style={{ color: theme.muted }}>See what customers are saying →</div>
                </div>
              </a>
            )}
            {data.googleReviewsUrl && (
              <a href={data.googleReviewsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl px-8 py-6 hover:scale-[1.02] transition-transform"
                style={{ background: theme.card, border: `1px solid ${theme.text}12` }}>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl leading-none">⭐</div>
                  <div className="text-xs font-bold tracking-widest uppercase" style={{ color: "#4285f4" }}>Google</div>
                </div>
                <div>
                  <div className="font-bold text-base mb-0.5">Read our Google reviews</div>
                  <div className="text-sm" style={{ color: theme.muted }}>See what customers are saying →</div>
                </div>
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  function renderArea() {
    if (hidden.has("area")) return null;
    return (
      <section key="area" className="relative py-28 px-6">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${photos.gallery[1]})` }} />
        <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6"
            style={{ background: `${theme.accent}26`, color: "#fff", border: `1px solid ${theme.accent}55` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
            Service area
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight text-white">
            {copy.trustLine || `Proudly serving ${data.area || "your local area"}`}
          </h2>
          {copy.responsePromise && (
            <p className="text-white/75 text-lg leading-relaxed">{copy.responsePromise}</p>
          )}
        </div>
      </section>
    );
  }

  function renderContact() {
    return (
      <section key="contact" id="contact" className="py-24 px-6" style={{ background: theme.card }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Ready to get started?</h2>
            <p className="mb-1.5 text-base" style={{ color: theme.muted }}>{data.hours ? `${data.hours} · ` : ""}{copy.responsePromise}</p>
            <p className="text-base" style={{ color: theme.muted }}>{guaranteeLine}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            <div
              className="rounded-3xl p-10 md:p-12 relative overflow-hidden flex flex-col justify-center"
              style={{ background: theme.bg, border: `1px solid ${theme.text}14` }}
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: theme.accent }} />
              <div className="relative space-y-4">
                <a href={`tel:${data.phone}`}
                  style={{ background: theme.accent, color: theme.accentText }}
                  className="flex items-center justify-center gap-2 font-bold text-base px-10 py-4 rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.4)] hover:scale-[1.02] transition-transform">
                  Call now: {data.phone}
                </a>
                {data.email && (
                  <a href={`mailto:${data.email}`}
                    style={{ borderColor: `${theme.text}25`, color: theme.text }}
                    className="flex items-center justify-center gap-2 font-bold text-base px-10 py-4 rounded-xl border hover:opacity-80 transition-opacity">
                    Email us: {data.email}
                  </a>
                )}
                {data.address && <p className="text-sm text-center pt-2" style={{ color: theme.muted }}>{data.address}</p>}
              </div>
            </div>
            <LeadForm
              siteId={data.id}
              accent={theme.accent}
              accentText={theme.accentText}
              textColor={theme.text}
              mutedColor={theme.muted}
              cardBg={theme.bg}
              borderColor={`${theme.text}14`}
            />
          </div>
        </div>
      </section>
    );
  }

  function renderOwner() {
    if (hidden.has("owner") || !data.ownerBio) return null;
    return (
      <section key="owner" className="py-24 px-6" style={{ background: theme.card }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          {data.ownerPhotoUrl && (
            <div className="rounded-3xl overflow-hidden aspect-[4/3] order-1 md:order-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.ownerPhotoUrl} alt={data.ownerName || "Owner"} className="w-full h-full object-cover" />
            </div>
          )}
          <div className={data.ownerPhotoUrl ? "order-2 md:order-1" : ""}>
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>Meet the owner</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight">{data.ownerName || "Meet the team"}</h2>
            <p className="text-lg leading-relaxed" style={{ color: theme.muted }}>{data.ownerBio}</p>
          </div>
        </div>
      </section>
    );
  }

  function renderPhotos() {
    if (hidden.has("photos") || !data.projectPhotos?.length) return null;
    const preview = data.projectPhotos.slice(0, 3);
    const hasMore = data.projectPhotos.length > 3;
    return (
      <section key="photos" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>Our work</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">See it for yourself</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {preview.map((url, i) => (
              <div key={i} className="rounded-2xl overflow-hidden aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Project ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-10">
              <a
                href={`/site/${data.id}/work`}
                className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-opacity hover:opacity-80"
                style={{ background: theme.accent, color: theme.accentText }}
              >
                See all {data.projectPhotos.length} photos →
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    hero: renderHero,
    stats: renderStats,
    about: renderAbout,
    why: renderWhy,
    services: renderServices,
    process: renderProcess,
    reviews: renderReviews,
    area: renderArea,
    contact: renderContact,
    owner: renderOwner,
    photos: renderPhotos,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: theme.bg, color: theme.text }} className="min-h-screen font-sans antialiased">

      {/* NAV */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ borderColor: `${theme.text}10`, background: theme.navBg }}>
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          {data.logoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={data.logoUrl} alt={data.businessName} className="h-14 max-w-[220px] object-contain" />
            : <span className="text-lg font-extrabold tracking-tight">{data.businessName}</span>}
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium" style={{ color: theme.muted }}>
            <a href="#about" className="hover:opacity-70 transition-opacity">About</a>
            {copy.serviceDetails && copy.serviceDetails.length > 0 && (
              <details className="relative group">
                <summary className="list-none cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1.5 select-none">
                  We offer <span className="text-[10px] mt-0.5">▾</span>
                </summary>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72 rounded-xl overflow-hidden shadow-2xl z-40"
                  style={{ background: theme.bg, border: `1px solid ${theme.text}14` }}>
                  {copy.serviceDetails.map((s, i) => (
                    <a key={i} href={`/site/${data.id}/services/${s.slug}`}
                      className="block px-5 py-3 text-sm font-semibold hover:opacity-70 transition-opacity border-b last:border-b-0"
                      style={{ color: theme.text, borderColor: `${theme.text}0d` }}>
                      {toTitleCase(s.title)}
                    </a>
                  ))}
                </div>
              </details>
            )}
            {data.projectPhotos && data.projectPhotos.length > 0 && !hidden.has("photos") && (
              <a href={`/site/${data.id}/work`} className="hover:opacity-70 transition-opacity">Our Work</a>
            )}
            <a href="#contact" className="hover:opacity-70 transition-opacity">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            {data.email && (
              <a href={`mailto:${data.email}`}
                className="hidden md:inline text-sm font-semibold hover:opacity-70 transition-opacity"
                style={{ color: theme.muted }}>{data.email}</a>
            )}
            <a href={`tel:${data.phone}`}
              style={{ background: theme.accent, color: theme.accentText }}
              className="text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
              {data.phone}
            </a>
          </div>
        </div>
      </nav>

      {/* SECTIONS — rendered in saved order */}
      {sectionOrder.map((id) => {
        const render = sectionRenderers[id];
        return render ? render() : null;
      })}

      {/* FOOTER */}
      <footer className="py-14 px-6 border-t" style={{ borderColor: `${theme.text}10` }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-10 mb-10">
          <div>
            <p className="text-lg font-extrabold tracking-tight mb-3">{data.businessName}</p>
            <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>{guaranteeLine}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: theme.accent }}>Services</p>
            <ul className="space-y-1.5 text-sm" style={{ color: theme.muted }}>
              {servicesGrid.map((s, i) => <li key={i}>{toTitleCase(s)}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: theme.accent }}>Contact</p>
            <ul className="space-y-1.5 text-sm" style={{ color: theme.muted }}>
              <li><a href={`tel:${data.phone}`} className="hover:opacity-70 transition-opacity">{data.phone}</a></li>
              {data.email && <li><a href={`mailto:${data.email}`} className="hover:opacity-70 transition-opacity">{data.email}</a></li>}
              {data.address && <li>{data.address}</li>}
              <li>{data.area}</li>
              <li>{data.hours}</li>
              {data.licenseNumber && <li>License #{data.licenseNumber}</li>}
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t text-center" style={{ borderColor: `${theme.text}10` }}>
          <p className="text-xs" style={{ color: theme.muted }}>
            Website by{" "}
            <a href="https://pietpilot.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">PietPilot</a>
            {" "}· © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
