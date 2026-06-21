import ScrollReveal from "./components/ScrollReveal";
import Faq from "./components/Faq";

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

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-[#0b1220]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="text-2xl font-extrabold tracking-tight">
            Piet<span className="text-[#f59e0b]">Pilot</span>
          </a>
          <div className="hidden sm:flex items-center gap-8">
            <a href="#pricing" className="text-white/55 hover:text-white text-sm font-medium transition-colors">Pricing</a>
            <a href="#faq" className="text-white/55 hover:text-white text-sm font-medium transition-colors">FAQ</a>
            <a href="/contact" className="text-white/55 hover:text-white text-sm font-medium transition-colors">Contact us</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-white/55 hover:text-white text-sm font-medium transition-colors">
              Log in
            </a>
            <a href="/onboarding" className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-sm font-bold px-5 py-2.5 rounded-lg transition-colors">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO — split layout ── */}
      <section className="pt-36 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2.5 bg-white/[0.05] border border-white/10 text-white/55 text-xs font-medium px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              For Tradesmen
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.12] tracking-tight mb-6">
              Customers are searching for you
              <br />
              <span className="text-[#f59e0b]">on Google right now.</span>
            </h1>
            <p className="text-lg text-white/50 mb-10 leading-relaxed max-w-md">
              Can they find you? We build your website, run your ads, and send every
              new enquiry straight to your phone — so the phone rings more, without
              you touching a computer.
            </p>
            <a
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-base px-9 py-4 rounded-xl shadow-[0_8px_30px_-6px_rgba(245,158,11,0.45)] transition-all hover:scale-[1.03]"
            >
              Start Your Free Trial <IconArrow />
            </a>
            <p className="text-sm text-white/30 mt-4">14 days free · Cancel anytime</p>
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

                {/* mini results bar chart */}
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/40">Leads this month</span>
                    <span className="text-xs font-bold text-[#f59e0b]">▲ 32%</span>
                  </div>
                  <div className="flex items-end gap-2 h-16">
                    {[40, 55, 35, 70, 50, 85, 65].map((h, idx) => (
                      <div key={idx} className="flex-1 rounded-t bg-[#f59e0b]" style={{ height: `${h}%`, opacity: 0.35 + (idx / 7) * 0.65 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* floating stat card */}
            <div className="absolute -bottom-6 -left-6 bg-[#121b2e] border border-white/10 rounded-xl px-5 py-4 shadow-xl hidden sm:block">
              <div className="text-xs text-white/40 mb-1">Local search ranking</div>
              <div className="text-2xl font-extrabold text-[#f59e0b]">#1</div>
            </div>

            {/* floating notification bubble */}
            <div className="absolute -top-5 -right-4 bg-[#121b2e] border border-white/10 rounded-xl px-4 py-3 shadow-xl hidden sm:flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <div>
                <div className="text-xs font-semibold text-white">New enquiry from your site</div>
                <div className="text-[11px] text-white/35">2 minutes ago</div>
              </div>
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
              One system that builds your site, runs your ads, and brings in more customers — automatically.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-4">
            {/* big card spanning 2 cols */}
            <ScrollReveal className="md:col-span-2">
              <div className="card rounded-2xl p-8 h-full">
                <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Website &amp; SEO</div>
                <h3 className="text-2xl font-bold text-white mb-3">Built to be found locally</h3>
                <p className="text-white/45 text-base leading-relaxed max-w-md">
                  We're SEO specialists — every site we build is optimized from day one
                  to rank when people nearby search for your service. No tech skills
                  needed on your end. We handle all of it.
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
                <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Leads</div>
                <h3 className="text-lg font-bold text-white mb-2">Every lead in one place</h3>
                <p className="text-white/45 text-sm leading-relaxed">
                  New enquiry from your website? You get an instant email and text — so you can respond before anyone else does.
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
              ["Your ads go live", "We set up and run your Google Ads so customers searching for your service find you first."],
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

      {/* ── WHY NOT AN AGENCY / WIX ── */}
      <section className="py-24 px-6 border-t border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
              "Why not just use Wix, or hire an agency?"
            </h2>
            <p className="text-white/45 text-base text-center max-w-xl mx-auto mb-14">
              Fair question. Here's the honest difference.
            </p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-4">
            <ScrollReveal>
              <div className="card rounded-2xl p-7 h-full">
                <h3 className="text-base font-bold text-white mb-2">Wix / Squarespace</h3>
                <p className="text-white/45 text-sm leading-relaxed">
                  You get a website — but you still have to write it, design it, optimize
                  it for local search, and figure out ads yourself. It's a tool, not a result.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <div className="card rounded-2xl p-7 h-full">
                <h3 className="text-base font-bold text-white mb-2">A marketing agency</h3>
                <p className="text-white/45 text-sm leading-relaxed">
                  Does the work for you — for $800–$2,000/month, with slow turnarounds
                  and reports full of jargon you didn't ask for.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={160}>
              <div className="card rounded-2xl p-7 h-full border-[#f59e0b]/30 bg-[#f59e0b]/[0.04]">
                <h3 className="text-base font-bold text-[#f59e0b] mb-2">PietPilot</h3>
                <p className="text-white/55 text-sm leading-relaxed">
                  All the work an agency does — website, SEO, and ads — for a
                  fraction of the price, with no contracts and a dashboard that actually
                  makes sense.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── PRICING — single offer ── */}
      <section id="pricing" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
              One plan. Everything included.
            </h2>
            <p className="text-white/45 text-base text-center max-w-md mx-auto mb-12">
              No tiers to compare, no add-ons to figure out. Just one straightforward price.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="rounded-2xl border-2 border-[#f59e0b] bg-[#f59e0b]/[0.06] p-10 text-center">
              <span className="inline-block bg-[#f59e0b] text-[#0b1220] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-5">
                14-Day Free Trial
              </span>
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-5xl font-extrabold text-white">$149</span>
                <span className="text-white/40 text-base mb-1.5">/month after trial</span>
              </div>
              <p className="text-white/50 text-sm mb-2">Card required to start your trial — you won't be charged for 14 days. No contracts. Cancel anytime.</p>
              <p className="text-white/30 text-xs mb-8">⚠️ Google Ads spend is <strong className="text-white/50">not included</strong> — you pay Google directly for your ad budget (typically $10–50/day). We handle the setup and management.</p>
              <ul className="text-left max-w-xs mx-auto space-y-3 mb-9">
                {[
                  "A professional website built & hosted for you",
                  "SEO built in — so locals can find you",
                  "Google Ads set up and managed (you pay Google directly for ad spend)",
                  "Simple dashboard for leads & results",
                  "Hands-on support, zero tech skills needed",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex-shrink-0 text-[#f59e0b]"><IconCheck /></span>
                    <span className="text-white/65">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-base px-9 py-4 rounded-xl shadow-[0_8px_30px_-6px_rgba(245,158,11,0.45)] transition-all hover:scale-[1.03]"
              >
                Start Your Free Trial <IconArrow />
              </a>
              <p className="text-sm text-white/30 mt-4">14 days free · Cancel anytime</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-3">
              Questions? We&apos;ve got answers.
            </h2>
            <p className="text-white/45 text-base text-center max-w-md mx-auto mb-12">
              Still unsure about something? Reach out anytime — we reply personally.
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <Faq />
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
