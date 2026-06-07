import ScrollReveal from "./components/ScrollReveal";
import WaitlistForm from "./components/WaitlistForm";

// ── Icons (inline SVG) ─────────────────────────────────────────────────────
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
    desc: "Answer a few questions about your business. We write the copy, build the pages, handle local SEO, and put it live.",
    tag: "Starter",
  },
  {
    icon: <IconTrendingUp />,
    title: "Google Ads, Managed for You",
    desc: "Connect your account and we take it from there — campaigns built, ads written, budgets managed, results tracked.",
    tag: "Growth",
  },
  {
    icon: <IconMessageSquare />,
    title: "Never Miss a Lead",
    desc: "Missed a call on the job? An automatic text goes out right away, and every inquiry gets a timely follow-up.",
    tag: "Pro",
  },
  {
    icon: <IconZap />,
    title: "One Simple Dashboard",
    desc: "Leads, ad spend, cost per lead, site visits — all in one place, in plain English. No spreadsheets, no jargon.",
    tag: "All plans",
  },
  {
    icon: <IconShield />,
    title: "Hosted & Kept Up to Date",
    desc: "We host your site and keep it running and current — you never have to think about it.",
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
      "Professional website, built for you",
      "Local SEO built in from day one",
      "Mobile-friendly, always",
      "Contact & booking form",
      "Hosted & kept up to date",
      "Cancel anytime",
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
      "Google Ads set up and managed",
      "Campaigns optimized over time",
      "Simple dashboard: leads, cost, results",
      "Your ad history stays with you",
      "Priority support",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$399",
    desc: "Follow up on every lead, even on the job.",
    features: [
      "Everything in Growth",
      "Automatic SMS + email follow-up",
      "Missed call? Auto-text in seconds",
      "Messages written in your tone",
      "Full lead history & tracking",
      "Personal onboarding call",
    ],
    cta: "Get Started",
    highlight: false,
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f2ec] text-[#1b2430] overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1b2430]/8 backdrop-blur-xl bg-[#f7f2ec]/85">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            Piet<span className="text-[#c75d3c]">Pilot</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#1b2430]/60">
            <a href="#how-it-works" className="hover:text-[#1b2430] transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-[#1b2430] transition-colors">Pricing</a>
          </div>
          <a
            href="#pricing"
            className="bg-[#c75d3c] hover:bg-[#b44f30] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Get Started →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-white border border-[#1b2430]/10 text-[#1b2430]/60 text-xs font-medium px-4 py-2 rounded-full mb-10">
            <span className="w-2 h-2 rounded-full bg-[#c75d3c]" />
            Built for plumbers, electricians, HVAC &amp; roofers in the US
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-[60px] font-extrabold leading-[1.1] tracking-tight mb-6 text-[#1b2430]">
            A website that brings in customers.
            <br />
            <span className="text-[#c75d3c]">Google Ads that bring in jobs.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#1b2430]/55 max-w-2xl mx-auto mb-12 leading-relaxed">
            We build your website and run your Google Ads — done for you,
            for one simple monthly price. No agency. No tech skills needed.
          </p>

          {/* What you get — dead simple */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 mb-12 max-w-2xl mx-auto">
            <div className="flex-1 rounded-xl bg-white border border-[#1b2430]/8 px-6 py-5 text-left">
              <div className="flex items-center gap-2 text-[#c75d3c] font-bold text-sm mb-1">
                <IconGlobe /> A professional website
              </div>
              <p className="text-[#1b2430]/45 text-sm">Live in days. Hosted and updated for you.</p>
            </div>
            <div className="flex-1 rounded-xl bg-white border border-[#1b2430]/8 px-6 py-5 text-left">
              <div className="flex items-center gap-2 text-[#c75d3c] font-bold text-sm mb-1">
                <IconTrendingUp /> Google Ads, up and running
              </div>
              <p className="text-[#1b2430]/45 text-sm">Set up and managed for you. Real customers, real jobs.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mb-6">
            <WaitlistForm />
          </div>

          <p className="text-sm text-[#1b2430]/35">
            From $149/month · No contracts · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-24 px-6 border-t border-[#1b2430]/8">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#c75d3c]">The Problem</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center leading-tight tracking-tight mb-8 text-[#1b2430]">
              Your agency is charging you a fortune
              <br />
              and delivering nothing.
            </h2>
            <p className="text-center text-[#1b2430]/45 text-lg max-w-2xl mx-auto mb-16">
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
                <div className="text-[#1b2430] text-lg font-bold mb-1">{title}</div>
                <div className="text-[#1b2430]/40 text-sm">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-[#1b2430]/8">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#c75d3c]">How It Works</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center tracking-tight mb-4 text-[#1b2430]">
              From signup to live site in under 5 minutes.
            </h2>
            <p className="text-center text-[#1b2430]/45 text-base max-w-xl mx-auto mb-16">
              No tech skills. No waiting on an agency. No back-and-forth emails.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Tell us about your business",
                desc: "Your name, location, services, phone number. Plain English. Takes less time than a coffee order.",
              },
              {
                num: "02",
                title: "We build your site",
                desc: "Professional copy, clean pages, local SEO baked in — built and published for you.",
              },
              {
                num: "03",
                title: "Leads start coming in",
                desc: "Your site is live, your ads are running, and every inquiry gets followed up. You just pick up the phone.",
              },
            ].map(({ num, title, desc }, i) => (
              <ScrollReveal key={num} delay={i * 100}>
                <div className="card-hover rounded-2xl bg-white p-8 h-full">
                  <div className="text-3xl font-extrabold text-[#c75d3c] mb-5">{num}</div>
                  <h3 className="text-lg font-bold text-[#1b2430] mb-3">{title}</h3>
                  <p className="text-[#1b2430]/45 text-sm leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 border-t border-[#1b2430]/8">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#c75d3c]">Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center tracking-tight mb-4 text-[#1b2430]">
              Everything your agency does — for a fraction of the price.
            </h2>
            <p className="text-center text-[#1b2430]/45 text-base max-w-xl mx-auto mb-16">
              No account managers. No monthly PDF reports. Just a system that works for you.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon, title, desc, tag }, i) => (
              <ScrollReveal key={title} delay={i * 70}>
                <div className="card-hover rounded-2xl bg-white p-7 h-full">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#c75d3c]/10 border border-[#c75d3c]/20 flex items-center justify-center text-[#c75d3c]">
                      {icon}
                    </div>
                    <span className="text-[10px] font-semibold text-[#1b2430]/35 bg-[#1b2430]/5 px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1b2430] mb-2">{title}</h3>
                  <p className="text-[#1b2430]/45 text-sm leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6 border-t border-[#1b2430]/8">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#c75d3c]">Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center tracking-tight mb-4 text-[#1b2430]">
              Simple pricing. No surprises, ever.
            </h2>
            <p className="text-center text-[#1b2430]/45 text-base max-w-xl mx-auto mb-16">
              No setup fees. No contracts. Switch plans or cancel anytime.
              Save 2 months with annual billing.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map(({ name, price, desc, features: feats, cta, highlight }, i) => (
              <ScrollReveal key={name} delay={i * 100}>
                <div className={`rounded-2xl p-8 h-full flex flex-col relative ${
                  highlight
                    ? "bg-white border-2 border-[#c75d3c]"
                    : "bg-white border border-[#1b2430]/8"
                }`}>
                  {highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-[#c75d3c] text-white text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-widest">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6 mt-2">
                    <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${highlight ? "text-[#c75d3c]" : "text-[#1b2430]/35"}`}>
                      {name}
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-5xl font-extrabold text-[#1b2430]">{price}</span>
                      <span className="text-[#1b2430]/35 text-base mb-2">/mo</span>
                    </div>
                    <p className="text-[#1b2430]/45 text-sm">{desc}</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {feats.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <span className={`mt-0.5 flex-shrink-0 ${highlight ? "text-[#c75d3c]" : "text-[#1b2430]/30"}`}>
                          <IconCheck />
                        </span>
                        <span className="text-[#1b2430]/65">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#get-started"
                    className={`block text-center text-sm font-bold py-3.5 rounded-xl transition-all ${
                      highlight
                        ? "bg-[#c75d3c] hover:bg-[#b44f30] text-white"
                        : "bg-[#1b2430]/5 hover:bg-[#1b2430]/10 text-[#1b2430]/70 hover:text-[#1b2430]"
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
      <section className="py-24 px-6 border-t border-[#1b2430]/8">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#c75d3c] mb-4">Early Access</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6 text-[#1b2430]">
              We&apos;re onboarding our first tradespeople now.
            </h2>
            <p className="text-[#1b2430]/45 text-lg leading-relaxed">
              PietPilot is brand new — and that&apos;s good news for you. Early members
              get priority setup, direct access to us, and pricing that won&apos;t
              change as we grow.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="get-started" className="py-24 px-6 border-t border-[#1b2430]/8">
        <div className="relative max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#c75d3c] mb-6">Get Started</div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6 text-[#1b2430]">
              Your next customer is searching right now.
            </h2>
            <p className="text-[#1b2430]/45 text-lg mb-12 max-w-xl mx-auto">
              Get your professional website live in under 5 minutes.
              No agency. No contract. Just more jobs.
            </p>
            <WaitlistForm />
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-[#1b2430]/8 text-center">
        <span className="text-base font-bold text-[#1b2430]/70">
          Piet<span className="text-[#c75d3c]">Pilot</span>
        </span>
        <p className="text-[#1b2430]/30 text-xs mt-2">
          © 2026 PietPilot · pietpilot.com
        </p>
      </footer>
    </div>
  );
}
