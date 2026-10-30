"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SetupDomain() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}

function Inner() {
  const params = useSearchParams();
  const siteId = params.get("site");

  const [domain, setDomain] = useState("");
  const [currentDomain, setCurrentDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ isApex: boolean; cname: string; aRecord?: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!siteId) return;
    fetch(`/api/dashboard?site=${siteId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.site?.custom_domain) {
          setCurrentDomain(d.site.custom_domain);
          setDomain(d.site.custom_domain);
        }
        if (d.site?.setup_completed?.domain) setDone(true);
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  async function handleConnect() {
    const clean = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!clean) return;
    setSaving(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, domain: clean }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setCurrentDomain(clean);
      setResult({ isApex: data.isApex, cname: data.cname, aRecord: data.aRecord });
    } catch {
      setError("Could not connect domain. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <Screen siteId={siteId}><p className="text-white/40 text-sm">Loading…</p></Screen>
  );

  return (
    <Screen siteId={siteId}>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">Connect your domain</h1>
        <p className="text-white/45 text-sm">Use your own domain (e.g. smithplumbing.com) instead of pietpilot.com/smith-plumbing.</p>
      </div>

      {currentDomain && !result && (
        <div className="card rounded-2xl p-5 mb-6 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-none" />
          <div>
            <p className="text-sm font-bold text-white">{currentDomain}</p>
            <p className="text-xs text-white/40">Currently connected</p>
          </div>
        </div>
      )}

      <div className="card rounded-2xl p-6 mb-6">
        <label className="block text-sm font-semibold text-white/70 mb-2">Your domain</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            placeholder="yourcompany.com"
            className="flex-1 bg-[#0b1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 placeholder:text-white/25"
          />
          <button
            onClick={handleConnect}
            disabled={saving || !domain.trim()}
            className="bg-[#f59e0b] hover:bg-[#fbbf24] disabled:opacity-40 text-[#0b1220] font-bold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            {saving ? "Connecting…" : "Connect"}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <p className="text-white/30 text-xs mt-2">Don't have a domain yet? Buy one at <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="text-[#f59e0b]">Namecheap</a> or <a href="https://domains.google" target="_blank" rel="noopener noreferrer" className="text-[#f59e0b]">Google Domains</a> (~$12/year).</p>
      </div>

      {result && (
        <div className="card rounded-2xl p-6">
          <p className="text-sm font-bold text-white mb-1">✓ Domain registered — add these DNS records</p>
          <p className="text-white/40 text-sm mb-5">Log in to your domain registrar (Namecheap, GoDaddy, etc.) and add the following:</p>

          {result.isApex ? (
            <div className="space-y-3">
              <DnsRow type="A" name="@" value={result.aRecord || "76.76.21.21"} />
              <DnsRow type="CNAME" name="www" value="cname.vercel-dns.com" />
            </div>
          ) : (
            <DnsRow type="CNAME" name={currentDomain.replace(/\.[^.]+\.[^.]+$/, "")} value={result.cname || "cname.vercel-dns.com"} />
          )}

          <p className="text-white/30 text-xs mt-5">DNS changes take 5–30 minutes to go live. Refresh this page to check.</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
        <p className="text-white/35 text-sm">Done connecting your domain?</p>
        {done ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">✓ Marked as done</div>
        ) : (
          <button
            onClick={async () => {
              await fetch("/api/setup-complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ siteId, step: "domain" }),
              });
              setDone(true);
            }}
            className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            Done ✓
          </button>
        )}
      </div>
    </Screen>
  );
}

function DnsRow({ type, name, value }: { type: string; name: string; value: string }) {
  return (
    <div className="bg-[#0b1220] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <span className="text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-1 rounded flex-none w-fit">{type}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/40">Name / Host</p>
        <p className="text-sm font-mono text-white">{name}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/40">Value / Points to</p>
        <p className="text-sm font-mono text-white/80 truncate">{value}</p>
      </div>
    </div>
  );
}

function Screen({ siteId, children }: { siteId: string | null; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-4 sm:px-6 py-12">
      <div className="max-w-xl mx-auto">
        <Link href={`/dashboard?site=${siteId}`} className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/70 text-sm mb-8 transition-colors">
          ← Back to dashboard
        </Link>
        {children}
      </div>
    </div>
  );
}
