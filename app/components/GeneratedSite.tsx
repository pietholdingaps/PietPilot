import { SiteData } from "@/lib/siteTypes";
import { getPhotosForTrade } from "@/lib/stockPhotos";

const themes: Record<string, {
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
  const initials = (data.businessName || "P P").split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  return (
    <div style={{ background: theme.bg, color: theme.text }} className="min-h-screen font-sans antialiased">
      {/* NAV */}
      <nav className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ borderColor: `${theme.text}10`, background: theme.navBg }}>
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-sm"
              style={{ background: theme.accent, color: theme.accentText }}
            >
              {initials || "PP"}
            </div>
            <span className="text-lg font-extrabold tracking-tight">{data.businessName}</span>
          </div>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium" style={{ color: theme.muted }}>
            <span>About</span>
            <span>Services</span>
            <span>Work</span>
            <span>Contact</span>
          </div>
          <a
            href={`tel:${data.phone}`}
            style={{ background: theme.accent, color: theme.accentText }}
            className="text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
          >
            {data.phone}
          </a>
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
          <span className="hidden sm:inline w-1 h-1 rounded-full" style={{ background: `${theme.muted}66` }} />
          <p className="text-sm font-semibold tracking-wide" style={{ color: theme.muted }}>{copy.guaranteeLine}</p>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>About us</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight">The team behind {data.businessName}</h2>
          <p className="text-lg leading-relaxed" style={{ color: theme.muted }}>{copy.about}</p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 px-6" style={{ background: theme.card }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>What we do</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Our services</h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: theme.muted }}>{copy.servicesIntro}</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {copy.services.map((s, i) => (
              <div
                key={i}
                className="group rounded-2xl p-7 transition-all hover:-translate-y-1"
                style={{ background: theme.bg, border: `1px solid ${theme.text}12` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 font-extrabold text-base transition-transform group-hover:scale-110"
                  style={{ background: `${theme.accent}1a`, color: theme.accent, border: `1px solid ${theme.accent}40` }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="font-bold text-base mb-1.5">{s}</p>
                <p className="text-sm" style={{ color: theme.muted }}>Done right, on time, every time.</p>
              </div>
            ))}
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

      {/* GALLERY */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: theme.accent }}>Our work</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Recent projects</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {photos.gallery.map((src, i) => (
              <div key={i} className="group aspect-[4/3] rounded-2xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${data.trade || "Project"} example ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.45), transparent 60%)" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section className="py-24 px-6" style={{ background: theme.card }}>
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
            <p className="mb-1.5 text-base" style={{ color: theme.muted }}>Proudly serving {data.area}</p>
            <p className="mb-1.5 text-base" style={{ color: theme.muted }}>{data.hours} · {copy.responsePromise}</p>
            <p className="mb-9 text-base" style={{ color: theme.muted }}>{copy.guaranteeLine}</p>
            <a
              href={`tel:${data.phone}`}
              style={{ background: theme.accent, color: theme.accentText }}
              className="inline-flex items-center justify-center gap-2 font-bold text-base px-10 py-4.5 rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.4)] hover:scale-[1.02] transition-transform"
            >
              Call now: {data.phone}
            </a>
          </div>
        </div>
      </section>

      <footer className="py-10 px-6 text-center border-t" style={{ borderColor: `${theme.text}10` }}>
        <p className="text-base font-extrabold tracking-tight mb-1">{data.businessName}</p>
        <p className="text-xs" style={{ color: theme.muted }}>
          Website by PietPilot · © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
