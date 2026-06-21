"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type GeneratedAds = {
  ads: { headlines: string[]; descriptions: string[] }[];
  focusService: string;
  dailyBudget: number;
  paused?: boolean;
};

export default function AdsPage() {
  return <Suspense fallback={null}><AdsInner /></Suspense>;
}

function AdsInner() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("site");
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAds | null>(null);

  // Setup state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focus, setFocus] = useState<"all" | string>("all");
  const [budget, setBudget] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    fetch(`/api/dashboard?site=${siteId}`)
      .then(r => r.json())
      .then(d => {
        setServices(d.site?.generated_copy?.services || []);
        if (d.site?.generated_ads) {
          setGeneratedAds(d.site.generated_ads);
          setPaused(d.site.generated_ads.paused || false);
        }
        setLoading(false);
      });
  }, [siteId]);

  async function handleStart() {
    if (!budget) return;
    setStarting(true);
    const res = await fetch("/api/generate-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, focusService: focus, dailyBudget: budget }),
    });
    const data = await res.json();
    if (res.ok) setGeneratedAds(data);
    setStarting(false);
  }

  async function handleToggle() {
    setToggling(true);
    const newPaused = !paused;
    setPaused(newPaused);
    await fetch("/api/update-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, ads: generatedAds?.ads || [], paused: newPaused }),
    });
    setToggling(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  );

  // ── ACTIVE: Ads running ──────────────────────────────────────────────────
  if (generatedAds) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <span className="text-lg font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
          <Link href={`/dashboard?site=${siteId}`} className="text-white/40 text-sm hover:text-white transition-colors">← Back</Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-sm mx-auto w-full">

          {/* Big toggle */}
          <div className="text-center mb-12">
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`w-24 h-14 rounded-full transition-colors duration-300 relative flex-none mx-auto block mb-6 ${paused ? "bg-white/10" : "bg-[#f59e0b]"}`}
            >
              <span className={`absolute top-2 w-10 h-10 rounded-full bg-white shadow-lg transition-all duration-300 ${paused ? "left-2" : "left-12"}`} />
            </button>
            <h1 className="text-3xl font-extrabold mb-2">
              {paused ? "Ads are paused" : "Ads are running"}
            </h1>
            <p className="text-white/40 text-base">
              {paused ? "Turn back on whenever you're ready" : `Spending $${generatedAds.dailyBudget} per day to bring in customers`}
            </p>
          </div>

          {/* Stats */}
          <div className="w-full grid grid-cols-2 gap-3 mb-8">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-center">
              <p className="text-4xl font-extrabold mb-1">—</p>
              <p className="text-white/40 text-sm">Clicks</p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-center">
              <p className="text-4xl font-extrabold mb-1">—</p>
              <p className="text-white/40 text-sm">New leads</p>
            </div>
          </div>
          <p className="text-white/20 text-xs text-center mb-10">Live stats available when Google Ads is connected</p>

          {/* Settings summary */}
          <div className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 mb-4">
            <div className="flex justify-between items-center">
              <p className="text-white/40 text-sm">Daily budget</p>
              <p className="font-bold">${generatedAds.dailyBudget}/day</p>
            </div>
            <div className="flex justify-between items-center mt-3">
              <p className="text-white/40 text-sm">Focus</p>
              <p className="font-bold">{generatedAds.focusService === "all" ? "All services" : generatedAds.focusService}</p>
            </div>
          </div>

          <button
            onClick={() => setGeneratedAds(null)}
            className="text-white/30 text-sm hover:text-white transition-colors"
          >
            Start a new campaign →
          </button>
        </div>
      </div>
    );
  }

  // ── SETUP FLOW ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <span className="text-lg font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
        <Link href={`/dashboard?site=${siteId}`} className="text-white/40 text-sm hover:text-white transition-colors">← Back</Link>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 pb-2">
        {[1, 2, 3].map(s => (
          <div key={s} className={`rounded-full transition-all ${step === s ? "w-6 h-2 bg-[#f59e0b]" : step > s ? "w-2 h-2 bg-[#f59e0b]/50" : "w-2 h-2 bg-white/10"}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full px-6 py-10">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="mb-10">
              <p className="text-white/40 text-sm mb-2">Step 1 of 3</p>
              <h1 className="text-3xl font-extrabold leading-tight">What kind of jobs do you want more of?</h1>
            </div>

            <div className="space-y-3 flex-1">
              <button
                onClick={() => { setFocus("all"); setStep(2); }}
                className={`w-full p-6 rounded-2xl border text-left transition-colors ${focus === "all" ? "border-[#f59e0b] bg-[#f59e0b]/5" : "border-white/10 hover:border-white/25 bg-white/[0.02]"}`}
              >
                <p className="text-3xl mb-3">🔨</p>
                <p className="text-lg font-bold mb-1">Any job — fill my schedule</p>
                <p className="text-white/40 text-sm">Show my ads to anyone looking for a tradesperson nearby</p>
              </button>

              {services.length > 0 && (
                <div className={`w-full rounded-2xl border transition-colors ${focus !== "all" ? "border-[#f59e0b] bg-[#f59e0b]/5" : "border-white/10 bg-white/[0.02]"}`}>
                  <button
                    onClick={() => { setFocus(services[0]); setStep(2); }}
                    className="w-full p-6 text-left"
                  >
                    <p className="text-3xl mb-3">🎯</p>
                    <p className="text-lg font-bold mb-1">A specific type of job</p>
                    <p className="text-white/40 text-sm">Focus only on the jobs you want most</p>
                  </button>
                  {focus !== "all" && (
                    <div className="px-6 pb-5">
                      <select
                        value={focus}
                        onChange={e => setFocus(e.target.value)}
                        className="w-full bg-[#0b1220] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50"
                      >
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="mb-10">
              <p className="text-white/40 text-sm mb-2">Step 2 of 3</p>
              <h1 className="text-3xl font-extrabold leading-tight">How much do you want to spend per day?</h1>
              <p className="text-white/40 text-sm mt-3">More budget = more people see your ads. You can change this anytime.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {[
                { amount: 10, label: "Just starting out", sub: "Good for testing" },
                { amount: 20, label: "Steady growth", sub: "Most popular" },
                { amount: 30, label: "More customers", sub: "Great results" },
                { amount: 50, label: "Full speed", sub: "Maximum reach" },
              ].map(({ amount, label, sub }) => (
                <button
                  key={amount}
                  onClick={() => { setBudget(amount); setStep(3); }}
                  className={`p-5 rounded-2xl border text-left transition-colors ${budget === amount ? "border-[#f59e0b] bg-[#f59e0b]/5" : "border-white/10 hover:border-white/25 bg-white/[0.02]"}`}
                >
                  <p className="text-2xl font-extrabold mb-1">${amount}<span className="text-base font-normal text-white/40">/day</span></p>
                  <p className="text-sm font-semibold text-white/80">{label}</p>
                  <p className="text-xs text-white/30 mt-0.5">{sub}</p>
                </button>
              ))}
            </div>

            <button onClick={() => setStep(1)} className="text-white/30 text-sm mt-8 hover:text-white transition-colors">← Back</button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div className="mb-10">
              <p className="text-white/40 text-sm mb-2">Step 3 of 3</p>
              <h1 className="text-3xl font-extrabold leading-tight">You're ready to go!</h1>
              <p className="text-white/40 text-sm mt-3">We'll write your ads, test them automatically, and only keep the one that works best.</p>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-8 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-white/40">Jobs you want</p>
                <p className="font-bold">{focus === "all" ? "All types" : focus}</p>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <div className="flex justify-between items-center">
                <p className="text-white/40">Daily budget</p>
                <p className="font-bold">${budget}/day</p>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <div className="flex justify-between items-center">
                <p className="text-white/40">Contract</p>
                <p className="font-bold text-green-400">Cancel anytime</p>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] text-[#080808] font-extrabold text-lg py-5 rounded-2xl transition-colors disabled:opacity-50 mb-4"
            >
              {starting ? "Setting up…" : "Start my ads →"}
            </button>
            <p className="text-white/20 text-xs text-center">Included in your plan — no extra charge</p>

            <button onClick={() => setStep(2)} className="text-white/30 text-sm mt-6 hover:text-white transition-colors block text-center">← Back</button>
          </>
        )}
      </div>
    </div>
  );
}
