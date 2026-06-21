"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type AdVariant = { headlines: string[]; descriptions: string[]; paused?: boolean };
type GeneratedAds = {
  ads: AdVariant[];
  keywords: string[];
  focusService: string;
  dailyBudget: number;
  paused?: boolean;
};
type SiteInfo = {
  id: string;
  generated_copy?: { services?: string[] };
  generated_ads?: GeneratedAds;
};

export default function AdsPage() {
  return <Suspense fallback={null}><AdsInner /></Suspense>;
}

function AdsInner() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("site");
  const [site, setSite] = useState<SiteInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Setup state
  const [step, setStep] = useState(1);
  const [focusMode, setFocusMode] = useState<"all" | "specific">("all");
  const [focusService, setFocusService] = useState("");
  const [dailyBudget, setDailyBudget] = useState(20);
  const [generating, setGenerating] = useState(false);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAds | null>(null);
  const [error, setError] = useState("");
  const [campaignPaused, setCampaignPaused] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    fetch(`/api/dashboard?site=${siteId}`)
      .then(r => r.json())
      .then(d => {
        setSite(d.site);
        if (d.site?.generated_ads) {
          setGeneratedAds(d.site.generated_ads);
          setFocusService(d.site.generated_ads.focusService || "all");
          setDailyBudget(d.site.generated_ads.dailyBudget || 20);
          setCampaignPaused(d.site.generated_ads.paused || false);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [siteId]);

  async function handleStart() {
    setGenerating(true); setError("");
    try {
      const res = await fetch("/api/generate-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          focusService: focusMode === "all" ? "all" : focusService,
          dailyBudget,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError("Something went wrong. Please try again."); return; }
      setGeneratedAds(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleCampaign() {
    const newPaused = !campaignPaused;
    setCampaignPaused(newPaused);
    await fetch("/api/update-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, ads: generatedAds?.ads || [], paused: newPaused }),
    });
  }

  async function saveBudget(newBudget: number) {
    setDailyBudget(newBudget);
    setEditingBudget(false);
    if (generatedAds) {
      await fetch("/api/update-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, ads: generatedAds.ads, dailyBudget: newBudget }),
      });
    }
  }

  const services = site?.generated_copy?.services || [];

  if (loading) return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  );

  // ── ACTIVE CAMPAIGN VIEW ─────────────────────────────────────────────────
  if (generatedAds) {
    return (
      <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-6 py-12">
        <div className="max-w-xl mx-auto">

          <div className="flex items-center justify-between mb-10">
            <span className="text-2xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
            <Link href={`/dashboard?site=${siteId}`} className="text-white/40 text-sm hover:text-white transition-colors">← Back</Link>
          </div>

          {/* Status card */}
          <div className="card rounded-2xl p-7 mb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${campaignPaused ? "bg-white/20" : "bg-green-400"}`} />
                  <span className="text-lg font-extrabold text-white">{campaignPaused ? "Paused" : "Your ads are running"}</span>
                </div>
                <p className="text-white/40 text-sm">
                  {generatedAds.focusService === "all" ? "All services" : generatedAds.focusService}
                  {" · "}
                  {editingBudget ? (
                    <span className="inline-flex items-center gap-1">
                      $<input
                        type="number"
                        defaultValue={dailyBudget}
                        min={5}
                        className="w-14 bg-transparent border-b border-[#f59e0b] text-white text-sm outline-none"
                        onBlur={(e) => saveBudget(Number(e.target.value))}
                        onKeyDown={(e) => e.key === "Enter" && saveBudget(Number((e.target as HTMLInputElement).value))}
                        autoFocus
                      />/day
                    </span>
                  ) : (
                    <button onClick={() => setEditingBudget(true)} className="text-[#f59e0b] hover:opacity-70 transition-opacity">
                      ${dailyBudget}/day ✎
                    </button>
                  )}
                </p>
              </div>
              <button
                onClick={toggleCampaign}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${campaignPaused ? "bg-[#f59e0b] text-[#0b1220] border-[#f59e0b]" : "border-white/10 text-white/60 hover:border-white/25"}`}
              >
                {campaignPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
            </div>

            {/* Stats — placeholder til Google Ads API */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0b1220] border border-white/[0.07] p-4 text-center">
                <p className="text-3xl font-extrabold text-white mb-1">—</p>
                <p className="text-xs text-white/30">Clicks this month</p>
              </div>
              <div className="rounded-xl bg-[#0b1220] border border-white/[0.07] p-4 text-center">
                <p className="text-3xl font-extrabold text-white mb-1">—</p>
                <p className="text-xs text-white/30">Inquiries from ads</p>
              </div>
            </div>
            <p className="text-white/20 text-xs text-center mt-3">Live stats available when Google Ads is connected</p>
          </div>

          {/* New campaign button */}
          <button
            onClick={() => setGeneratedAds(null)}
            className="w-full py-3.5 rounded-2xl border border-white/[0.07] text-sm font-semibold text-white/40 hover:text-white hover:border-white/20 transition-colors"
          >
            + Create new campaign
          </button>
        </div>
      </div>
    );
  }

  // ── SETUP FLOW ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-6 py-12">
      <div className="max-w-xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <span className="text-2xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
          <Link href={`/dashboard?site=${siteId}`} className="text-white/40 text-sm hover:text-white transition-colors">← Back</Link>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Set up Google Ads</h1>
        <p className="text-white/40 text-sm mb-10">2 quick questions — then we handle everything.</p>

        {/* Step 1 */}
        <div className={`card rounded-2xl p-6 mb-4 transition-opacity ${step < 1 ? "opacity-30" : ""}`}>
          <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1">Step 1</p>
          <h2 className="text-lg font-bold text-white mb-5">What type of work do you want more of?</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setFocusMode("all"); setStep(2); }}
              className={`p-5 rounded-xl border text-left transition-colors ${focusMode === "all" && step >= 2 ? "border-[#f59e0b] bg-[#f59e0b]/5" : "border-white/10 hover:border-white/25"}`}
            >
              <p className="text-2xl mb-2">🔨</p>
              <p className="font-bold text-sm text-white">All services</p>
              <p className="text-xs text-white/40 mt-1">Bring in any type of job</p>
            </button>
            <button
              onClick={() => { setFocusMode("specific"); if (services.length > 0) setFocusService(services[0]); setStep(2); }}
              className={`p-5 rounded-xl border text-left transition-colors ${focusMode === "specific" && step >= 2 ? "border-[#f59e0b] bg-[#f59e0b]/5" : "border-white/10 hover:border-white/25"}`}
            >
              <p className="text-2xl mb-2">🎯</p>
              <p className="font-bold text-sm text-white">Specific job type</p>
              <p className="text-xs text-white/40 mt-1">Focus on one service</p>
            </button>
          </div>
          {focusMode === "specific" && step >= 2 && (
            <select
              value={focusService}
              onChange={e => setFocusService(e.target.value)}
              className="mt-3 w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50"
            >
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        {/* Step 2 */}
        {step >= 2 && (
          <div className="card rounded-2xl p-6 mb-4">
            <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1">Step 2</p>
            <h2 className="text-lg font-bold text-white mb-1">How much do you want to spend per day?</h2>
            <p className="text-white/30 text-xs mb-6">Your total daily budget — split automatically across all ads we create</p>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/30 mb-2">
                <span>$10</span>
                <span className="text-2xl font-extrabold text-white">${dailyBudget}</span>
                <span>$50</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={dailyBudget}
                onChange={e => { setDailyBudget(Number(e.target.value)); setStep(3); }}
                className="w-full accent-[#f59e0b]"
              />
              <div className="flex justify-between text-xs text-white/20 mt-1">
                {[10, 15, 20, 25, 30, 35, 40, 45, 50].map(v => (
                  <span key={v} className={dailyBudget === v ? "text-[#f59e0b] font-bold" : ""}>{v === dailyBudget ? "↑" : ""}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 30, 50].map(b => (
                <button key={b} type="button" onClick={() => { setDailyBudget(b); setStep(3); }}
                  className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${dailyBudget === b ? "bg-[#f59e0b] text-[#0b1220] border-[#f59e0b]" : "border-white/10 text-white/50 hover:border-white/25"}`}>
                  ${b}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Launch */}
        {step >= 2 && (
          <div className="card rounded-2xl p-6">
            <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1">Step 3</p>
            <h2 className="text-lg font-bold text-white mb-2">We handle the rest</h2>
            <p className="text-white/40 text-sm mb-6">
              We&apos;ll create your ads, test them automatically, and after 2 weeks keep only the best one running.
            </p>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <button
              onClick={handleStart}
              disabled={generating}
              className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-base py-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {generating ? "Setting up your ads…" : "Start my ads →"}
            </button>
            <p className="text-white/20 text-xs text-center mt-3">No extra charge — included in your plan</p>
          </div>
        )}
      </div>
    </div>
  );
}
