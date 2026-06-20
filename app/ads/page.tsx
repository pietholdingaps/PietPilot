"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type AdVariant = { headlines: string[]; descriptions: string[]; paused?: boolean };
type GeneratedAds = {
  ads: AdVariant[];
  keywords: string[];
  negativeKeywords?: string[];
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
  const [showSettings, setShowSettings] = useState(false);

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
        } else {
          setShowSettings(true);
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
      setShowSettings(false);
    } catch {
      setAdsError("Could not generate ads. Please try again.");
    } finally {
      setGeneratingAds(false);
    }
  }

  const services = site?.generated_copy?.services || [];
  const activeCount = generatedAds?.ads.filter(a => !a.paused).length ?? 0;

  if (loading) return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <span className="text-2xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
          <Link href={`/dashboard?site=${siteId}`} className="text-white/40 text-sm hover:text-white transition-colors">← Back to dashboard</Link>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Google Ads</h1>
            <p className="text-white/40 text-sm mt-1">We generate 3 variations — run them all, then delete the ones that don&apos;t convert.</p>
          </div>
          {generatedAds && (
            <div className="text-right">
              <p className="text-sm font-bold text-white">{activeCount} active</p>
              <p className="text-xs text-white/30">${generatedAds.dailyBudget}/day</p>
            </div>
          )}
        </div>

        {/* Settings panel */}
        {(showSettings || !generatedAds) ? (
          <div className="card rounded-2xl p-6 mb-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-2">What type of work do you want more of?</label>
              <select value={adFocus} onChange={e => setAdFocus(e.target.value)}
                className="w-full bg-[#080e1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 appearance-none">
                <option value="all">All services equally</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/60 mb-2">Daily budget</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {["10", "20", "30", "50"].map(b => (
                  <button key={b} type="button" onClick={() => setAdBudget(b)}
                    className={`py-3 rounded-xl text-sm font-bold border transition-colors ${adBudget === b ? "bg-[#f59e0b] text-[#0b1220] border-[#f59e0b]" : "border-white/10 text-white/50 hover:border-white/25"}`}>
                    ${b}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-sm">$</span>
                <input type="number" value={adBudget} onChange={e => setAdBudget(e.target.value)} min="5"
                  placeholder="Custom amount"
                  className="flex-1 bg-[#080e1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 placeholder:text-white/20" />
                <span className="text-white/30 text-sm">/day</span>
              </div>
            </div>

            {adsError && <p className="text-red-400 text-sm">{adsError}</p>}

            <div className="flex gap-2">
              <button onClick={handleGenerateAds} disabled={generatingAds}
                className="flex-1 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50">
                {generatingAds ? "Generating…" : generatedAds ? "Regenerate ads" : "Generate my ads →"}
              </button>
              {generatedAds && (
                <button type="button" onClick={() => setShowSettings(false)}
                  className="px-5 border border-white/10 rounded-xl text-sm text-white/40 hover:border-white/25 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-white/30">
              Focused on: <span className="text-white/60">{generatedAds?.focusService === "all" ? "All services" : generatedAds?.focusService}</span>
            </p>
            <button type="button" onClick={() => setShowSettings(true)}
              className="text-xs font-bold text-[#f59e0b] hover:opacity-70 transition-opacity">
              Change settings ↗
            </button>
          </div>
        )}

        {/* Ad cards */}
        {generatedAds && !showSettings && (
          <div className="space-y-3">
            {generatedAds.ads.length === 0 && (
              <div className="card rounded-2xl p-8 text-center">
                <p className="text-white/30 text-sm mb-4">No ads — generate new ones above.</p>
                <button onClick={() => setShowSettings(true)} className="text-[#f59e0b] text-sm font-bold">Generate ads →</button>
              </div>
            )}

            {generatedAds.ads.map((ad, i) => (
              <div key={i} className={`card rounded-2xl p-5 transition-all ${ad.paused ? "opacity-50" : ""}`}>
                {/* Ad header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Ad {i + 1}</span>
                  <div className="flex items-center gap-3">
                    {/* Toggle */}
                    <button type="button"
                      onClick={() => updateAds(generatedAds.ads.map((a, j) => j === i ? { ...a, paused: !a.paused } : a))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ad.paused ? "bg-white/10" : "bg-[#f59e0b]"}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${ad.paused ? "translate-x-1" : "translate-x-6"}`} />
                    </button>
                    <span className="text-xs text-white/30">{ad.paused ? "Paused" : "Active"}</span>
                    <button type="button"
                      onClick={() => updateAds(generatedAds.ads.filter((_, j) => j !== i))}
                      className="text-white/20 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                  </div>
                </div>

                {/* Ad preview */}
                <div className="bg-[#080e1a] rounded-xl p-4 mb-0">
                  <p className="text-[10px] text-green-400/70 mb-1">Ad · pietpilot.com</p>
                  <div className="flex flex-wrap gap-x-1 mb-2">
                    {ad.headlines.map((h, j) => (
                      <span key={j} className="text-[#4285f4] text-sm font-semibold">
                        {h}{j < ad.headlines.length - 1 && <span className="text-white/20 mx-1">|</span>}
                      </span>
                    ))}
                  </div>
                  {ad.descriptions.map((d, j) => (
                    <p key={j} className="text-white/50 text-xs leading-relaxed">{d}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Keywords */}
            {generatedAds.keywords.length > 0 && (
              <div className="card rounded-2xl p-5">
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Target keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {generatedAds.keywords.map(k => (
                    <span key={k} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/[0.07] text-white/50">{k}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="card rounded-2xl p-5 text-center">
              <p className="text-sm font-bold text-white mb-1">Ready to launch</p>
              <p className="text-white/30 text-xs">Google Ads API connection coming soon — your ads are saved.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
