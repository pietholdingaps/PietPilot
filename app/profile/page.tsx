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

  // Editable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Billing
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    fetch(`/api/dashboard?site=${siteId}`)
      .then((r) => r.json())
      .then((d) => {
        setSite(d.site);
        setName(d.site?.account_name || "");
        setEmail(d.site?.owner_email || d.site?.email || "");
        setBusinessName(d.site?.business_name || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [siteId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setSaveError("");
    try {
      const res = await fetch("/api/dashboard/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, businessName, accountName: name, ownerEmail: email }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function openBillingPortal() {
    setPortalLoading(true); setPortalError("");
    try {
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setPortalError("Could not open billing portal. Please contact support.");
    } catch {
      setPortalError("Something went wrong. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  const inputCls = "w-full bg-[#0b1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 placeholder:text-white/25";

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
          <Link href={`/dashboard?site=${siteId}`} className="text-white/40 text-sm hover:text-white transition-colors">
            ← Back to dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Profile</h1>
        <p className="text-white/40 text-sm mb-8">Manage your account and subscription</p>

        {/* Account info — editable */}
        <form onSubmit={handleSave} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-4 space-y-4">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Account info</p>

          <div>
            <label className="block text-sm text-white/40 mb-1.5">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm text-white/40 mb-1.5">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="your@email.com" type="email" />
          </div>
          <div>
            <label className="block text-sm text-white/40 mb-1.5">Business name</label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputCls} placeholder="Your business name" />
          </div>

          {saveError && <p className="text-red-400 text-sm">{saveError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-bold text-sm px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
        </form>

        {/* Subscription */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-4">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Subscription</p>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-extrabold text-lg tracking-tight">Starter</p>
              <p className="text-white/40 text-sm">$149/mo · renews automatically</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
          </div>
          {portalError && <p className="text-red-400 text-sm mb-3">{portalError}</p>}
          <button
            onClick={openBillingPortal}
            disabled={portalLoading}
            className="w-full text-sm font-bold px-5 py-3 rounded-xl border border-white/10 hover:border-[#f59e0b]/40 hover:text-[#f59e0b] transition-colors disabled:opacity-50"
          >
            {portalLoading ? "Opening…" : "Manage billing & subscription →"}
          </button>
          <p className="text-white/20 text-xs text-center mt-2">Update payment method, download invoices, or cancel — via Stripe.</p>
        </div>

        {/* Cancel */}
        <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-6">
          <p className="text-xs font-bold text-red-400/50 uppercase tracking-widest mb-3">Cancel subscription</p>
          <p className="text-white/40 text-sm mb-4">Canceling will stop your subscription at the end of the billing period. Your website will be taken offline.</p>
          <button onClick={openBillingPortal} disabled={portalLoading} className="text-sm font-semibold text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50">
            Cancel subscription →
          </button>
        </div>

      </div>
    </div>
  );
}
