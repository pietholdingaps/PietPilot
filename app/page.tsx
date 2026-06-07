import ScrollReveal from "./components/ScrollReveal";
import WaitlistForm from "./components/WaitlistForm";

// ── Icons ──────────────────────────────────────────────────────────────────
const IconGlobe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IconTrendingUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconMessageSquare = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconLayout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
  </svg>
);
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── Data ───────────────────────────────────────────────────────────────────
const features = [
  {
    icon: <IconGlobe />,
    title: "A site that works for you",
    desc: "Built around your services and your area, written to turn visitors into phone calls — not just a digital business card.",
  },
  {
    icon: <IconTrendingUp />,
    title: "Ads that find the job",
    desc: "We set up and manage Google Ads so you show up when someone nearby searches for what you do, right now.",
  },
  {
    icon: <IconMessageSquare />,
    title: "Follow-up that doesn't sleep",
    desc: "Missed a call on the job? An automatic text goes out in seconds, so the lead doesn't go to the next guy.",
  },
  {
    icon: <IconLayout />,
    title: "One place for everything",
    desc: "Leads, ad spend, results — in plain English, in one dashboard. No spreadsheets, no jargon, no guessing.",
  },
  {
    icon: <IconClock />,
    title: "Live in days, not months",
    desc: "No waiting weeks on an agency. Tell us about your business and we get you up and running fast.",
  },
  {
    icon: <IconCheck />,
    title: "No contracts",
    desc: "Month to month, cancel anytime. We'd rather earn your business every single month than lock you in.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$149",
    desc: "A professional website that brings in calls.",
    features: [
      "Website built for your business",
      "Local SEO from day one",
      "Works great on phones",
      "Booking & contact form",
      "Hosted and kept up to date",
    ],
    highlight: false,
  },
  {
    name: "Growth",
    price: "$249",
    desc: "Show up when customers are searching.",
    features: [
      "Everything in Starter",
      "Google Ads set up & managed",
      "Campaigns improved over time",
      "Simple dashboard for results",
      "Your ad history stays yours",
    ],
    highlight: true,
  },
  {
    name: "Pro",
    price: "$399",
    desc: "Never let a lead slip through the cracks.",
    features: [
      "Everything in Growth",
      "Automatic SMS & email follow-up",
      "Missed-call auto-text",
      "Messages written in your tone",
      "Full lead history & tracking",
    ],
    highlight: false,
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-[#0b1220]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            Piet<span className="text-[#38bdf8]">Pilot</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/55">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <a
            href="#pricing"
            className="bg-[#38bdf8] hover:bg-[#5cc8fa] text-[#0b1220] text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/[0.05] border border-white/10 text-white/55 text-xs font-medium px-4 py-2 rounded-full mb-10">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
            Built for plumbers, electricians, HVAC &amp; roofers in the US
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[58px] font-extrabold leading-[1.1] tracking-tight mb-6">
            A website that brings in customers.
            <br />
            <span className="text-[#38bdf8]">Google Ads that bring in jobs.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            We build your website and run your Google Ads — done for you,
            for one simple monthly price. No agency. No tech skills needed.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 mb-12 max-w-2xl mx-auto">
            <div className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 px-6 py-5 text-left">
              <div className="flex items-center gap-2 text-[#38bdf8] font-bold text-sm mb-1">
                <IconGlobe /> A professional website
              </div>
              <p className="text-white/45 text-sm">Live in days. Hosted and updated for you.</p>
            </div>
            <div className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 px-6 py-5 text-left">
              <div className="flex items-center gap-2 text-[#38bdf8] font-bold text-sm mb-1">
                <IconTrendingUp /> Google Ads, up and running
              </div>
              <p className="text-white/45 text-sm">Set up and managed for you. Real customers, real jobs.</p>
            </div>
          </div>

          <div className="mb-6">
            <WaitlistForm />
          </div>

          <p className="text-sm text-white/30">
            From $149/month · No contracts · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#38bdf8]">The Problem</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center leading-tight tracking-tight mb-8">
              Your agency is charging a fortune
              <br />
              and delivering nothing.
            </h2>
            <p className="text-center text-white/45 text-lg max-w-2xl mx-auto mb-16">
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
                <div className="text-white text-lg font-bold mb-1">{title}</div>
                <div className="text-white/40 text-sm">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#38bdf8]">How It Works</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center tracking-tight mb-4">
              From signup to live site in under 5 minutes.
            </h2>
            <p className="text-center text-white/45 text-base max-w-xl mx-auto mb-16">
              No tech skills. No waiting on an agency. No back-and-forth emails.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Tell us about your business", desc: "Your name, location, services, phone number. Plain English — takes minutes." },
              { num: "02", title: "We build your site", desc: "Professional copy, clean pages, local SEO baked in — built and published for you." },
              { num: "03", title: "Leads start coming in", desc: "Your site is live, your ads are running, and every inquiry gets followed up." },
            ].map(({ num, title, desc }, i) => (
              <ScrollReveal key={num} delay={i * 100}>
                <div className="card rounded-2xl p-8 h-full">
                  <div className="text-3xl font-extrabold text-[#38bdf8] mb-5">{num}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#38bdf8]">Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center tracking-tight mb-4">
              Everything your agency does — for a fraction of the price.
            </h2>
            <p className="text-center text-white/45 text-base max-w-xl mx-auto mb-16">
              No account managers. No monthly PDF reports. Just a system that works for you.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon, title, desc }, i) => (
              <ScrollReveal key={title} delay={i * 70}>
                <div className="card rounded-2xl p-7 h-full">
                  <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/25 flex items-center justify-center text-[#38bdf8] mb-5">
                    {icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#38bdf8]">Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center tracking-tight mb-4">
              Simple pricing. No surprises, ever.
            </h2>
            <p className="text-center text-white/45 text-base max-w-xl mx-auto mb-16">
              No setup fees. No contracts. Switch plans or cancel anytime.
              Save 2 months with annual billing.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map(({ name, price, desc, features: feats, highlight }, i) => (
              <ScrollReveal key={name} delay={i * 100}>
                <div className={`rounded-2xl p-8 h-full flex flex-col relative ${
                  highlight ? "bg-[#121b2e] border-2 border-[#38bdf8]" : "card"
                }`}>
                  {highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-[#38bdf8] text-[#0b1220] text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-widest">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6 mt-2">
                    <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${highlight ? "text-[#38bdf8]" : "text-white/35"}`}>
                      {name}
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-5xl font-extrabold text-white">{price}</span>
                      <span className="text-white/35 text-base mb-2">/mo</span>
                    </div>
                    <p className="text-white/45 text-sm">{desc}</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {feats.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <span className={`mt-0.5 flex-shrink-0 ${highlight ? "text-[#38bdf8]" : "text-white/30"}`}>
                          <IconCheck />
                        </span>
                        <span className="text-white/65">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#get-started"
                    className={`block text-center text-sm font-bold py-3.5 rounded-xl transition-all ${
                      highlight
                        ? "bg-[#38bdf8] hover:bg-[#5cc8fa] text-[#0b1220]"
                        : "bg-white/[0.06] hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                    }`}
                  >
                    Get Started
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARLY ACCESS ── */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#38bdf8] mb-4">Early Access</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
              We&apos;re onboarding our first tradespeople now.
            </h2>
            <p className="text-white/45 text-lg leading-relaxed">
              PietPilot is brand new — and that&apos;s good news for you. Early members
              get priority setup, direct access to us, and pricing that won&apos;t
              change as we grow.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="get-started" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="relative max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#38bdf8] mb-6">Get Started</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Your next customer is searching right now.
            </h2>
            <p className="text-white/45 text-lg mb-12 max-w-xl mx-auto">
              Get your professional website live in under 5 minutes.
              No agency. No contract. Just more jobs.
            </p>
            <WaitlistForm />
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-white/[0.06] text-center">
        <span className="text-base font-bold text-white/70">
          Piet<span className="text-[#38bdf8]">Pilot</span>
        </span>
        <p className="text-white/30 text-xs mt-2">
          © 2026 PietPilot · pietpilot.com
        </p>
      </footer>
    </div>
  );
}
