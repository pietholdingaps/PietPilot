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
    setPortalLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Could not open billing portal. Please contact support.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  const planName = "Starter";
  const planPrice = "$149/mo";

  if (loading) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans antialiased">
      {/* Nav */}
      <nav className="border-b border-white/[0.06] px-6 h-16 flex items-center justify-between max-w-4xl mx-auto">
        <span className="text-base font-extrabold tracking-tight">PietPilot</span>
        <Link
          href={`/dashboard?site=${siteId}`}
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          ← Back to dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Account</h1>
          <p className="text-white/40 text-sm mt-1">Manage your account and subscription</p>
        </div>

        {/* Account info */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest">Account info</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-white/30 mb-0.5">Name</p>
              <p className="text-sm font-semibold">{site?.account_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-white/30 mb-0.5">Email</p>
              <p className="text-sm font-semibold">{site?.owner_email || site?.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-white/30 mb-0.5">Business</p>
              <p className="text-sm font-semibold">{site?.business_name || "—"}</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest">Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">{planName}</p>
              <p className="text-white/40 text-sm">{planPrice} · renews automatically</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              Active
            </span>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={openBillingPortal}
            disabled={portalLoading}
            className="w-full text-sm font-bold px-5 py-3 rounded-xl border border-white/10 hover:border-white/25 transition-colors disabled:opacity-50"
          >
            {portalLoading ? "Opening…" : "Manage billing & subscription →"}
          </button>
          <p className="text-white/25 text-xs text-center">
            Change plan, update payment method, or cancel — all handled securely via Stripe.
          </p>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-6 space-y-3">
          <h2 className="text-sm font-bold text-red-400/70 uppercase tracking-widest">Cancel subscription</h2>
          <p className="text-white/40 text-sm">
            Canceling will stop your subscription at the end of the current billing period. Your website will be taken offline.
          </p>
          <button
            onClick={openBillingPortal}
            disabled={portalLoading}
            className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            Cancel subscription →
          </button>
        </div>
      </div>
    </div>
  );
}
