"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type SiteInfo = {
  id: string;
  business_name: string;
  account_name: string;
  owner_email: string;
  email: string;
  phone: string;
  template: string;
  created_at: string;
};

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileInner />
    </Suspense>
  );
}

function ProfileInner() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("site");
  const [site, setSite] = useState<SiteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    fetch(`/api/dashboard?site=${siteId}`)
      .then((r) => r.json())
      .then((d) => { setSite(d.site); setLoading(false); })
      .catch(() => setLoading(false));
  }, [siteId]);

  async function openBillingPortal() {
    setPortalLoading(true); setError("");
    try {
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError("Could not open billing portal. Please contact support.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

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
          <span className="text-2xl font-extrabold tracking-tight">
            Piet<span className="text-[#f59e0b]">Pilot</span>
          </span>
          <Link
            href={`/dashboard?site=${siteId}`}
            className="text-white/40 text-sm hover:text-white transition-colors"
          >
            ← Back to dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Profile</h1>
        <p className="text-white/40 text-sm mb-8">Manage your account and subscription</p>

        {/* Account info */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-4">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Account info</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/[0.05]">
              <span className="text-sm text-white/40">Name</span>
              <span className="text-sm font-semibold">{site?.account_name || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/[0.05]">
              <span className="text-sm text-white/40">Email</span>
              <span className="text-sm font-semibold">{site?.owner_email || site?.email || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-white/40">Business</span>
              <span className="text-sm font-semibold">{site?.business_name || "—"}</span>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-4">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Subscription</p>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-extrabold text-lg tracking-tight">Starter</p>
              <p className="text-white/40 text-sm">$149/mo · renews automatically</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              Active
            </span>
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            onClick={openBillingPortal}
            disabled={portalLoading}
            className="w-full text-sm font-bold px-5 py-3 rounded-xl border border-white/10 hover:border-[#f59e0b]/40 hover:text-[#f59e0b] transition-colors disabled:opacity-50"
          >
            {portalLoading ? "Opening…" : "Manage billing & subscription →"}
          </button>
          <p className="text-white/20 text-xs text-center mt-2">
            Update payment method, download invoices, or cancel — handled securely via Stripe.
          </p>
        </div>

        {/* Cancel */}
        <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-6">
          <p className="text-xs font-bold text-red-400/50 uppercase tracking-widest mb-3">Cancel subscription</p>
          <p className="text-white/40 text-sm mb-4">
            Canceling will stop your subscription at the end of the billing period. Your website will be taken offline.
          </p>
          <button
            onClick={openBillingPortal}
            disabled={portalLoading}
            className="text-sm font-semibold text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            Cancel subscription →
          </button>
        </div>

      </div>
    </div>
  );
}
