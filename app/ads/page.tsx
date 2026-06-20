"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type AdVariant = { headlines: string[]; descriptions: string[]; paused?: boolean };
type GeneratedAds = {
  ads: AdVariant[];
  keywords: string[];
  negativeKeywords: string[];
  focusService: string;
  dailyBudget: number;
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
  const [adFocus, setAdFocus] = useState("all");
  const [adBudget, setAdBudget] = useState("20");
  const [generatingAds, setGeneratingAds] = useState(false);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAds | null>(null);
  const [adsError, setAdsError] = useState("");

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    fetch(`/api/dashboard?site=${siteId}`)
      .then(r => r.json())
      .then(d => {
        setSite(d.site);
        if (d.site?.generated_ads) {
          setGeneratedAds(d.site.generated_ads);
          setAdFocus(d.site.generated_ads.focusService || "all");
          setAdBudget(String(d.site.generated_ads.dailyBudget || 20));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [siteId]);

  async function updateAds(newAds: AdVariant[]) {
    setGeneratedAds(prev => prev ? { ...prev, ads: newAds } : null);
    await fetch("/api/update-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, ads: newAds }),
    });
  }

  async function handleGenerateAds() {
    setGeneratingAds(true); setAdsError("");
    try {
      const res = await fetch("/api/generate-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, focusService: adFocus, dailyBudget: Number(adBudget) }),
      });
      const data = await res.json();
      if (!res.ok) { setAdsError(data.error || "Something went wrong"); return; }
      setGeneratedAds(data);
    } catch {
      setAdsError("Could not generate ads. Please try again.");
    } finally {
      setGeneratingAds(false);
    }
  }

  const services = site?.generated_copy?.services || [];
  const activeAds = generatedAds?.ads.filter(a => !a.paused) || [];

  if (loading) return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-6 py-12">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <span className="text-2xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
          <Link href={`/dashboard?site=${siteId}`} className="text-white/40 text-sm hover:text-white transition-colors">← Back to dashboard</Link>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Google Ads</h1>
        <p className="text-white/40 text-sm mb-8">AI writes ads that bring in the exact customers you want.</p>

        {/* Settings */}
        <div className="card rounded-2xl p-6 mb-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">What type of work do you want more of?</label>
            <select value={adFocus} onChange={e => setAdFocus(e.target.value)}
              className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50">
              <option value="all">All services equally</option>
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">Daily budget (USD)</label>
            <div className="flex gap-2">
              {["10", "20", "30", "50"].map(b => (
                <button key={b} type="button" onClick={() => setAdBudget(b)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${adBudget === b ? "bg-[#f59e0b] text-[#0b1220] border-[#f59e0b]" : "border-white/10 text-white/50 hover:border-white/25"}`}>
                  ${b}
                </button>
              ))}
              <input type="number" value={adBudget} onChange={e => setAdBudget(e.target.value)} min="5"
                className="w-20 bg-[#0b1220] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:border-[#f59e0b]/50" />
            </div>
          </div>
          {adsError && <p className="text-red-400 text-sm">{adsError}</p>}
          <button onClick={handleGenerateAds} disabled={generatingAds}
            className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50">
            {generatingAds ? "Generating your ads…" : generatedAds ? "Regenerate ads ↺" : "Generate my ads →"}
          </button>
        </div>

        {/* Ads */}
        {generatedAds && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">
                {activeAds.length} active · {generatedAds.ads.length} total
                <span className="text-white/30 font-normal ml-2">· ${generatedAds.dailyBudget}/day</span>
              </p>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">Coming soon</span>
            </div>

            {generatedAds.ads.length === 0 && (
              <p className="text-white/30 text-sm text-center py-6">All ads deleted — generate new ones above.</p>
            )}

            {generatedAds.ads.map((ad, i) => (
              <div key={i} className={`card rounded-2xl p-5 transition-opacity ${ad.paused ? "opacity-40" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                    Ad {i + 1}{ad.paused && <span className="text-white/20 normal-case font-normal"> · paused</span>}
                  </p>
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => updateAds(generatedAds.ads.map((a, j) => j === i ? { ...a, paused: !a.paused } : a))}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${ad.paused ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : "border-white/10 text-white/40 hover:border-white/25"}`}>
                      {ad.paused ? "▶ Resume" : "⏸ Pause"}
                    </button>
                    <button type="button"
                      onClick={() => updateAds(generatedAds.ads.filter((_, j) => j !== i))}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 text-white/30 hover:border-red-500/30 hover:text-red-400 transition-colors">
                      × Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-0.5 mb-2">
                  {ad.headlines.map((h, j) => (
                    <span key={j} className="text-[#4285f4] text-sm font-semibold">
                      {h}{j < ad.headlines.length - 1 ? <span className="text-white/20 mx-1">|</span> : ""}
                    </span>
                  ))}
                </div>
                {ad.descriptions.map((d, j) => (
                  <p key={j} className="text-white/50 text-xs leading-relaxed">{d}</p>
                ))}
              </div>
            ))}

            {/* Keywords */}
            {generatedAds.keywords.length > 0 && (
              <div className="card rounded-2xl p-5">
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Target keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {generatedAds.keywords.map(k => (
                    <span key={k} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
