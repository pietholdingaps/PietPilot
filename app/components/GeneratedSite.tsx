import { SiteData } from "@/lib/siteTypes";
import { getPhotosForTrade } from "@/lib/stockPhotos";

const themes: Record<string, {
  bg: string; text: string; muted: string; card: string; accent: string; accentText: string; heroOverlay: string; font: string;
}> = {
  classic: {
    bg: "#ffffff", text: "#10182b", muted: "#5b6472", card: "#f5f7fa",
    accent: "#1d4ed8", accentText: "#ffffff", heroOverlay: "rgba(16,24,43,0.55)", font: "font-sans",
  },
  bold: {
    bg: "#0b0b10", text: "#f5f5f7", muted: "#a3a3ad", card: "#17171f",
    accent: "#f59e0b", accentText: "#0b0b10", heroOverlay: "rgba(11,11,16,0.6)", font: "font-sans",
  },
  warm: {
    bg: "#fdf6ee", text: "#3a2e26", muted: "#7a6a5d", card: "#f4e9dc",
    accent: "#e2725b", accentText: "#ffffff", heroOverlay: "rgba(58,46,38,0.45)", font: "font-sans",
  },
};

export default function GeneratedSite({ data }: { data: SiteData }) {
  const theme = themes[data.template] || themes.classic;
  const photos = getPhotosForTrade(data.trade);
  const { copy } = data;

  return (
    <div style={{ background: theme.bg, color: theme.text }} className={`min-h-screen ${theme.font}`}>
      {/* NAV */}
      <nav className="border-b" style={{ borderColor: `${theme.text}14` }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight">{data.businessName}</span>
          <a
            href={`tel:${data.phone}`}
            style={{ background: theme.accent, color: theme.accentText }}
            className="text-sm font-bold px-5 py-2.5 rounded-lg"
          >
            Call {data.phone}
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative">
        <div
          className="relative h-[480px] bg-cover bg-center flex items-center"
          style={{ backgroundImage: `url(${photos.hero})` }}
        >
          <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
          <div className="relative max-w-6xl mx-auto px-6 w-full">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-white">
                {copy.headline}
              </h1>
              <p className="text-lg text-white/80 mb-8">{copy.subheadline}</p>
              <a
                href={`tel:${data.phone}`}
                style={{ background: theme.accent, color: theme.accentText }}
                className="inline-flex items-center justify-center font-bold text-base px-8 py-4 rounded-xl"
              >
                {copy.ctaText}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST LINE */}
      <section className="py-6 px-6 border-b" style={{ borderColor: `${theme.text}10`, background: theme.card }}>
        <p className="max-w-6xl mx-auto text-center text-sm font-semibold" style={{ color: theme.muted }}>
          {copy.trustLine}
        </p>
      </section>

      {/* ABOUT */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-5">About {data.businessName}</h2>
          <p className="text-base leading-relaxed" style={{ color: theme.muted }}>{copy.about}</p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 px-6" style={{ background: theme.card }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-center">Our Services</h2>
          <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: theme.muted }}>{copy.servicesIntro}</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {copy.services.map((s, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: theme.bg, border: `1px solid ${theme.text}12` }}>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 font-bold text-sm"
                  style={{ background: theme.accent, color: theme.accentText }}
                >
                  {i + 1}
                </div>
                <p className="font-semibold text-sm">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-10 text-center">Recent Work</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {photos.gallery.map((src, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${data.trade} work example`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section className="py-20 px-6" style={{ background: theme.card }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Ready to get started?</h2>
          <p className="mb-2" style={{ color: theme.muted }}>Serving {data.area}</p>
          <p className="mb-8" style={{ color: theme.muted }}>{data.hours}</p>
          <a
            href={`tel:${data.phone}`}
            style={{ background: theme.accent, color: theme.accentText }}
            className="inline-flex items-center justify-center font-bold text-base px-9 py-4 rounded-xl"
          >
            Call now: {data.phone}
          </a>
        </div>
      </section>

      <footer className="py-8 px-6 text-center border-t" style={{ borderColor: `${theme.text}10` }}>
        <p className="text-sm font-bold">{data.businessName}</p>
        <p className="text-xs mt-1" style={{ color: theme.muted }}>
          Website by PietPilot · © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
