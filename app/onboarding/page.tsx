"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GeneratedSite from "@/app/components/GeneratedSite";
import { GeneratedSiteCopy } from "@/lib/siteTypes";

const STEPS_TOTAL = 8;

const questions = [
  { key: "businessName", label: "What's your business name?", placeholder: "e.g. Johnson Plumbing", type: "text" },
  { key: "trade", label: "What trade are you in?", placeholder: "e.g. Plumbing, electrical, roofing...", type: "text" },
  { key: "area", label: "What city or area do you cover?", placeholder: "e.g. Austin, TX and surrounding areas", type: "text" },
  { key: "phone", label: "What's your business phone number?", placeholder: "e.g. (512) 555-0182", type: "text" },
  { key: "hours", label: "What are your opening hours?", placeholder: "e.g. Mon–Fri 7am–6pm, Sat 8am–2pm", type: "text" },
  { key: "services", label: "What services do you offer?", placeholder: "List as many as you'd like — e.g. drain cleaning, water heater repair, bathroom remodels...", type: "textarea" },
  { key: "about", label: "Tell us about you and your business — the more you write, the better your site will be", placeholder: "How long have you been in business? How many jobs have you done? What makes you different? What do customers say about you? What do you care about on the job?", type: "textarea" },
  { key: "photos", label: "Do you have photos of your own work?", placeholder: "You can skip this — we'll use trade-relevant stock photos instead", type: "file" },
];

const templates = [
  { id: "classic", name: "Classic & Trustworthy", desc: "Clean, professional, no-nonsense. Built for trades that win on reliability.", accent: "#38bdf8" },
  { id: "bold", name: "Modern & Bold", desc: "Sharp, confident, eye-catching. Stands out in a crowded local search.", accent: "#f59e0b" },
  { id: "warm", name: "Warm & Personal", desc: "Friendly, approachable, community-feel. Great for owner-operated businesses.", accent: "#fb7185" },
];

const buildingMessages = [
  "Reading through what you told us...",
  "Writing your headlines and page copy...",
  "Picking photos that match your trade...",
  "Optimizing your site to rank locally on Google...",
  "Putting on the finishing touches...",
];

type FormData = Record<string, string>;

function OnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accountDone, setAccountDone] = useState(false);
  const [account, setAccount] = useState({ name: "", email: "", password: "" });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [generatedSiteId, setGeneratedSiteId] = useState<string | null>(null);

  // If we're returning from Stripe Checkout, restore the saved account info and skip ahead
  useEffect(() => {
    if (searchParams.get("account") === "done") {
      const saved = sessionStorage.getItem("pp_account");
      if (saved) setAccount(JSON.parse(saved));
      setAccountDone(true);
    }
  }, [searchParams]);

  async function startCheckout() {
    setCheckoutError("");
    setCheckoutLoading(true);
    sessionStorage.setItem("pp_account", JSON.stringify(account));
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: account.name, email: account.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutError(data.error || "Something went wrong. Try again.");
        setCheckoutLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Something went wrong. Try again.");
      setCheckoutLoading(false);
    }
  }
  const [step, setStep] = useState(0); // 0..8 questions, 9 = template choice, 10 = preview, 11 = building, 12 = ready
  const [data, setData] = useState<FormData>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [buildMsgIndex, setBuildMsgIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [previewCopy, setPreviewCopy] = useState<GeneratedSiteCopy | null>(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);

  const current = questions[step];

  function updateField(value: string) {
    setData((d) => ({ ...d, [current.key]: value }));
  }

  function next() {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // last question — generate the site copy once, then show template choice
      setGeneratingPreview(true);
      fetch("/api/preview-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((r) => r.json())
        .then((json) => setPreviewCopy(json.copy || null))
        .catch(() => setPreviewCopy(null))
        .finally(() => {
          setGeneratingPreview(false);
          setStep(questions.length);
        });
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function previewTemplate(id: string) {
    setSelectedTemplate(id);
    setStep(questions.length + 1); // preview screen
  }

  async function confirmTemplate(id: string) {
    setStep(questions.length + 2); // building screen
    setSubmitting(true);

    // cycle through fun building messages
    let i = 0;
    const interval = setInterval(() => {
      i = Math.min(i + 1, buildingMessages.length - 1);
      setBuildMsgIndex(i);
    }, 1400);

    let siteId: string | null = null;
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, template: id, accountName: account.name, accountEmail: account.email }),
      });
      const json = await res.json();
      siteId = json?.id || null;
      setGeneratedSiteId(siteId);

      if (siteId) {
        // fire off the AI copy generation — don't block the building animation on it
        fetch("/api/generate-site", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: siteId }),
        }).catch(() => {});
      }
    } catch {
      // even if saving fails, keep the user moving — we don't want to block the experience
    }

    setTimeout(() => {
      clearInterval(interval);
      setSubmitting(false);
      setStep(questions.length + 3); // ready screen
    }, buildingMessages.length * 1400 + 600);
  }

  const progressPct = step <= questions.length ? Math.round(((step + 1) / (STEPS_TOTAL + 1)) * 100) : 100;

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] flex flex-col">
      {/* logo */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <a href="/" className="text-2xl font-extrabold tracking-tight">
            Piet<span className="text-[#f59e0b]">Pilot</span>
          </a>
        </div>
      </div>

      {/* progress bar */}
      {accountDone && step <= questions.length && (
        <div className="h-1 bg-white/[0.06]">
          <div className="h-full bg-[#f59e0b] transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">

          {/* ── ACCOUNT CREATION ── */}
          {!accountDone && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Let's create your account</h1>
              <p className="text-white/40 text-sm mb-8">
                Just the basics — we'll ask about your business next.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={account.name}
                  onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter" && account.name && account.email && account.password) startCheckout(); }}
                  placeholder="Your name"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
                />
                <input
                  type="email"
                  value={account.email}
                  onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter" && account.name && account.email && account.password) startCheckout(); }}
                  placeholder="Your email"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
                />
                <input
                  type="password"
                  value={account.password}
                  onChange={(e) => setAccount((a) => ({ ...a, password: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter" && account.name && account.email && account.password) startCheckout(); }}
                  placeholder="Choose a password"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
                />
              </div>

              <p className="text-white/30 text-xs mt-4">
                Next, you'll add your card to start your 14-day free trial — you won't be charged until the trial ends.
              </p>
              {checkoutError && <p className="text-red-400 text-xs mt-3">{checkoutError}</p>}

              <div className="flex justify-end mt-6">
                <button
                  onClick={startCheckout}
                  disabled={!account.name || !account.email || !account.password || checkoutLoading}
                  className="bg-[#f59e0b] hover:bg-[#fbbf24] disabled:opacity-40 disabled:cursor-not-allowed text-[#0b1220] font-bold text-sm px-7 py-3 rounded-xl transition-all hover:scale-[1.02]"
                >
                  {checkoutLoading ? "Redirecting to checkout..." : "Continue to payment →"}
                </button>
              </div>
            </div>
          )}

          {/* ── QUESTIONS ── */}
          {accountDone && step < questions.length && (
            <div>
              <p className="text-white/35 text-sm mb-3">Question {step + 1} of {questions.length}</p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{current.label}</h1>
              <p className="text-white/40 text-sm mb-8">{current.placeholder}</p>

              {current.type === "textarea" && (
                <textarea
                  value={data[current.key] || ""}
                  onChange={(e) => updateField(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) next(); }}
                  rows={5}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all resize-none"
                  placeholder="Type your answer here..."
                />
              )}
              {current.type === "textarea" && (
                <p className="text-white/25 text-xs mt-2">Press {typeof window !== "undefined" && /Mac/.test(navigator.platform) ? "⌘" : "Ctrl"}+Enter to continue</p>
              )}
              {current.type === "text" && (
                <input
                  type="text"
                  value={data[current.key] || ""}
                  onChange={(e) => updateField(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") next(); }}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
                  placeholder="Type your answer here..."
                />
              )}
              {current.type === "file" && (
                <div className="border-2 border-dashed border-white/15 rounded-xl px-4 py-8 text-center">
                  <p className="text-white/40 text-sm mb-3">Drag & drop photos here, or skip this step</p>
                  <input type="file" multiple className="text-xs text-white/40" />
                </div>
              )}

              <div className="flex items-center justify-between mt-10">
                <button
                  onClick={back}
                  disabled={step === 0}
                  className="text-white/40 hover:text-white text-sm font-medium disabled:opacity-0 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={next}
                  className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-bold text-sm px-7 py-3 rounded-xl transition-all hover:scale-[1.02]"
                >
                  {step === questions.length - 1 ? "See my website options →" : "Continue →"}
                </button>
              </div>
            </div>
          )}

          {/* ── GENERATING WEBSITE ── */}
          {accountDone && generatingPreview && (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-2 border-white/20 border-t-[#f59e0b] rounded-full animate-spin mx-auto mb-6" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Generating your website...</h1>
              <p className="text-white/40 text-sm max-w-md mx-auto">
                We're writing the headlines, copy and content for {data.businessName || "your business"} —
                this only takes a few seconds.
              </p>
            </div>
          )}

          {/* ── TEMPLATE CHOICE ── */}
          {accountDone && !generatingPreview && step === questions.length && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-center">
                Pick a starting look for your site
              </h1>
              <p className="text-white/40 text-sm mb-2 text-center max-w-md mx-auto">
                We've matched these to your trade. Whatever you pick now is just a starting point —
              </p>
              <p className="text-[#f59e0b] text-sm font-semibold mb-10 text-center">
                you can always edit the design or switch to a different one later. You're never locked in.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => previewTemplate(t.id)}
                    className="card rounded-2xl p-5 text-left hover:-translate-y-1 transition-transform"
                  >
                    <div className="rounded-lg overflow-hidden border border-white/10 mb-4 bg-[#0b1220]">
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06]">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="h-3 w-2/3 rounded" style={{ background: t.accent, opacity: 0.8 }} />
                        <div className="h-2 w-full rounded bg-white/[0.08]" />
                        <div className="h-2 w-5/6 rounded bg-white/[0.08]" />
                        <div className="h-6 w-16 rounded mt-2" style={{ background: t.accent }} />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{t.name}</h3>
                    <p className="text-white/40 text-xs leading-relaxed">{t.desc}</p>
                  </button>
                ))}
              </div>

              <div className="text-center mt-10">
                <button onClick={back} className="text-white/40 hover:text-white text-sm font-medium transition-colors">
                  ← Back to questions
                </button>
              </div>
            </div>
          )}

          {/* ── TEMPLATE PREVIEW ── */}
          {accountDone && step === questions.length + 1 && selectedTemplate && (
            <div>
              {(() => {
                const t = templates.find((x) => x.id === selectedTemplate)!;
                return (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-center">
                      Here's a look at the "{t.name}" style
                    </h1>
                    <p className="text-white/40 text-sm mb-8 text-center max-w-md mx-auto">
                      This is just a preview of the look and feel — your real site will be filled
                      with content written specifically for {data.businessName || "your business"}.
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-[#121b2e] overflow-hidden shadow-2xl mb-3">
                      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        <span className="ml-3 text-xs text-white/30">{(data.businessName || "yourcompany").toLowerCase().replace(/\s+/g, "")}.com</span>
                      </div>
                      {!previewCopy ? (
                        <div className="p-16 flex flex-col items-center justify-center gap-3 text-white/40 text-sm">
                          <div className="w-6 h-6 border-2 border-white/20 border-t-[#f59e0b] rounded-full animate-spin" />
                          Writing your site's content...
                        </div>
                      ) : (
                        <div className="h-[480px] overflow-hidden relative">
                          <div
                            className="absolute top-0 left-0 origin-top-left"
                            style={{ width: "200%", transform: "scale(0.5)" }}
                          >
                            <GeneratedSite
                              data={{
                                businessName: data.businessName || "Your Business",
                                trade: data.trade || "",
                                area: data.area || "",
                                phone: data.phone || "",
                                hours: data.hours || "",
                                template: t.id,
                                copy: previewCopy,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-[#f59e0b] text-xs font-semibold text-center mb-10">
                      Remember — you can always edit this design or switch to another later. You're never locked in.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => setStep(questions.length)}
                        className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                      >
                        ← Try a different design
                      </button>
                      <button
                        onClick={() => confirmTemplate(t.id)}
                        className="inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-[0_8px_30px_-6px_rgba(245,158,11,0.45)] transition-all hover:scale-[1.03]"
                      >
                        Use this design →
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ── BUILDING SCREEN ── */}
          {accountDone && step === questions.length + 2 && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-8 relative">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-[#f59e0b] border-t-transparent animate-spin" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-3">Building your website...</h1>
              <p className="text-white/45 text-base transition-opacity duration-300">{buildingMessages[buildMsgIndex]}</p>
            </div>
          )}

          {/* ── READY SCREEN ── */}
          {accountDone && step === questions.length + 3 && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Your website is ready! 🎉</h1>
              <p className="text-white/45 text-base mb-10 max-w-sm mx-auto">
                {data.businessName ? `${data.businessName}'s` : "Your"} new site is live and already optimized to be found locally. You can edit anything, anytime.
              </p>
              <div className="flex items-center justify-center gap-4">
                {generatedSiteId && (
                  <a
                    href={`/site/${generatedSiteId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white text-sm font-semibold transition-colors"
                  >
                    View my website ↗
                  </a>
                )}
                <button
                  onClick={() => router.push(`/dashboard${generatedSiteId ? `?site=${generatedSiteId}` : ""}`)}
                  className="inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-base px-9 py-4 rounded-xl shadow-[0_8px_30px_-6px_rgba(245,158,11,0.45)] transition-all hover:scale-[1.03]"
                >
                  Go to my dashboard →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={null}>
      <OnboardingInner />
    </Suspense>
  );
}
