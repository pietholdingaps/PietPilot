import ScrollReveal from "./components/ScrollReveal";
import WaitlistForm from "./components/WaitlistForm";

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const plans = [
  {
    name: "Starter",
    price: "$149",
    tagline: "Get a professional site online",
    features: ["Website built for your business", "Local SEO from day one", "Booking & contact form", "Hosted & kept up to date"],
  },
  {
    name: "Growth",
    price: "$249",
    tagline: "Get found by people searching now",
    features: ["Everything in Starter", "Google Ads set up & managed", "Campaigns improved over time", "Simple results dashboard"],
    highlight: true,
  },
  {
    name: "Pro",
    price: "$399",
    tagline: "Never lose a lead again",
    features: ["Everything in Growth", "Automatic SMS & email follow-up", "Missed-call auto-text", "Full lead history & tracking"],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-[#0b1220]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            Piet<span className="text-[#f59e0b]">Pilot</span>
          </span>
          <a href="#pricing" className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-sm font-bold px-5 py-2.5 rounded-lg transition-colors">
            Get Started
          </a>
        </div>
      </nav>

      {/* ── HERO — split layout ── */}
      <section className="pt-36 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2.5 bg-white/[0.05] border border-white/10 text-white/55 text-xs font-medium px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              For plumbers, electricians, HVAC &amp; roofers
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.12] tracking-tight mb-6">
              Your phone should be ringing.
              <br />
              <span className="text-[#f59e0b]">We make sure it does.</span>
            </h1>
            <p className="text-lg text-white/50 mb-10 leading-relaxed max-w-md">
              A professional website and Google Ads that actually bring in jobs —
              built and run for you. No agency. No tech skills. One simple price.
            </p>
            <div className="max-w-md">
              <WaitlistForm />
            </div>
            <p className="text-sm text-white/30 mt-4">From $149/month · No contracts · Cancel anytime</p>
          </div>

          {/* Right: mock browser/phone preview */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-[#121b2e] overflow-hidden shadow-2xl">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="ml-3 text-xs text-white/30">yourcompany.com</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="h-5 w-2/3 rounded bg-white/10" />
                <div className="h-3 w-full rounded bg-white/[0.06]" />
                <div className="h-3 w-5/6 rounded bg-white/[0.06]" />
                <div className="flex gap-3 mt-5">
                  <div className="h-9 w-28 rounded-lg bg-[#f59e0b]" />
                  <div className="h-9 w-28 rounded-lg border border-white/15" />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="h-20 rounded-lg bg-white/[0.05] border border-white/[0.06]" />
                  <div className="h-20 rounded-lg bg-white/[0.05] border border-white/[0.06]" />
                  <div className="h-20 rounded-lg bg-white/[0.05] border border-white/[0.06]" />
                </div>
              </div>
            </div>
            {/* floating stat card */}
            <div className="absolute -bottom-6 -left-6 bg-[#121b2e] border border-white/10 rounded-xl px-5 py-4 shadow-xl hidden sm:block">
              <div className="text-xs text-white/40 mb-1">New leads this week</div>
              <div className="text-2xl font-extrabold text-[#f59e0b]">+18</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM — ticker style ── */}
      <section className="py-16 px-6 border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="text-center text-white/45 text-lg max-w-2xl mx-auto">
              Most agencies charge <span className="text-white font-semibold">$800–$2,000/month</span>,
              take <span className="text-white font-semibold">weeks</span> to make a single change,
              and leave you with <span className="text-white font-semibold">no idea</span> what's actually working.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FEATURES — bento grid ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 max-w-xl">
              Everything a marketing agency does. None of the markup.
            </h2>
            <p className="text-white/45 text-base max-w-xl mb-14">
              One system that builds your site, runs your ads, and follows up on every lead — automatically.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-4">
            {/* big card spanning 2 cols */}
            <ScrollReveal className="md:col-span-2">
              <div className="card rounded-2xl p-8 h-full">
                <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Website</div>
                <h3 className="text-2xl font-bold text-white mb-3">Live in days, not months</h3>
                <p className="text-white/45 text-base leading-relaxed max-w-md">
                  Tell us about your business and we build a site that's written to turn
                  visitors into phone calls — with local SEO baked in from the start.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <div className="card rounded-2xl p-8 h-full">
                <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Ads</div>
                <h3 className="text-lg font-bold text-white mb-2">Show up first</h3>
                <p className="text-white/45 text-sm leading-relaxed">
                  Google Ads set up and managed so you appear when locals search for your service.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={140}>
              <div className="card rounded-2xl p-8 h-full">
                <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Follow-up</div>
                <h3 className="text-lg font-bold text-white mb-2">Never miss a lead</h3>
                <p className="text-white/45 text-sm leading-relaxed">
                  Missed call on the job? An automatic text fires off in seconds, every time.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200} className="md:col-span-2">
              <div className="card rounded-2xl p-8 h-full">
                <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Dashboard</div>
                <h3 className="text-2xl font-bold text-white mb-3">One place for everything</h3>
                <p className="text-white/45 text-base leading-relaxed max-w-md">
                  Leads, ad spend, results — all in plain English, in one simple dashboard.
                  No spreadsheets, no jargon, no guessing what's working.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — horizontal steps ── */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-16">
              From signup to live site — under 5 minutes
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-0 relative">
            <div className="hidden md:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-white/10" />
            {[
              ["Tell us about your business", "Name, location, services, phone number — plain English."],
              ["We build & launch your site", "Professional copy and pages, published and live."],
              ["Leads start coming in", "Site's live, ads are running, follow-ups are automatic."],
            ].map(([title, desc], i) => (
              <ScrollReveal key={title} delay={i * 100}>
                <div className="text-center px-6 relative">
                  <div className="w-12 h-12 rounded-full bg-[#f59e0b] text-[#0b1220] font-extrabold flex items-center justify-center mx-auto mb-5 relative z-10">
                    {i + 1}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING — comparison columns ── */}
      <section id="pricing" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
              One simple price. Pick what you need.
            </h2>
            <p className="text-white/45 text-base text-center max-w-xl mx-auto mb-16">
              No setup fees, no contracts — switch or cancel anytime. Save 2 months with annual billing.
            </p>
          </ScrollReveal>

          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
              {plans.map(({ name, price, tagline, features: feats, highlight }, i) => (
                <ScrollReveal key={name} delay={i * 80}>
                  <div className={`p-8 h-full flex flex-col ${highlight ? "bg-[#f59e0b]/[0.06]" : ""}`}>
                    {highlight && (
                      <span className="self-start bg-[#f59e0b] text-[#0b1220] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                        Most Popular
                      </span>
                    )}
                    <div className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">{name}</div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-4xl font-extrabold text-white">{price}</span>
                      <span className="text-white/35 text-sm mb-1">/mo</span>
                    </div>
                    <p className="text-white/45 text-sm mb-6">{tagline}</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {feats.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm">
                          <span className={`mt-0.5 flex-shrink-0 ${highlight ? "text-[#f59e0b]" : "text-white/30"}`}><IconCheck /></span>
                          <span className="text-white/65">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#get-started"
                      className={`flex items-center justify-center gap-2 text-center text-sm font-bold py-3 rounded-xl transition-all ${
                        highlight ? "bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220]" : "bg-white/[0.06] hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                      }`}
                    >
                      Get Started <IconArrow />
                    </a>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EARLY ACCESS strip ── */}
      <section className="px-6 py-16 border-t border-white/[0.06]">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto rounded-2xl border border-[#f59e0b]/25 bg-[#f59e0b]/[0.06] p-10 text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Early Access</div>
            <h3 className="text-2xl md:text-3xl font-extrabold mb-3">We're onboarding our first tradespeople now</h3>
            <p className="text-white/50 max-w-xl mx-auto">
              PietPilot is brand new — early members get priority setup, direct access
              to us, and pricing that won't change as we grow.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="get-started" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5">
              Your next customer is searching right now.
            </h2>
            <p className="text-white/45 text-lg mb-10 max-w-lg mx-auto">
              Get a professional website live in under 5 minutes — no agency, no contract.
            </p>
            <WaitlistForm />
          </ScrollReveal>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/[0.06] text-center">
        <span className="text-base font-bold text-white/70">
          Piet<span className="text-[#f59e0b]">Pilot</span>
        </span>
        <p className="text-white/30 text-xs mt-2">© 2026 PietPilot · pietpilot.com</p>
      </footer>
    </div>
  );
}
