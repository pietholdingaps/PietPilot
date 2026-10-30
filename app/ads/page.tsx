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
  const [view, setView] = useState<"connect" | "dashboard" | "setup">("connect");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleCustomerId, setGoogleCustomerId] = useState("");
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");

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
        const connected = d.site?.google_ads_connected || false;
        setGoogleConnected(connected);
        setGoogleCustomerId(d.site?.google_ads_customer_id || "");
        setCustomerIdInput(d.site?.google_ads_customer_id || "");
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
        setView(connected ? "dashboard" : "connect");
        setLoading(false);
      });
  }, [siteId]);

  async function handleConnect() {
    const clean = customerIdInput.replace(/[-\s]/g, "");
    if (clean.length !== 10) { setConnectError("A Google Ads Customer ID is 10 digits — e.g. 123-456-7890"); return; }
    setConnecting(true); setConnectError("");
    await fetch("/api/dashboard/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, googleAdsCustomerId: clean, googleAdsConnected: true }),
    });
    setGoogleConnected(true);
    setGoogleCustomerId(clean);
    setView("dashboard");
    setConnecting(false);
  }

  async function handleDisconnect() {
    await fetch("/api/dashboard/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, googleAdsCustomerId: null, googleAdsConnected: false }),
    });
    setGoogleConnected(false);
    setGoogleCustomerId("");
    setView("connect");
  }

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

  // ── CONNECT GOOGLE ADS ──────────────────────────────────────────────────
  if (view === "connect") {
    const [connectStep, setConnectStep] = useState(1);

    return (
      <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] flex flex-col">
        <div className="border-b border-white/[0.06]">
          <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
            <Link href={`/dashboard?site=${siteId}`} className="text-white/30 text-sm hover:text-white transition-colors">← Dashboard</Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div className="h-1 bg-[#f59e0b] transition-all duration-500" style={{ width: `${(connectStep / 3) * 100}%` }} />
        </div>

        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-12">

          {/* Step 1: Create account */}
          {connectStep === 1 && (
            <div className="flex flex-col flex-1">
              <p className="text-[#f59e0b] text-xs font-bold uppercase tracking-widest mb-6">Step 1 of 3</p>
              <h1 className="text-3xl font-extrabold mb-3">First, create a free Google Ads account</h1>
              <p className="text-white/40 text-base mb-8">You need a Google Ads account before we can run your ads. It only takes 2 minutes and it&apos;s completely free to set up.</p>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-6 space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="text-2xl flex-none">1️⃣</span>
                  <p className="text-white/70 text-sm leading-relaxed">Open a new tab and go to <strong className="text-white">ads.google.com</strong></p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-2xl flex-none">2️⃣</span>
                  <p className="text-white/70 text-sm leading-relaxed">Click <strong className="text-white">&quot;Start now&quot;</strong> and sign in with your Gmail account</p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-2xl flex-none">3️⃣</span>
                  <p className="text-white/70 text-sm leading-relaxed">Google will ask you to create a campaign — click <strong className="text-white">&quot;Switch to Expert Mode&quot;</strong> at the bottom, then <strong className="text-white">&quot;Create an account without a campaign&quot;</strong></p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-2xl flex-none">4️⃣</span>
                  <p className="text-white/70 text-sm leading-relaxed">Fill in your country, timezone and currency — then click <strong className="text-white">&quot;Submit&quot;</strong></p>
                </div>
              </div>

              <p className="text-white/30 text-sm text-center mb-8">Already have a Google Ads account? Skip this step.</p>

              <button onClick={() => setConnectStep(2)}
                className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-base py-4 rounded-xl transition-colors">
                I have a Google Ads account →
              </button>
            </div>
          )}

          {/* Step 2: Add payment */}
          {connectStep === 2 && (
            <div className="flex flex-col flex-1">
              <p className="text-[#f59e0b] text-xs font-bold uppercase tracking-widest mb-6">Step 2 of 3</p>
              <h1 className="text-3xl font-extrabold mb-3">Add your payment method to Google</h1>
              <p className="text-white/40 text-base mb-2">You pay Google directly for the clicks. We never touch your ad budget — we only charge you the PietPilot subscription.</p>
              <p className="text-white/30 text-sm mb-8">You won&apos;t be charged until people actually click your ads.</p>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-6 space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="text-2xl flex-none">1️⃣</span>
                  <p className="text-white/70 text-sm leading-relaxed">In Google Ads, click the <strong className="text-white">wrench icon ⚙️</strong> in the top right corner</p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-2xl flex-none">2️⃣</span>
                  <p className="text-white/70 text-sm leading-relaxed">Click <strong className="text-white">Billing</strong> in the menu that appears</p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-2xl flex-none">3️⃣</span>
                  <p className="text-white/70 text-sm leading-relaxed">Click <strong className="text-white">Payment methods</strong> and add your credit or debit card</p>
                </div>
              </div>

              <button onClick={() => setConnectStep(3)}
                className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-base py-4 rounded-xl transition-colors mb-3">
                Payment method added →
              </button>
              <button onClick={() => setConnectStep(1)} className="text-white/25 text-sm hover:text-white transition-colors text-center">← Back</button>
            </div>
          )}

          {/* Step 3: Enter Customer ID */}
          {connectStep === 3 && (
            <div className="flex flex-col flex-1">
              <p className="text-[#f59e0b] text-xs font-bold uppercase tracking-widest mb-6">Step 3 of 3</p>
              <h1 className="text-3xl font-extrabold mb-3">Enter your Customer ID</h1>
              <p className="text-white/40 text-base mb-8">This is a 10-digit number that identifies your Google Ads account. Here&apos;s exactly how to find it:</p>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-6 space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="text-2xl flex-none">1️⃣</span>
                  <p className="text-white/70 text-sm leading-relaxed">Go to <strong className="text-white">ads.google.com</strong> and make sure you&apos;re logged in</p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-2xl flex-none">2️⃣</span>
                  <p className="text-white/70 text-sm leading-relaxed">Look at the <strong className="text-white">top right corner</strong> of the page — you&apos;ll see your name and below it a number that looks like <strong className="text-white font-mono">123-456-7890</strong></p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-2xl flex-none">3️⃣</span>
                  <p className="text-white/70 text-sm leading-relaxed">Copy that number and paste it in the field below</p>
                </div>

                {/* Visual mockup of where to find it */}
                <div className="mt-2 rounded-xl border border-white/10 bg-[#080e1a] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-sm bg-[#4285f4] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">G</span>
                      </div>
                      <span className="text-white/50 text-xs">Google Ads</span>
                    </div>
                    <div className="text-right border-2 border-[#f59e0b] rounded-lg px-3 py-1.5">
                      <p className="text-white text-xs font-semibold">Your Name</p>
                      <p className="text-[#f59e0b] text-xs font-mono font-bold">123-456-7890</p>
                    </div>
                  </div>
                  <p className="text-[#f59e0b] text-xs text-right">👆 Your Customer ID is here</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={customerIdInput}
                  onChange={e => setCustomerIdInput(e.target.value)}
                  placeholder="123-456-7890"
                  className="w-full bg-[#080e1a] border border-white/10 rounded-xl px-4 py-4 text-xl font-mono text-white focus:outline-none focus:border-[#f59e0b]/50 placeholder:text-white/20 tracking-widest text-center"
                />
                {connectError && <p className="text-red-400 text-sm text-center">{connectError}</p>}
                <button onClick={handleConnect} disabled={connecting || !customerIdInput.trim()}
                  className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-base py-4 rounded-xl transition-colors disabled:opacity-50">
                  {connecting ? "Connecting…" : "Connect my account →"}
                </button>
                <p className="text-white/20 text-xs text-center">We use this to create campaigns on your behalf. You keep full control of your billing.</p>
              </div>

              <button onClick={() => setConnectStep(2)} className="text-white/25 text-sm hover:text-white transition-colors text-center block">← Back</button>
            </div>
          )}

        </div>
      </div>
    );
  }

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

        {/* Overview card — always visible */}
        {(
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
        {/* Google Account — always visible */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Google Ads account</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-green-400 font-semibold">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/[0.05]">
            <p className="text-white/40 text-sm">Customer ID</p>
            <p className="font-mono text-sm font-semibold">
              {googleCustomerId.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setView("connect")}
              className="flex-1 text-sm font-semibold py-2.5 rounded-xl border border-white/10 hover:border-white/25 transition-colors text-white/50">
              Change account
            </button>
            <button onClick={handleDisconnect}
              className="text-sm font-semibold py-2.5 px-5 rounded-xl border border-white/10 hover:border-red-500/30 hover:text-red-400 transition-colors text-white/30">
              Disconnect
            </button>
          </div>
        </div>

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
