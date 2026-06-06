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
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff6b2b" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
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
    title: "Built-in Lock-in (For Them)",
    desc: "Your site, your ads history, your leads — all live in our system. Agencies wish they had this kind of retention.",
    tag: "All plans",
  },
  {
    icon: <IconCheck />,
    title: "No Contracts. No Agency BS.",
    desc: "Month-to-month. Cancel anytime. No 12-month lock-in, no account manager who goes silent after the sale.",
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

const testimonials = [
  {
    quote: "I was paying my agency $1,200 a month and getting maybe 3 leads. First month with PietPilot I got 11 calls. Complete no-brainer.",
    name: "Mike T.",
    role: "Plumber · Phoenix, AZ",
    avatar: "MT",
  },
  {
    quote: "Setup took less than 10 minutes. My site looked better than competitors who've had agencies for years. Clients actually comment on it.",
    name: "Jason R.",
    role: "Electrician · Dallas, TX",
    avatar: "JR",
  },
  {
    quote: "The auto follow-up text is insane. I used to miss calls on job sites constantly. Now every lead gets a reply in seconds. My close rate doubled.",
    name: "Carlos M.",
    role: "HVAC · Miami, FL",
    avatar: "CM",
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
          <h1 className="text-6xl md:text-7xl lg:text-[88px] font-black leading-[0.95] tracking-tighter mb-8">
            <span className="gradient-text-subtle">Stop paying agencies</span>
            <br />
            <span className="gradient-text">$1,000 a month</span>
            <br />
            <span className="gradient-text-subtle">for zero results.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            PietPilot replaces your marketing agency with AI. Professional website,
            Google Ads, and automated lead follow-up — for a fraction of the cost.
          </p>

          {/* CTA */}
          <div className="mb-14">
            <WaitlistForm />
          </div>

          {/* Social proof mini */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/30">
            <div className="flex items-center gap-1.5">
              <div className="flex">{[1,2,3,4,5].map(i => <IconStar key={i} />)}</div>
              <span>4.9 / 5 rating</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <span>500+ tradespeople</span>
            <div className="w-px h-4 bg-white/10" />
            <span>Live in &lt; 5 minutes</span>
            <div className="w-px h-4 bg-white/10" />
            <span>No contracts</span>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              ["$2.1M+", "In leads generated"],
              ["500+", "Tradespeople using PietPilot"],
              ["11x", "Average leads vs. agency"],
              ["< 5 min", "From signup to live site"],
            ].map(([stat, label], i) => (
              <ScrollReveal key={label} delay={i * 80}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black gradient-text mb-2">{stat}</div>
                  <div className="text-xs text-white/30 leading-snug">{label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
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

          <div className="grid md:grid-cols-2 gap-4">
            {/* Old way */}
            <ScrollReveal delay={0}>
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-8 h-full">
                <div className="text-sm font-semibold text-red-400/80 mb-6 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xs">✕</span>
                  The Old Way (Marketing Agency)
                </div>
                <ul className="space-y-4">
                  {[
                    ["$800–$2,000/month", "And it goes up every year"],
                    ["Weeks to go live", "\"We're working on it...\""],
                    ["You don't own your site", "Cancel and it disappears"],
                    ["Zero visibility on ads", "Trust us, it's working"],
                    ["Missed calls = lost jobs", "Nobody follows up"],
                    ["12-month contracts", "Try getting out of one"],
                  ].map(([bad, sub]) => (
                    <li key={bad} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-2 flex-shrink-0" />
                      <div>
                        <div className="text-white/70 text-sm font-medium">{bad}</div>
                        <div className="text-white/25 text-xs mt-0.5">{sub}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* PietPilot */}
            <ScrollReveal delay={120}>
              <div className="rounded-2xl bg-[#ff6b2b]/5 border border-[#ff6b2b]/20 p-8 h-full glow-orange-sm">
                <div className="text-sm font-semibold text-[#ff6b2b] mb-6 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#ff6b2b]/10 border border-[#ff6b2b]/30 flex items-center justify-center text-[#ff6b2b] text-xs">✓</span>
                  PietPilot
                </div>
                <ul className="space-y-4">
                  {[
                    ["$149–$399/month", "Everything included, nothing hidden"],
                    ["Live in under 5 minutes", "Seriously. We timed it."],
                    ["Professional site built for you", "AI writes every word"],
                    ["Full dashboard, real numbers", "See every dollar working"],
                    ["Every lead followed up automatically", "Even missed calls"],
                    ["Cancel anytime", "No contracts, no catch"],
                  ].map(([good, sub]) => (
                    <li key={good} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b2b] mt-2 flex-shrink-0" />
                      <div>
                        <div className="text-white/80 text-sm font-medium">{good}</div>
                        <div className="text-white/30 text-xs mt-0.5">{sub}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
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

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#ff6b2b]">Results</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-center tracking-tight mb-20">
              Real tradespeople.{" "}
              <span className="gradient-text">Real results.</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role, avatar }, i) => (
              <ScrollReveal key={name} delay={i * 100}>
                <div className="card-hover rounded-2xl bg-white/[0.02] p-8 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-6">
                    {[1,2,3,4,5].map(j => <IconStar key={j} />)}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-8 flex-1">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#ff6b2b]/20 border border-[#ff6b2b]/30 flex items-center justify-center text-[#ff6b2b] text-xs font-bold">
                      {avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{name}</div>
                      <div className="text-xs text-white/30">{role}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
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
