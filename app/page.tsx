import ScrollReveal from "./components/ScrollReveal";
import WaitlistForm from "./components/WaitlistForm";

// ── Icons (inline SVG to avoid import issues) ──────────────────────────────
const IconGlobe = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IconZap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconTrendingUp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconMessageSquare = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

// ── Data ───────────────────────────────────────────────────────────────────
const features = [
  {
    icon: <IconGlobe />,
    title: "AI Website in 5 Minutes",
    desc: "Answer 10 questions. Our AI writes your copy, builds your pages, handles SEO, and goes live — before your coffee gets cold.",
    tag: "Starter",
  },
  {
    icon: <IconTrendingUp />,
    title: "Google Ads on Autopilot",
    desc: "Connect your account and AI takes over. It sets up campaigns, writes ads, adjusts bids, and shows you exactly what you're getting.",
    tag: "Growth",
  },
  {
    icon: <IconMessageSquare />,
    title: "Never Miss a Lead Again",
    desc: "Missed a call on a job site? An automated text fires in seconds. Every inquiry gets followed up — in your voice, automatically.",
    tag: "Pro",
  },
  {
    icon: <IconZap />,
    title: "One Dashboard, Everything",
    desc: "Leads, ad spend, cost per lead, site visitors — all in one place. No spreadsheets. No agency reports. Just real numbers.",
    tag: "All plans",
  },
  {
    icon: <IconShield />,
    title: "Everything in One Place",
    desc: "Your site, your ad performance, and your leads — all together, so you always know exactly what's working.",
    tag: "All plans",
  },
  {
    icon: <IconCheck />,
    title: "Month to Month",
    desc: "No contracts, no setup fees. Cancel whenever you want — we'd rather earn your business every month.",
    tag: "All plans",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$149",
    desc: "Look professional online. Get found locally.",
    features: [
      "AI-built professional website",
      "Local SEO built in from day one",
      "Mobile-optimized, always",
      "Contact & booking form",
      "Hosted & updated for you",
      "Free setup, cancel anytime",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$249",
    desc: "Get in front of customers searching right now.",
    features: [
      "Everything in Starter",
      "Google Ads — set up by AI",
      "Campaigns managed automatically",
      "Live dashboard: leads, ROAS, cost",
      "Ad history stays with you",
      "Priority support",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$399",
    desc: "Close every lead, even when you're on the job.",
    features: [
      "Everything in Growth",
      "Auto SMS + email follow-up",
      "Missed call? Auto-text in seconds",
      "AI writes messages in your tone",
      "Full lead history & tracking",
      "Dedicated onboarding call",
    ],
    cta: "Get Started",
    highlight: false,
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#080808]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            Piet<span className="gradient-text">Pilot</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <a
            href="#pricing"
            className="relative overflow-hidden group bg-[#ff6b2b] hover:bg-[#ff7d42] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors glow-orange-sm"
          >
            Get Started →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-28 px-6 grid-bg overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#ff6b2b]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-[#ff9900]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 text-white/70 text-xs font-medium px-4 py-2 rounded-full mb-10 backdrop-blur">
            <span className="relative w-2 h-2">
              <span className="absolute inset-0 bg-[#ff6b2b] rounded-full" />
              <span className="absolute inset-0 bg-[#ff6b2b] rounded-full animate-ping opacity-75" />
            </span>
            Built for plumbers, electricians, HVAC &amp; roofers in the US
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-[72px] font-black leading-[1.05] tracking-tight mb-6 text-white">
            A website that brings in customers.
            <br />
            <span className="text-[#ff6b2b]">Google Ads that bring in jobs.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            We build your website and run your Google Ads — done for you,
            for one simple monthly price. No agency. No tech skills needed.
          </p>

          {/* What you get — dead simple */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 mb-12 max-w-2xl mx-auto">
            <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/10 px-6 py-5 text-left">
              <div className="flex items-center gap-2 text-[#ff6b2b] font-bold text-sm mb-1">
                <IconGlobe /> A professional website
              </div>
              <p className="text-white/40 text-sm">Live in days. Hosted and updated for you.</p>
            </div>
            <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/10 px-6 py-5 text-left">
              <div className="flex items-center gap-2 text-[#ff6b2b] font-bold text-sm mb-1">
                <IconTrendingUp /> Google Ads, up and running
              </div>
              <p className="text-white/40 text-sm">Set up and managed for you. Real customers, real jobs.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mb-6">
            <WaitlistForm />
          </div>

          <p className="text-sm text-white/25">
            From $149/month · No contracts · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#ff6b2b]">The Problem</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-center leading-tight tracking-tight mb-8">
              Your agency is{" "}
              <span className="gradient-text">charging you a fortune</span>
              <br />
              and delivering nothing.
            </h2>
            <p className="text-center text-white/40 text-lg max-w-2xl mx-auto mb-16">
              The average tradesperson pays $800–$2,000/month for a website they don&apos;t own,
              ads they can&apos;t see, and a rep who ghosts them after the sale.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              ["$800–$2,000/mo", "for a website you don't even own"],
              ["Weeks of waiting", "for changes that should take minutes"],
              ["No idea what's working", "just a PDF report once a month"],
            ].map(([title, sub]) => (
              <div key={title} className="px-4">
                <div className="text-white/80 text-lg font-bold mb-1">{title}</div>
                <div className="text-white/35 text-sm">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#ff6b2b]">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-center tracking-tight mb-4">
              From signup to live site
              <br />
              <span className="gradient-text">in under 5 minutes.</span>
            </h2>
            <p className="text-center text-white/40 text-base max-w-xl mx-auto mb-20">
              No tech skills. No waiting on an agency. No back-and-forth emails.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Answer 10 questions",
                desc: "Your name, location, services, phone number. Plain English. Takes less time than a coffee order.",
              },
              {
                num: "02",
                title: "AI builds your site",
                desc: "Our AI writes professional copy, structures your pages, bakes in local SEO, and publishes it — instantly.",
              },
              {
                num: "03",
                title: "Leads start coming in",
                desc: "Your site is live, your ads are running, and every inquiry gets an automatic follow-up. You just pick up the phone.",
              },
            ].map(({ num, title, desc }, i) => (
              <ScrollReveal key={num} delay={i * 100}>
                <div className="card-hover rounded-2xl bg-white/[0.02] p-8 h-full relative overflow-hidden group">
                  <div className="absolute -top-4 -right-2 text-[100px] font-black text-white/[0.03] leading-none select-none group-hover:text-white/[0.05] transition-colors">
                    {num}
                  </div>
                  <div className="relative">
                    <div className="text-5xl font-black gradient-text mb-6">{num}</div>
                    <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#ff6b2b]">Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-center tracking-tight mb-4">
              Everything your agency does.
              <br />
              <span className="gradient-text">Automated. At a fraction of the price.</span>
            </h2>
            <p className="text-center text-white/40 text-base max-w-xl mx-auto mb-20">
              No junior account managers. No monthly PDF reports. Just AI that actually works.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon, title, desc, tag }, i) => (
              <ScrollReveal key={title} delay={i * 70}>
                <div className="card-hover rounded-2xl bg-white/[0.02] p-7 h-full">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#ff6b2b]/10 border border-[#ff6b2b]/20 flex items-center justify-center text-[#ff6b2b]">
                      {icon}
                    </div>
                    <span className="text-[10px] font-semibold text-white/20 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      {tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#ff6b2b]">Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-center tracking-tight mb-4">
              Simple pricing.
              <br />
              <span className="gradient-text">No surprises, ever.</span>
            </h2>
            <p className="text-center text-white/40 text-base max-w-xl mx-auto mb-20">
              No setup fees. No contracts. Switch plans or cancel anytime.
              Save 2 months with annual billing.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map(({ name, price, desc, features: feats, cta, highlight }, i) => (
              <ScrollReveal key={name} delay={i * 100}>
                <div className={`rounded-2xl p-8 h-full flex flex-col relative overflow-hidden ${
                  highlight
                    ? "bg-[#ff6b2b]/5 border-2 border-[#ff6b2b]/50 glow-orange"
                    : "bg-white/[0.02] border border-white/8"
                }`}>
                  {highlight && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b2b]/60 to-transparent" />
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-[#ff6b2b] text-white text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-widest">
                          Most Popular
                        </span>
                      </div>
                    </>
                  )}

                  <div className="mb-6 mt-2">
                    <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${highlight ? "text-[#ff6b2b]" : "text-white/30"}`}>
                      {name}
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-5xl font-black text-white">{price}</span>
                      <span className="text-white/30 text-base mb-2">/mo</span>
                    </div>
                    <p className="text-white/40 text-sm">{desc}</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {feats.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <span className={`mt-0.5 flex-shrink-0 ${highlight ? "text-[#ff6b2b]" : "text-white/30"}`}>
                          <IconCheck />
                        </span>
                        <span className="text-white/60">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#get-started"
                    className={`block text-center text-sm font-bold py-3.5 rounded-xl transition-all ${
                      highlight
                        ? "bg-[#ff6b2b] hover:bg-[#ff7d42] text-white glow-orange-sm hover:scale-[1.02]"
                        : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                    }`}
                  >
                    {cta}
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARLY ACCESS ── */}
      <section className="py-28 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#ff6b2b] mb-4">Early Access</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              We&apos;re onboarding our first tradespeople now.
            </h2>
            <p className="text-white/40 text-lg leading-relaxed">
              PietPilot is brand new — and that&apos;s good news for you. Early members
              get priority setup, direct access to us, and pricing that won&apos;t
              change as we grow.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="get-started" className="py-28 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#ff6b2b]/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#ff6b2b] mb-6">Get Started</div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
              Your next customer is
              <br />
              <span className="gradient-text">searching right now.</span>
            </h2>
            <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto">
              Get your professional website live in under 5 minutes.
              No agency. No contract. Just more jobs.
            </p>
            <WaitlistForm />
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <span className="text-base font-bold text-white/60">
          Piet<span className="gradient-text">Pilot</span>
        </span>
        <p className="text-white/15 text-xs mt-2">
          © 2026 PietPilot · pietpilot.com
        </p>
      </footer>
    </div>
  );
}
