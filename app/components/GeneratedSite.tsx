import { SiteData } from "@/lib/siteTypes";
import { getPhotosForTrade } from "@/lib/stockPhotos";

export const themes: Record<string, {
  bg: string; text: string; muted: string; card: string; accent: string; accentText: string; heroOverlay: string; navBg: string;
}> = {
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

  // Always show exactly 6 services in a clean 3x2 grid. If the AI returned
  // fewer, pad with sensible generic ones; if more, trim.
  const fallbackExtras = ["Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs", "Free estimates", "Maintenance plans"];
  const services = [...(copy.services || [])];
  for (const extra of fallbackExtras) {
    if (services.length >= 6) break;
    if (!services.includes(extra)) services.push(extra);
  }
  const servicesGrid = services.slice(0, 6);

  return (
    <div style={{ background: theme.bg, color: theme.text }} className="min-h-screen font-sans antialiased">
      {/* NAV */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ borderColor: `${theme.text}10`, background: theme.navBg }}>
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <span className="text-lg font-extrabold tracking-tight">{data.businessName}</span>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium" style={{ color: theme.muted }}>
            <a href="#about" className="hover:opacity-70 transition-opacity">About</a>
            <a href="#services" className="hover:opacity-70 transition-opacity">Services</a>
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
          style={{ backgroundImage: `url(${photos.hero})` }}
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

      {/* TRUST BAR */}
      <section className="py-5 px-6 border-b" style={{ borderColor: `${theme.text}0d`, background: theme.card }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-center">
          <p className="text-sm font-semibold tracking-wide" style={{ color: theme.muted }}>{copy.trustLine}</p>
          <span className="hidden sm:inline w-1 h-1 rounded-full" style={{ background: `${theme.muted}66` }} />
          <p className="text-sm font-semibold tracking-wide" style={{ color: theme.muted }}>{data.hours}</p>
          <span className="hidden sm:inline w-1 h-1 rounded-full" style={{ background: `${theme.muted}66` }} />
          <p className="text-sm font-semibold tracking-wide" style={{ color: theme.muted }}>{copy.responsePromise}</p>
        </div>
      </section>

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

      {/* SERVICES */}
      <section id="services" className="py-24 px-6" style={{ background: theme.card }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>What we do</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Our services</h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: theme.muted }}>{copy.servicesIntro}</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {servicesGrid.map((s, i) => {
              const detail = copy.serviceDetails?.[i];
              const href = detail?.slug ? `/site/${data.id}/services/${detail.slug}` : undefined;
              const Card = (
                <div
                  className="group rounded-2xl p-7 transition-all hover:-translate-y-1 h-full"
                  style={{ background: theme.bg, border: `1px solid ${theme.text}12` }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 font-extrabold text-base transition-transform group-hover:scale-110"
                    style={{ background: `${theme.accent}1a`, color: theme.accent, border: `1px solid ${theme.accent}40` }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="font-bold text-base mb-1.5">{s}</p>
                  <p className="text-sm" style={{ color: theme.muted }}>
                    {href ? "Learn more →" : "Done right, on time, every time."}
                  </p>
                </div>
              );
              return href ? (
                <a key={i} href={href} className="block h-full">
                  {Card}
                </a>
              ) : (
                <div key={i}>{Card}</div>
              );
            })}
          </div>
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
            Proudly serving {data.area || "your local area"}
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">{copy.trustLine}</p>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section id="contact" className="py-24 px-6" style={{ background: theme.card }}>
        <div
          className="max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          style={{ background: theme.bg, border: `1px solid ${theme.text}14` }}
        >
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ background: theme.accent }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Ready to get started?</h2>
            <p className="mb-1.5 text-base" style={{ color: theme.muted }}>{data.hours} · {copy.responsePromise}</p>
            <p className="mb-9 text-base" style={{ color: theme.muted }}>{copy.guaranteeLine}</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`tel:${data.phone}`}
                style={{ background: theme.accent, color: theme.accentText }}
                className="inline-flex items-center justify-center gap-2 font-bold text-base px-10 py-4.5 rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.4)] hover:scale-[1.02] transition-transform"
              >
                Call now: {data.phone}
              </a>
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  style={{ borderColor: `${theme.text}25`, color: theme.text }}
                  className="inline-flex items-center justify-center gap-2 font-bold text-base px-10 py-4.5 rounded-xl border hover:opacity-80 transition-opacity"
                >
                  Email us: {data.email}
                </a>
              )}
            </div>
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
              <li>{data.area}</li>
              <li>{data.hours}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t text-center" style={{ borderColor: `${theme.text}10` }}>
          <p className="text-xs" style={{ color: theme.muted }}>
            Website by PietPilot · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
