"use client";

import { useState, useEffect, useCallback } from "react";

type Stats = {
  mrr: number;
  arr: number;
  activeCustomers: number;
  newThisMonth: number;
  churnedThisMonth: number;
  churnRate: number;
  lifetimeMonths: number | null;
  ltv: number | null;
  growthRate: number | null;
  totalSites: number;
  totalLeads: number;
  profit: number;
  costs: Record<string, number>;
  totalCosts: number;
  avgRevenue: number;
};

function fmt(n: number, decimals = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtUsd(n: number) {
  return "$" + fmt(n);
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-2">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/30">{label}</div>
      <div className={`text-3xl font-extrabold tracking-tight tabular-nums ${color || "text-white"}`}>{value}</div>
      {sub && <div className="text-xs text-white/30">{sub}</div>}
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedPw, setSavedPw] = useState("");

  const fetchStats = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", { headers: { "x-admin-key": pw } });
      if (res.status === 401) { setError("Wrong password."); setAuthed(false); return; }
      if (!res.ok) { setError("Could not load stats. Check Stripe key."); return; }
      const data = await res.json();
      setStats(data);
      setAuthed(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSavedPw(password);
    fetchStats(password);
  }

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!authed || !savedPw) return;
    const t = setInterval(() => fetchStats(savedPw), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [authed, savedPw, fetchStats]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center px-6">
        <div className="mb-8 text-center">
          <span className="text-2xl font-extrabold tracking-tight">
            Piet<span className="text-[#f59e0b]">Pilot</span>
          </span>
          <p className="text-white/30 text-sm mt-2">Founder Dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm outline-none focus:border-[#f59e0b]/40 transition-all"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] disabled:opacity-40 text-[#0b1220] font-bold text-sm py-3.5 rounded-xl transition-colors"
          >
            {loading ? "Loading…" : "Enter →"}
          </button>
        </form>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#f59e0b] rounded-full animate-spin" />
      </div>
    );
  }

  const s = stats!;
  const today = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#080808] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Piet<span className="text-[#f59e0b]">Pilot</span>
              <span className="text-white/30 font-normal ml-3 text-lg">Founder</span>
            </h1>
            <p className="text-white/25 text-sm mt-0.5">{today}</p>
          </div>
          <button
            onClick={() => fetchStats(savedPw)}
            className="text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {/* MRR + ARR highlight */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#111] border border-[#f59e0b]/20 rounded-2xl p-8 flex flex-col gap-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#f59e0b]/60">MRR</div>
            <div className="text-5xl font-extrabold tracking-tight tabular-nums text-white">{fmtUsd(s.mrr)}</div>
            <div className="text-sm text-white/30">Monthly recurring revenue</div>
          </div>
          <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-8 flex flex-col gap-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/30">ARR</div>
            <div className="text-5xl font-extrabold tracking-tight tabular-nums text-white">{fmtUsd(s.arr)}</div>
            <div className="text-sm text-white/30">Annual run rate (MRR × 12)</div>
          </div>
        </div>

        {/* Core metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <Metric label="Active customers" value={fmt(s.activeCustomers)} sub={`${s.newThisMonth} new this month`} color="text-white" />
          <Metric label="Profit this month" value={fmtUsd(s.profit)} sub={`After ${fmtUsd(s.totalCosts)} costs`} color={s.profit >= 0 ? "text-emerald-400" : "text-red-400"} />
          <Metric label="Churn rate" value={`${s.churnRate}%`} sub={`${s.churnedThisMonth} churned this month`} color={s.churnRate === 0 ? "text-emerald-400" : s.churnRate < 5 ? "text-yellow-400" : "text-red-400"} />
          <Metric label="Growth rate" value={s.growthRate !== null ? `${s.growthRate > 0 ? "+" : ""}${s.growthRate}%` : "—"} sub="MoM new customers" color={s.growthRate !== null && s.growthRate > 0 ? "text-emerald-400" : "text-white/50"} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Metric label="Avg revenue / customer" value={fmtUsd(s.avgRevenue)} sub="Per month" />
          <Metric label="LTV" value={s.ltv !== null ? fmtUsd(s.ltv) : "—"} sub={s.lifetimeMonths !== null ? `${s.lifetimeMonths}mo avg lifetime` : "Need more data"} />
          <Metric label="Total sites" value={fmt(s.totalSites)} sub="All time signups" />
          <Metric label="Total leads" value={fmt(s.totalLeads)} sub="Across all sites" />
        </div>

        {/* Costs breakdown */}
        <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-6 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/30 mb-5">Monthly costs breakdown</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(s.costs).map(([name, cost]) => (
              <div key={name} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-sm text-white/50 capitalize">{name}</span>
                <span className="text-sm font-bold tabular-nums text-white/80">{fmtUsd(cost)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex justify-between items-center">
            <span className="text-sm font-bold text-white/50">Total monthly costs</span>
            <span className="text-lg font-extrabold tabular-nums text-white">{fmtUsd(s.totalCosts)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="text-xs text-white/20 space-y-1">
          <p>CAC — manual: calculate as (ad spend ÷ new customers) and track separately.</p>
          <p>Conversion rate — add Google Analytics to pietpilot.com for accurate visitor → customer data.</p>
          <p>Costs auto-include Stripe fees (2.9% + $0.30/sub). Other costs are estimates — update in <code className="text-white/30">app/api/admin/stats/route.ts</code> to reflect actuals.</p>
        </div>

      </div>
    </div>
  );
}
