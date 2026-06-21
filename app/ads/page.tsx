"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type GeneratedAds = {
  ads: { headlines: string[]; descriptions: string[] }[];
  focusService: string;
  dailyBudget: number;
  paused?: boolean;
  startedAt?: string;
};

export default function AdsPage() {
  return <Suspense fallback={null}><AdsInner /></Suspense>;
}

function AdsInner() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("site");
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<GeneratedAds | null>(null);
  const [view, setView] = useState<"dashboard" | "setup">("dashboard");

  // Setup
  const [step, setStep] = useState(1);
  const [focus, setFocus] = useState<string>("all");
  const [budget, setBudget] = useState<number>(20);
  const [starting, setStarting] = useState(false);

  // Dashboard
  const [paused, setPaused] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    fetch(`/api/dashboard?site=${siteId}`)
      .then(r => r.json())
      .then(d => {
        setServices(d.site?.generated_copy?.services || []);
        if (d.site?.generated_ads?.ads?.length) {
          setCampaign(d.site.generated_ads);
          setPaused(d.site.generated_ads.paused || false);
        }
        setView("dashboard"); // always start at dashboard
        setLoading(false);
      });
  }, [siteId]);

  async function handleStart() {
    setStarting(true);
    const res = await fetch("/api/generate-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, focusService: focus, dailyBudget: budget }),
    });
    const data = await res.json();
    if (res.ok) {
      const withDate = { ...data, startedAt: new Date().toISOString() };
      setCampaign(withDate);
      setView("dashboard");
    }
    setStarting(false);
  }

  async function handleToggle() {
    setToggling(true);
    const newPaused = !paused;
    setPaused(newPaused);
    await fetch("/api/update-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, ads: campaign?.ads || [], paused: newPaused }),
    });
    setToggling(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-[#f59e0b] rounded-full animate-spin" />
    </div>
  );

  // ── SETUP FLOW (styled like onboarding) ──────────────────────────────────
  if (view === "setup") {
    const totalSteps = 3;
    return (
      <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] flex flex-col">
        {/* Header */}
        <div className="border-b border-white/[0.06]">
          <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
            <Link href={`/dashboard?site=${siteId}`} className="text-white/30 text-sm hover:text-white transition-colors">← Back to dashboard</Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div className="h-1 bg-[#f59e0b] transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-12">

          {/* Step 1 — Focus */}
          {step === 1 && (
            <div className="flex flex-col flex-1">
              <p className="text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-4">{step} of {totalSteps}</p>
              <h1 className="text-4xl font-extrabold leading-tight mb-3">What kind of jobs do you want more of?</h1>
              <p className="text-white/40 text-lg mb-10">Pick one — you can always change this later.</p>

              <div className="space-y-3 flex-1">
                <button
                  onClick={() => { setFocus("all"); setStep(2); }}
                  className="w-full p-7 rounded-2xl border border-white/10 hover:border-[#f59e0b]/50 bg-white/[0.02] hover:bg-[#f59e0b]/5 text-left transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-4xl">🔨</span>
                    <div>
                      <p className="text-xl font-bold text-white mb-1">Any job — just fill my schedule</p>
                      <p className="text-white/40">Show my ads to anyone searching for a tradesperson in my area</p>
                    </div>
                  </div>
                </button>

                {services.map(s => (
                  <button
                    key={s}
                    onClick={() => { setFocus(s); setStep(2); }}
                    className="w-full p-7 rounded-2xl border border-white/10 hover:border-[#f59e0b]/50 bg-white/[0.02] hover:bg-[#f59e0b]/5 text-left transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-4xl">🎯</span>
                      <div>
                        <p className="text-xl font-bold text-white mb-1">More {s} jobs</p>
                        <p className="text-white/40">Focus 100% of my budget on getting {s.toLowerCase()} enquiries</p>
                      </div>
                    </div>
                  </button>
                ))}

                {services.length === 0 && (
                  <button
                    onClick={() => { setFocus("all"); setStep(2); }}
                    className="w-full p-7 rounded-2xl border border-white/10 hover:border-[#f59e0b]/50 bg-white/[0.02] hover:bg-[#f59e0b]/5 text-left transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-4xl">🎯</span>
                      <div>
                        <p className="text-xl font-bold text-white mb-1">A specific type of job</p>
                        <p className="text-white/40">Focus on one service for better results</p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2 — Budget */}
          {step === 2 && (
            <div className="flex flex-col flex-1">
              <p className="text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-4">{step} of {totalSteps}</p>
              <h1 className="text-4xl font-extrabold leading-tight mb-3">How much do you want to spend per day?</h1>
              <p className="text-white/40 text-lg mb-10">More budget means more people see your ads. Cancel or change anytime.</p>

              <div className="grid grid-cols-2 gap-4 flex-1">
                {[
                  { amount: 10, emoji: "🌱", label: "Just getting started", sub: "Good for testing the waters" },
                  { amount: 20, emoji: "📈", label: "Steady growth", sub: "Most popular choice" },
                  { amount: 30, emoji: "🚀", label: "More customers", sub: "Great for busy periods" },
                  { amount: 50, emoji: "⚡", label: "Full speed ahead", sub: "Maximum reach in your area" },
                ].map(({ amount, emoji, label, sub }) => (
                  <button
                    key={amount}
                    onClick={() => { setBudget(amount); setStep(3); }}
                    className={`p-6 rounded-2xl border text-left transition-all ${budget === amount ? "border-[#f59e0b] bg-[#f59e0b]/5" : "border-white/10 bg-white/[0.02] hover:border-[#f59e0b]/40 hover:bg-[#f59e0b]/5"}`}
                  >
                    <p className="text-3xl mb-3">{emoji}</p>
                    <p className="text-2xl font-extrabold text-white mb-1">${amount}<span className="text-sm font-normal text-white/30">/day</span></p>
                    <p className="text-sm font-semibold text-white/70 mb-1">{label}</p>
                    <p className="text-xs text-white/30">{sub}</p>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-xs text-white/30 mb-2 text-center">Or enter your own amount</label>
                <div className="flex items-center gap-2 bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#f59e0b]/50 transition-colors">
                  <span className="text-white/40 text-sm">$</span>
                  <input
                    type="number"
                    min={5}
                    placeholder="e.g. 25"
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val >= 5) setBudget(val);
                    }}
                  />
                  <span className="text-white/40 text-sm">/day</span>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-[#f59e0b] text-[#0b1220] font-bold text-xs px-3 py-1.5 rounded-lg"
                  >
                    Use this →
                  </button>
                </div>
              </div>

              <button onClick={() => setStep(1)} className="text-white/25 text-sm mt-6 hover:text-white transition-colors">← Back</button>
            </div>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && (
            <div className="flex flex-col flex-1">
              <p className="text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-4">{step} of {totalSteps}</p>
              <h1 className="text-4xl font-extrabold leading-tight mb-3">Looking good — let's start!</h1>
              <p className="text-white/40 text-lg mb-10">We'll create 3 ads, test which one works best, and automatically keep the winner.</p>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 mb-8">
                <div className="flex justify-between items-center py-4 border-b border-white/[0.06]">
                  <p className="text-white/40">Focus</p>
                  <p className="font-bold text-lg">{focus === "all" ? "All job types" : focus}</p>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-white/[0.06]">
                  <p className="text-white/40">Daily budget</p>
                  <p className="font-bold text-lg">${budget}/day</p>
                </div>
                <div className="flex justify-between items-center py-4">
                  <p className="text-white/40">Contract</p>
                  <p className="font-bold text-lg text-green-400">Cancel anytime</p>
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={starting}
                className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-xl py-5 rounded-2xl transition-colors disabled:opacity-50 mb-3"
              >
                {starting ? "Setting up your ads…" : "Start my ads →"}
              </button>
              <p className="text-white/20 text-sm text-center mb-8">Included in your plan · No extra charge</p>
              <button onClick={() => setStep(2)} className="text-white/25 text-sm hover:text-white transition-colors text-center block">← Back</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ADS DASHBOARD ────────────────────────────────────────────────────────
  const daysRunning = campaign?.startedAt
    ? Math.max(1, Math.floor((Date.now() - new Date(campaign.startedAt).getTime()) / 86400000))
    : 0;

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6]">
      {/* Header */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
          <Link href={`/dashboard?site=${siteId}`} className="text-white/30 text-sm hover:text-white transition-colors">← Dashboard</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-5">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Google Ads</h1>
          <button
            onClick={() => { setStep(1); setView("setup"); }}
            className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            + New campaign
          </button>
        </div>

        {/* No campaign yet */}
        {!campaign ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-12 text-center">
            <p className="text-5xl mb-5">📢</p>
            <h2 className="text-xl font-bold mb-2">No active campaign</h2>
            <p className="text-white/40 text-sm mb-8 max-w-xs mx-auto">Start your first Google Ads campaign and get more customers finding you online.</p>
            <button
              onClick={() => { setStep(1); setView("setup"); }}
              className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-bold px-8 py-3.5 rounded-xl transition-colors"
            >
              Create my first campaign →
            </button>
          </div>
        ) : (
          <>
        {/* Main status card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className={`w-3 h-3 rounded-full ${paused ? "bg-white/20" : "bg-green-400"} ${!paused ? "animate-pulse" : ""}`} />
                <h2 className="text-xl font-extrabold">{paused ? "Ads are paused" : "Ads are running"}</h2>
              </div>
              <p className="text-white/40 text-sm">{paused ? "No money being spent right now" : `$${campaign?.dailyBudget}/day · ${campaign?.focusService === "all" ? "All job types" : campaign?.focusService}`}</p>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/30">{paused ? "Off" : "On"}</span>
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${paused ? "bg-white/10" : "bg-[#f59e0b]"}`}
              >
                <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${paused ? "left-1" : "left-7"}`} />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Clicks this month", value: "—" },
              { label: "Leads from ads", value: "—" },
              { label: "Cost per lead", value: "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-[#080e1a] border border-white/[0.05] p-4 text-center">
                <p className="text-2xl font-extrabold text-white mb-1">{value}</p>
                <p className="text-xs text-white/30">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-white/15 text-xs text-center mt-3">Live data available when Google Ads is connected</p>
        </div>

        {/* Chart placeholder */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold">Performance</h2>
            <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full">Last 30 days</span>
          </div>
          <div className="h-40 flex items-end gap-2">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex-1 rounded-t-sm bg-white/[0.04] border-t border-white/[0.06]" style={{ height: `${20 + Math.random() * 20}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-white/20 mt-2">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
          <p className="text-white/20 text-xs text-center mt-3">Chart will show real clicks when Google Ads is connected</p>
        </div>

        {/* Campaign settings */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold">Campaign settings</h2>
            <button onClick={() => { setStep(1); setView("setup"); }} className="text-xs font-bold text-[#f59e0b] hover:opacity-70 transition-opacity">
              Edit →
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
              <p className="text-white/40 text-sm">Focus</p>
              <p className="text-sm font-semibold">{campaign?.focusService === "all" ? "All job types" : campaign?.focusService}</p>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
              <p className="text-white/40 text-sm">Daily budget</p>
              <p className="text-sm font-semibold">${campaign?.dailyBudget}/day</p>
            </div>
            <div className="flex justify-between items-center py-3">
              <p className="text-white/40 text-sm">Running for</p>
              <p className="text-sm font-semibold">{daysRunning} {daysRunning === 1 ? "day" : "days"}</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7">
          <h2 className="text-base font-bold mb-5">How your ads work</h2>
          <div className="space-y-4">
            {[
              { n: "1", text: "3 different ads are running right now — each with slightly different wording" },
              { n: "2", text: "After 14 days we find out which ad gets the most clicks" },
              { n: "3", text: "The best ad gets 100% of your budget — the others are removed automatically" },
            ].map(({ n, text }) => (
              <div key={n} className="flex gap-4 items-start">
                <span className="w-7 h-7 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] text-xs font-black flex items-center justify-center flex-none mt-0.5">{n}</span>
                <p className="text-white/50 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
          </>
        )}

      </div>
    </div>
  );
}
