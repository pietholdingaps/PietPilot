"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Campaign = {
  id: string;
  ads: { headlines: string[]; descriptions: string[] }[];
  keywords?: string[];
  focusService: string;
  dailyBudget: number;
  paused: boolean;
  startedAt: string;
};

export default function AdsPage() {
  return <Suspense fallback={null}><AdsInner /></Suspense>;
}

function AdsInner() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("site");
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [view, setView] = useState<"dashboard" | "setup">("dashboard");

  // Setup
  const [step, setStep] = useState(1);
  const [focus, setFocus] = useState("all");
  const [budget, setBudget] = useState(20);
  const [starting, setStarting] = useState(false);

  // Edit modal
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState(20);

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    fetch(`/api/dashboard?site=${siteId}`)
      .then(r => r.json())
      .then(d => {
        setServices(d.site?.generated_copy?.services || []);
        const data = d.site?.generated_ads;
        // Support both old format (single) and new format (campaigns array)
        if (data?.campaigns) {
          setCampaigns(data.campaigns);
        } else if (data?.ads?.length) {
          // Migrate old format
          setCampaigns([{
            id: "legacy",
            ads: data.ads,
            keywords: data.keywords,
            focusService: data.focusService || "all",
            dailyBudget: data.dailyBudget || 20,
            paused: data.paused || false,
            startedAt: data.startedAt || new Date().toISOString(),
          }]);
        }
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
    if (res.ok && data.campaigns) {
      setCampaigns(data.campaigns);
      setView("dashboard");
    }
    setStarting(false);
  }

  async function toggleCampaign(id: string, currentPaused: boolean) {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, paused: !currentPaused } : c));
    await fetch("/api/update-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, campaignId: id, paused: !currentPaused }),
    });
  }

  async function deleteCampaign(id: string) {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    await fetch("/api/update-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, campaignId: id, deleteCampaign: true }),
    });
  }

  async function saveBudget(id: string) {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, dailyBudget: editBudget } : c));
    setEditingId(null);
    await fetch("/api/update-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, campaignId: id, dailyBudget: editBudget }),
    });
  }

  const activeCampaigns = campaigns.filter(c => !c.paused);
  const totalDaily = activeCampaigns.reduce((sum, c) => sum + c.dailyBudget, 0);

  if (loading) return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-[#f59e0b] rounded-full animate-spin" />
    </div>
  );

  // ── SETUP FLOW ───────────────────────────────────────────────────────────
  if (view === "setup") {
    return (
      <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] flex flex-col">
        <div className="border-b border-white/[0.06]">
          <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
            <button onClick={() => setView("dashboard")} className="text-white/30 text-sm hover:text-white transition-colors">← Back</button>
          </div>
        </div>
        <div className="h-1 bg-white/5">
          <div className="h-1 bg-[#f59e0b] transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-12">

          {step === 1 && (
            <div className="flex flex-col flex-1">
              <p className="text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-4">Step 1 of 3</p>
              <h1 className="text-4xl font-extrabold leading-tight mb-3">What kind of jobs do you want more of?</h1>
              <p className="text-white/40 text-lg mb-10">Pick one — you can always create more campaigns later.</p>
              <div className="space-y-3 flex-1">
                <button onClick={() => { setFocus("all"); setStep(2); }}
                  className="w-full p-7 rounded-2xl border border-white/10 hover:border-[#f59e0b]/50 bg-white/[0.02] hover:bg-[#f59e0b]/5 text-left transition-all">
                  <div className="flex items-center gap-5">
                    <span className="text-4xl">🔨</span>
                    <div>
                      <p className="text-xl font-bold text-white mb-1">Any job — just fill my schedule</p>
                      <p className="text-white/40">Show my ads to anyone searching for a tradesperson in my area</p>
                    </div>
                  </div>
                </button>
                {services.map(s => (
                  <button key={s} onClick={() => { setFocus(s); setStep(2); }}
                    className="w-full p-7 rounded-2xl border border-white/10 hover:border-[#f59e0b]/50 bg-white/[0.02] hover:bg-[#f59e0b]/5 text-left transition-all">
                    <div className="flex items-center gap-5">
                      <span className="text-4xl">🎯</span>
                      <div>
                        <p className="text-xl font-bold text-white mb-1">More {s} jobs</p>
                        <p className="text-white/40">Focus 100% of this campaign&apos;s budget on {s.toLowerCase()} enquiries</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col flex-1">
              <p className="text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-4">Step 2 of 3</p>
              <h1 className="text-4xl font-extrabold leading-tight mb-3">How much per day for this campaign?</h1>
              <p className="text-white/40 text-lg mb-10">This is the budget just for this campaign. You can run multiple campaigns at the same time.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { amount: 10, emoji: "🌱", label: "Just getting started", sub: "Good for testing" },
                  { amount: 20, emoji: "📈", label: "Steady growth", sub: "Most popular" },
                  { amount: 30, emoji: "🚀", label: "More customers", sub: "Great results" },
                  { amount: 50, emoji: "⚡", label: "Full speed", sub: "Maximum reach" },
                ].map(({ amount, emoji, label, sub }) => (
                  <button key={amount} onClick={() => { setBudget(amount); setStep(3); }}
                    className={`p-6 rounded-2xl border text-left transition-all ${budget === amount ? "border-[#f59e0b] bg-[#f59e0b]/5" : "border-white/10 bg-white/[0.02] hover:border-[#f59e0b]/40"}`}>
                    <p className="text-3xl mb-3">{emoji}</p>
                    <p className="text-2xl font-extrabold text-white mb-1">${amount}<span className="text-sm font-normal text-white/30">/day</span></p>
                    <p className="text-sm font-semibold text-white/70 mb-1">{label}</p>
                    <p className="text-xs text-white/30">{sub}</p>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#f59e0b]/50 transition-colors mb-6">
                <span className="text-white/40 text-sm">$</span>
                <input type="number" min={5} placeholder="Custom amount"
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                  onChange={e => { const v = Number(e.target.value); if (v >= 5) setBudget(v); }} />
                <span className="text-white/40 text-sm">/day</span>
                <button type="button" onClick={() => setStep(3)}
                  className="bg-[#f59e0b] text-[#0b1220] font-bold text-xs px-3 py-1.5 rounded-lg">Use →</button>
              </div>
              <button onClick={() => setStep(1)} className="text-white/25 text-sm hover:text-white transition-colors">← Back</button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col flex-1">
              <p className="text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-4">Step 3 of 3</p>
              <h1 className="text-4xl font-extrabold leading-tight mb-3">Ready to launch!</h1>
              <p className="text-white/40 text-lg mb-10">We&apos;ll create 3 ads, test which works best, and keep only the winner after 14 days.</p>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 mb-8">
                <div className="flex justify-between items-center py-4 border-b border-white/[0.06]">
                  <p className="text-white/40">Focus</p>
                  <p className="font-bold text-lg">{focus === "all" ? "All job types" : focus}</p>
                </div>
                <div className="flex justify-between items-center py-4">
                  <p className="text-white/40">Daily budget</p>
                  <p className="font-bold text-lg">${budget}/day</p>
                </div>
              </div>
              <button onClick={handleStart} disabled={starting}
                className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-xl py-5 rounded-2xl transition-colors disabled:opacity-50 mb-3">
                {starting ? "Setting up…" : "Start this campaign →"}
              </button>
              <p className="text-white/20 text-sm text-center mb-6">Included in your plan · No extra charge</p>
              <button onClick={() => setStep(2)} className="text-white/25 text-sm hover:text-white transition-colors text-center block">← Back</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── DASHBOARD ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6]">
      <div className="border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
          <Link href={`/dashboard?site=${siteId}`} className="text-white/30 text-sm hover:text-white transition-colors">← Dashboard</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Google Ads</h1>
          <button onClick={() => { setStep(1); setFocus("all"); setBudget(20); setView("setup"); }}
            className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
            + New campaign
          </button>
        </div>

        {/* Overview card — only shown when campaigns exist */}
        {campaigns.length > 0 && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold">Overview — all campaigns</h2>
              <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full">Last 30 days</span>
            </div>

            {/* Spend summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl bg-[#080e1a] border border-white/[0.05] p-4 text-center">
                <p className="text-2xl font-extrabold text-[#f59e0b] mb-0.5">${totalDaily}</p>
                <p className="text-xs text-white/30">Active daily spend</p>
              </div>
              <div className="rounded-xl bg-[#080e1a] border border-white/[0.05] p-4 text-center">
                <p className="text-2xl font-extrabold text-white mb-0.5">$0</p>
                <p className="text-xs text-white/30">Total spent ever</p>
              </div>
              <div className="rounded-xl bg-[#080e1a] border border-white/[0.05] p-4 text-center">
                <p className="text-2xl font-extrabold text-white mb-0.5">{activeCampaigns.length}</p>
                <p className="text-xs text-white/30">Active campaigns</p>
              </div>
            </div>

            {/* Performance stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Total clicks", value: "0" },
                { label: "Total leads", value: "0" },
                { label: "Avg. cost/click", value: "$0.00" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-[#080e1a] border border-white/[0.05] p-4 text-center">
                  <p className="text-2xl font-extrabold text-white mb-0.5">{value}</p>
                  <p className="text-xs text-white/30">{label}</p>
                </div>
              ))}
            </div>

            {/* Chart placeholder */}
            <div>
              <p className="text-xs text-white/20 mb-3">Clicks per day</p>
              <div className="h-24 flex items-end gap-1">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="flex-1 rounded-t-sm"
                    style={{ background: i === 29 ? "#f59e0b33" : "#ffffff08", height: `${15 + Math.sin(i * 0.4) * 10 + Math.random() * 15}%` }} />
                ))}
              </div>
              <div className="flex justify-between text-xs text-white/15 mt-1.5">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
              <p className="text-white/15 text-xs text-center mt-3">Live data when Google Ads is connected</p>
            </div>
          </div>
        )}

        {/* No campaigns */}
        {campaigns.length === 0 && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-12 text-center">
            <p className="text-5xl mb-5">📢</p>
            <h2 className="text-xl font-bold mb-2">No campaigns yet</h2>
            <p className="text-white/40 text-sm mb-8 max-w-xs mx-auto">Start your first campaign and get more customers finding you on Google.</p>
            <button onClick={() => { setStep(1); setView("setup"); }}
              className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-bold px-8 py-3.5 rounded-xl transition-colors">
              Create my first campaign →
            </button>
          </div>
        )}

        {/* Campaign cards */}
        {campaigns.map(camp => (
          <div key={camp.id} className={`rounded-2xl border bg-white/[0.02] p-6 transition-opacity ${camp.paused ? "opacity-60 border-white/[0.05]" : "border-white/[0.07]"}`}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full flex-none ${camp.paused ? "bg-white/20" : "bg-green-400 animate-pulse"}`} />
                  <h2 className="font-extrabold text-lg">{camp.focusService === "all" ? "All services" : camp.focusService}</h2>
                </div>
                <p className="text-white/40 text-sm ml-4">
                  {camp.paused ? "Paused · $0/day" : `Running · $${camp.dailyBudget}/day`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-none ml-4">
                {/* Toggle */}
                <button onClick={() => toggleCampaign(camp.id, camp.paused)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${camp.paused ? "bg-white/10" : "bg-[#f59e0b]"}`}>
                  <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${camp.paused ? "left-0.5" : "left-5"}`} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[{ label: "Clicks", value: "0" }, { label: "Leads", value: "0" }, { label: "Cost/click", value: "$0.00" }].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-[#080e1a] border border-white/[0.05] p-3 text-center">
                  <p className="text-xl font-extrabold text-white">{value}</p>
                  <p className="text-xs text-white/30 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Ad preview */}
            {camp.ads[0] && (
              <div className="rounded-xl bg-[#080e1a] border border-white/[0.05] p-4 mb-4">
                <p className="text-[10px] text-green-400/60 mb-1">Ad preview</p>
                <div className="flex flex-wrap gap-x-1">
                  {camp.ads[0].headlines.map((h, j) => (
                    <span key={j} className="text-[#4285f4] text-sm font-semibold">
                      {h}{j < camp.ads[0].headlines.length - 1 && <span className="text-white/20 mx-1">|</span>}
                    </span>
                  ))}
                </div>
                <p className="text-white/40 text-xs mt-1">{camp.ads[0].descriptions[0]}</p>
              </div>
            )}

            {/* Edit budget */}
            {editingId === camp.id ? (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white/40 text-sm">$</span>
                <input type="number" min={5} defaultValue={camp.dailyBudget}
                  className="flex-1 bg-[#080e1a] border border-[#f59e0b]/50 rounded-lg px-3 py-2 text-sm text-white outline-none"
                  onChange={e => setEditBudget(Number(e.target.value))} autoFocus />
                <span className="text-white/40 text-sm">/day</span>
                <button onClick={() => saveBudget(camp.id)}
                  className="bg-[#f59e0b] text-[#0b1220] font-bold text-xs px-4 py-2 rounded-lg">Save</button>
                <button onClick={() => setEditingId(null)} className="text-white/30 text-xs hover:text-white">Cancel</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditingId(camp.id); setEditBudget(camp.dailyBudget); }}
                  className="flex-1 text-sm font-semibold py-2.5 rounded-xl border border-white/10 hover:border-white/25 transition-colors text-white/60">
                  Edit budget
                </button>
                <button onClick={() => deleteCampaign(camp.id)}
                  className="text-sm font-semibold py-2.5 px-5 rounded-xl border border-white/10 hover:border-red-500/30 hover:text-red-400 transition-colors text-white/30">
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {/* How it works */}
        {campaigns.length > 0 && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7">
            <h2 className="text-base font-bold mb-5">How your ads work</h2>
            <div className="space-y-4">
              {[
                { n: "1", text: "Each campaign runs 3 different ads with slightly different wording" },
                { n: "2", text: "After 14 days we find the best-performing ad in each campaign" },
                { n: "3", text: "The winner gets 100% of that campaign's budget — the others are deleted" },
              ].map(({ n, text }) => (
                <div key={n} className="flex gap-4 items-start">
                  <span className="w-7 h-7 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] text-xs font-black flex items-center justify-center flex-none mt-0.5">{n}</span>
                  <p className="text-white/50 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
