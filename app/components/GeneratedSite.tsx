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
    accent: "#1d4ed8", accentText: "#ffffff", heroOverlay: "linear-gradient(115deg, rgba(15,23,41,0.82) 0%, rgba(15,23,41,0.45) 55%, rgba(15,23,41,0.25) 100%)",
    navBg: "rgba(255,255,255,0.85)",
  },
  bold: {
    bg: "#0a0a0f", text: "#f5f5f7", muted: "#9d9da8", card: "#15151d",
    accent: "#f59e0b", accentText: "#0a0a0f", heroOverlay: "linear-gradient(115deg, rgba(10,10,15,0.88) 0%, rgba(10,10,15,0.5) 55%, rgba(10,10,15,0.25) 100%)",
    navBg: "rgba(10,10,15,0.75)",
  },
  warm: {
    bg: "#fdf6ee", text: "#3a2e26", muted: "#8a7a6d", card: "#f6ebdd",
    accent: "#e2725b", accentText: "#ffffff", heroOverlay: "linear-gradient(115deg, rgba(58,46,38,0.78) 0%, rgba(58,46,38,0.42) 55%, rgba(58,46,38,0.2) 100%)",
    navBg: "rgba(253,246,238,0.85)",
  },
};

export default function GeneratedSite({ data }: { data: SiteData }) {
  const theme = themes[data.template] || themes.classic;
  const photos = getPhotosForTrade(data.trade);
  const { copy } = data;

  // Show all services as carousel cards — no arbitrary limit, no text list below.
  const servicesGrid = copy.services || [];
  const hidden = new Set(data.hiddenSections || []);

  return (
    <div style={{ background: theme.bg, color: theme.text }} className="min-h-screen font-sans antialiased">
      {/* NAV */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ borderColor: `${theme.text}10`, background: theme.navBg }}>
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          {data.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoUrl} alt={data.businessName} className="h-10 max-w-[180px] object-contain" />
          ) : (
            <span className="text-lg font-extrabold tracking-tight">{data.businessName}</span>
          )}
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium" style={{ color: theme.muted }}>
            <a href="#about" className="hover:opacity-70 transition-opacity">About</a>
            <details className="relative group">
              <summary className="list-none cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1.5 select-none">
                We offer
                <span className="text-[10px] mt-0.5">▾</span>
              </summary>
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72 rounded-xl overflow-hidden shadow-2xl z-40"
                style={{ background: theme.bg, border: `1px solid ${theme.text}14` }}
              >
                {(copy.serviceDetails || []).map((s, i) => (
                  <a
                    key={i}
                    href={`/site/${data.id}/services/${s.slug}`}
                    className="block px-5 py-3 text-sm font-semibold hover:opacity-70 transition-opacity border-b last:border-b-0"
                    style={{ color: theme.text, borderColor: `${theme.text}0d` }}
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </details>
            {data.projectPhotos && data.projectPhotos.length > 0 && (
              <a href={`/site/${data.id}/work`} className="hover:opacity-70 transition-opacity">Our Work</a>
            )}
            <a href="#contact" className="hover:opacity-70 transition-opacity">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            {data.email && (
              <a
                href={`mailto:${data.email}`}
                className="hidden md:inline text-sm font-semibold hover:opacity-70 transition-opacity"
                style={{ color: theme.muted }}
              >
                {data.email}
              </a>
            )}
            <a
              href={`tel:${data.phone}`}
              style={{ background: theme.accent, color: theme.accentText }}
              className="text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
            >
              {data.phone}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative">
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
                {copy.ctaText}
                <span aria-hidden>→</span>
              </a>
              <a href={`tel:${data.phone}`} className="text-white font-semibold text-base hover:text-white/80 transition-colors">
                {data.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STATS / TRUST BADGES — always shown */}
      {(() => {
        // Use AI-generated stats if available, otherwise build sensible fallbacks
        let stats = copy.stats && copy.stats.length > 0 ? copy.stats : null;
        if (!stats) {
          const fallback: { value: string; label: string }[] = [];
          // Try to extract years from trustLine or experience text
          const yearsMatch = (copy.trustLine || "").match(/(\d+)\+?\s*year/i);
          if (yearsMatch) {
            fallback.push({ value: `${yearsMatch[1]}+`, label: "Years Experience" });
          }
          // Area
          if (data.area) {
            fallback.push({ value: data.area, label: "Service Area" });
          }
          // Hours hint
          if (data.hours) {
            fallback.push({ value: data.hours.split(",")[0].trim(), label: "Opening Hours" });
          }
          // Response promise — strip long sentences to just the key phrase
          const responseShort = (copy.responsePromise || "").replace(/\s*—.*/, "").replace("We respond within ", "").trim();
          if (responseShort) {
            fallback.push({ value: responseShort, label: "Response Time" });
          }
          // Absolute minimum — just show 3 generic badges from what we know
          if (fallback.length < 2) {
            fallback.push({ value: "100%", label: "Satisfaction Guaranteed" });
            if (data.area) fallback.push({ value: data.area, label: "Local Area" });
            fallback.push({ value: "Same Day", label: "Response Time" });
          }
          stats = fallback.slice(0, 4);
        }
        return (
          <section className="py-8 px-6 border-b" style={{ borderColor: `${theme.text}0d`, background: theme.card }}>
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: theme.accent }}>{s.value}</div>
                  <div className="text-xs font-bold uppercase tracking-[0.15em] mt-1" style={{ color: theme.muted }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* ABOUT */}
      <section id="about" className="py-24 px-6">
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
              >
                ✓
              </div>
              {copy.guaranteeLine}
            </div>
          </div>
        </div>
      </section>

      {/* OM MIG / MEET THE OWNER */}
      {data.ownerBio && !hidden.has("owner") && (
        <section className="py-24 px-6" style={{ background: theme.card }}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
            {data.ownerPhotoUrl ? (
              <div className="rounded-3xl overflow-hidden aspect-[4/3] order-1 md:order-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.ownerPhotoUrl} alt={data.ownerName || "Owner"} className="w-full h-full object-cover" />
              </div>
            ) : null}
            <div className={data.ownerPhotoUrl ? "order-2 md:order-1" : ""}>
              <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>Meet the owner</div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight">{data.ownerName || "Meet the team"}</h2>
              <p className="text-lg leading-relaxed" style={{ color: theme.muted }}>{data.ownerBio}</p>
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      {copy.whyChooseUs?.points?.length > 0 && (
        <section className="py-24 px-6" style={{ background: theme.card }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>Why us</div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{copy.whyChooseUs.title}</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {copy.whyChooseUs.points.map((point, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-7 text-center"
                  style={{ background: theme.bg, border: `1px solid ${theme.text}12` }}
                >
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
      )}

      {/* SERVICES */}
      <section id="services" className="py-24 px-6" style={{ background: theme.card }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>What we do</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Our services</h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: theme.muted }}>{copy.servicesIntro}</p>
          </div>
          <ServicesCarousel
            theme={theme}
            items={servicesGrid.map((s, i) => {
              const detail = copy.serviceDetails?.[i];
              const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              const customImg = data.customImages?.services?.[slug];
              const stockFallback = getPhotoForService(s, data.trade, i);
              const pexelsPhoto = (detail as { photo?: string } | undefined)?.photo;
              return {
                title: s,
                description: detail?.description || "Done right, on time, every time.",
                image: customImg || pexelsPhoto || stockFallback,
                fallbackImage: customImg ? undefined : stockFallback,
                href: detail?.slug ? `/site/${data.id}/services/${detail.slug}` : undefined,
              };
            })}
          />

        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24 px-6">
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
                >
                  {i + 1}
                </div>
                <p className="font-bold text-base mb-1.5">{step.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS / TESTIMONIALS */}
      {data.reviews && data.reviews.length > 0 && !hidden.has("reviews") && (
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>What customers say</div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Reviews</h2>
            </div>
            {data.reviews.length === 1 ? (
              /* Single review — featured centered quote */
              <div className="max-w-2xl mx-auto text-center">
                <div className="text-3xl mb-6" style={{ color: theme.accent }}>★★★★★</div>
                <p className="text-xl md:text-2xl font-medium leading-relaxed mb-6" style={{ color: theme.text }}>
                  &ldquo;{data.reviews[0].text}&rdquo;
                </p>
                {data.reviews[0].author && (
                  <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: theme.muted }}>
                    — {data.reviews[0].author}
                  </p>
                )}
              </div>
            ) : (
              /* Multiple reviews — grid */
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {data.reviews.map((r, i) => (
                  <div key={i} className="rounded-2xl p-7" style={{ background: theme.card, border: `1px solid ${theme.text}12` }}>
                    <div className="mb-4" style={{ color: theme.accent }}>★★★★★</div>
                    <p className="text-base leading-relaxed mb-5" style={{ color: theme.text }}>&ldquo;{r.text}&rdquo;</p>
                    {r.author && (
                      <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: theme.muted }}>— {r.author}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SERVICE AREA BANNER */}
      <section className="relative py-28 px-6">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${photos.gallery[1]})` }}
        />
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
          <p className="text-white/80 text-lg leading-relaxed">{data.area}</p>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section id="contact" className="py-24 px-6" style={{ background: theme.card }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Ready to get started?</h2>
            <p className="mb-1.5 text-base" style={{ color: theme.muted }}>{data.hours} · {copy.responsePromise}</p>
            <p className="text-base" style={{ color: theme.muted }}>{copy.guaranteeLine}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            <div
              className="rounded-3xl p-10 md:p-12 relative overflow-hidden flex flex-col justify-center"
              style={{ background: theme.bg, border: `1px solid ${theme.text}14` }}
            >
              <div
                className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20"
                style={{ background: theme.accent }}
              />
              <div className="relative space-y-4">
                <a
                  href={`tel:${data.phone}`}
                  style={{ background: theme.accent, color: theme.accentText }}
                  className="flex items-center justify-center gap-2 font-bold text-base px-10 py-4.5 rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.4)] hover:scale-[1.02] transition-transform"
                >
                  Call now: {data.phone}
                </a>
                {data.email && (
                  <a
                    href={`mailto:${data.email}`}
                    style={{ borderColor: `${theme.text}25`, color: theme.text }}
                    className="flex items-center justify-center gap-2 font-bold text-base px-10 py-4.5 rounded-xl border hover:opacity-80 transition-opacity"
                  >
                    Email us: {data.email}
                  </a>
                )}
                {data.address && (
                  <p className="text-sm text-center pt-2" style={{ color: theme.muted }}>{data.address}</p>
                )}
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

      <footer className="py-14 px-6 border-t" style={{ borderColor: `${theme.text}10` }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-10 mb-10">
          <div>
            <p className="text-lg font-extrabold tracking-tight mb-3">{data.businessName}</p>
            <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>{copy.guaranteeLine}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: theme.accent }}>Services</p>
            <ul className="space-y-1.5 text-sm" style={{ color: theme.muted }}>
              {servicesGrid.slice(0, 5).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: theme.accent }}>Contact</p>
            <ul className="space-y-1.5 text-sm" style={{ color: theme.muted }}>
              <li><a href={`tel:${data.phone}`} className="hover:opacity-70 transition-opacity">{data.phone}</a></li>
              {data.email && (
                <li><a href={`mailto:${data.email}`} className="hover:opacity-70 transition-opacity">{data.email}</a></li>
              )}
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
            <a href="https://pietpilot.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              PietPilot
            </a>{" "}
            · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
