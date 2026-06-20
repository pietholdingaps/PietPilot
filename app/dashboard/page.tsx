"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Lead = {
  id: string;
  name: string;
  contact: string;
  email?: string;
  phone?: string;
  message: string;
  created_at: string;
  status: "new" | "contacted" | "done";
};

type AdVariant = { headlines: string[]; descriptions: string[]; paused?: boolean };
type GeneratedAds = {
  ads: AdVariant[];
  keywords: string[];
  negativeKeywords: string[];
  estimatedClicksPerDay: number;
  estimatedLeadsPerMonth: number;
  focusService: string;
  dailyBudget: number;
};

type SiteInfo = {
  id: string;
  business_name: string;
  trade: string;
  area: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  logo_url: string;
  template: string;
  owner_name?: string;
  account_name?: string;
  generated_copy?: { services?: string[] };
  generated_ads?: GeneratedAds;
};

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const searchParams = useSearchParams();
  const [siteId, setSiteId] = useState<string | null>(null);
  const [site, setSite] = useState<SiteInfo | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [regenDone, setRegenDone] = useState(false);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  // ── Google Ads ──
  const [adFocus, setAdFocus] = useState("all");
  const [adBudget, setAdBudget] = useState("20");
  const [generatingAds, setGeneratingAds] = useState(false);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAds | null>(null);
  const [adsError, setAdsError] = useState("");

  async function updateAds(newAds: AdVariant[]) {
    setGeneratedAds((prev) => prev ? { ...prev, ads: newAds } : null);
    await fetch("/api/update-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, ads: newAds }),
    });
  }

  function toggleAdPause(index: number) {
    if (!generatedAds) return;
    const updated = generatedAds.ads.map((ad, i) => i === index ? { ...ad, paused: !ad.paused } : ad);
    updateAds(updated);
  }

  function deleteAd(index: number) {
    if (!generatedAds) return;
    updateAds(generatedAds.ads.filter((_, i) => i !== index));
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

  async function updateLeadStatus(leadId: string, status: Lead["status"]) {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status } : l));
    await fetch("/api/lead/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, status }),
    });
  }

  useEffect(() => {
    const fromUrl = searchParams.get("site");
    if (fromUrl) {
      setSiteId(fromUrl);
      localStorage.setItem("pietpilot_site_id", fromUrl);
    } else {
      const stored = localStorage.getItem("pietpilot_site_id");
      if (stored) setSiteId(stored);
      else setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!siteId) return;
    setLoading(true);
    fetch(`/api/dashboard?site=${siteId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.site) {
          setSite(data.site);
          if (data.site.generated_ads) {
            setGeneratedAds(data.site.generated_ads);
            setAdFocus(data.site.generated_ads.focusService || "all");
            setAdBudget(String(data.site.generated_ads.dailyBudget || 20));
          }
        }
        if (data.leads) setLeads(data.leads);
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  async function handleRegenerate() {
    if (!siteId || regenerating) return;
    setRegenerating(true);
    setRegenDone(false);
    try {
      await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: siteId }),
      });
      setRegenDone(true);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <span className="text-2xl font-extrabold tracking-tight">
            Piet<span className="text-[#f59e0b]">Pilot</span>
          </span>
          <span className="text-white/40 text-sm">Dashboard</span>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Loading…</p>
        ) : !siteId || !site ? (
          <div className="card rounded-2xl p-8">
            <h1 className="text-xl font-extrabold mb-2">No website found</h1>
            <p className="text-white/45 text-sm">
              We couldn't find a website linked to this browser. If you just signed up,
              try opening the link from your confirmation email.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-1">
                  Welcome back, {(site.account_name || site.owner_name)?.split(" ")[0] || site.business_name || "there"} 👋
                </h1>
                <p className="text-white/45 text-base">
                  Here's how your website is doing.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/profile?site=${site.id}`}
                  className="border border-white/10 hover:border-white/25 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Profile
                </Link>
                <a
                  href={`/site/${site.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/10 hover:border-white/25 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  View website ↗
                </a>
                <Link
                  href={`/dashboard/edit?site=${site.id}`}
                  className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
                >
                  Edit website
                </Link>
              </div>
            </div>

            {/* STATS */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              <div className="card rounded-2xl p-7">
                <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Status</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Live & published</h3>
                </div>
                <p className="text-white/45 text-sm leading-relaxed">
                  {site.trade || "Your business"} · {site.area || "Local area"}
                </p>
              </div>

              <div className="card rounded-2xl p-7">
                <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Leads</div>
                <h3 className="text-3xl font-extrabold text-white mb-1">{leads.length}</h3>
                <p className="text-white/45 text-sm leading-relaxed">
                  {leads.length === 0 ? "No messages yet" : "total messages received"}
                </p>
              </div>

              <div className="card rounded-2xl p-7">
                <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Plan</div>
                <h3 className="text-lg font-bold text-white mb-2">AI Website</h3>
                <p className="text-white/45 text-sm leading-relaxed">
                  Google Ads & lead-follow-up coming soon as add-ons.
                </p>
              </div>
            </div>

            {/* LEADS */}
            <div className="card rounded-2xl p-7 mb-10">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white">Leads</h2>
                  <p className="text-white/40 text-xs mt-0.5">
                    {leads.filter(l => l.status === "new").length > 0
                      ? `${leads.filter(l => l.status === "new").length} new · ${leads.length} total`
                      : `${leads.length} total`}
                  </p>
                </div>
                {leads.length > 0 && (
                  <Link href={`/leads?site=${siteId}`}
                    className="text-sm font-bold text-[#f59e0b] hover:opacity-70 transition-opacity">
                    See all →
                  </Link>
                )}
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-3">📭</p>
                  <p className="text-white/50 text-sm font-semibold">No leads yet</p>
                  <p className="text-white/30 text-xs mt-1">When someone fills out your contact form, they&apos;ll appear here.</p>
                </div>
              ) : (
                <>
                  {/* Latest lead only */}
                  {(() => {
                    const lead = leads[0];
                    const contactEmail = lead.email || (lead.contact?.includes("@") ? lead.contact : null);
                    const contactPhone = lead.phone || (!lead.contact?.includes("@") ? lead.contact : null);
                    const statusColors: Record<string, string> = {
                      new: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
                      contacted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      done: "bg-green-500/10 text-green-400 border-green-500/20",
                    };
                    return (
                      <div className={`rounded-xl border bg-[#0b1220] ${lead.status === "new" ? "border-[#f59e0b]/20" : "border-white/[0.06]"}`}>
                        <div className="flex items-center gap-3 p-4">
                          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-white/60 flex-none">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white">{lead.name}</p>
                            <p className="text-white/40 text-xs truncate">{contactEmail || contactPhone || lead.contact}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-none ${statusColors[lead.status || "new"]}`}>
                            {lead.status === "new" ? "New" : lead.status === "contacted" ? "Contacted" : "Done"}
                          </span>
                          <span className="text-white/25 text-xs flex-none">
                            {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
                          <p className="text-white/60 text-sm leading-relaxed line-clamp-2">{lead.message}</p>
                          <div className="flex gap-2 mt-3">
                            {contactEmail && (
                              <a href={`mailto:${contactEmail}?subject=Re: Your inquiry&body=Hi ${lead.name},%0D%0A%0D%0AThank you for reaching out!`}
                                className="text-xs font-bold px-3 py-2 rounded-lg bg-[#f59e0b] text-[#0b1220] hover:bg-[#fbbf24] transition-colors">
                                ✉ Reply
                              </a>
                            )}
                            {contactPhone && (
                              <a href={`tel:${contactPhone}`}
                                className="text-xs font-bold px-3 py-2 rounded-lg border border-white/10 hover:border-white/25 transition-colors">
                                📞 Call
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  {leads.length > 1 && (
                    <Link href={`/leads?site=${siteId}`}
                      className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/[0.07] text-sm text-white/40 hover:text-white hover:border-white/20 transition-colors font-semibold">
                      See all {leads.length} leads →
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* GOOGLE ADS */}
            <div className="card rounded-2xl p-7 mb-10">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-1">Google Ads</div>
                  <h2 className="text-lg font-bold text-white">AI-generated ads</h2>
                </div>
                <Link href={`/ads?site=${siteId}`}
                  className="text-sm font-bold text-[#f59e0b] hover:opacity-70 transition-opacity">
                  {generatedAds ? "Manage ads →" : "Set up →"}
                </Link>
              </div>

              {!generatedAds ? (
                <div className="text-center py-6">
                  <p className="text-white/50 text-sm mb-4">AI writes ads that bring in exactly the customers you want.</p>
                  <Link href={`/ads?site=${siteId}`}
                    className="inline-block bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-bold text-sm px-6 py-3 rounded-xl transition-colors">
                    Generate my ads →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white/40">{generatedAds.ads.filter(a => !a.paused).length} active</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/40">{generatedAds.ads.filter(a => a.paused).length} paused</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/40">${generatedAds.dailyBudget}/day</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/40">{generatedAds.focusService === "all" ? "All services" : generatedAds.focusService}</span>
                  </div>
                  {generatedAds.ads.slice(0, 1).map((ad, i) => (
                    <div key={i} className={`rounded-xl border bg-[#0b1220] p-4 ${ad.paused ? "opacity-40 border-white/[0.04]" : "border-white/[0.07]"}`}>
                      <div className="space-y-0.5 mb-1">
                        {ad.headlines.map((h, j) => (
                          <span key={j} className="text-[#4285f4] text-sm font-semibold">
                            {h}{j < ad.headlines.length - 1 ? <span className="text-white/20 mx-1">|</span> : ""}
                          </span>
                        ))}
                      </div>
                      <p className="text-white/40 text-xs">{ad.descriptions[0]}</p>
                    </div>
                  ))}
                  <Link href={`/ads?site=${siteId}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/[0.07] text-sm text-white/40 hover:text-white hover:border-white/20 transition-colors font-semibold">
                    Manage all {generatedAds.ads.length} ads →
                  </Link>
                </div>
              )}
            </div>

            {/* SUPPORT */}
            <div className="card rounded-2xl p-7">
              <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Support</div>
              <h3 className="text-lg font-bold text-white mb-2">We've got you</h3>
              <p className="text-white/45 text-sm leading-relaxed mb-4">
                Questions or want to change something on your site? Just reach out.
              </p>
              <a href="/contact" className="text-[#f59e0b] text-sm font-semibold hover:text-[#fbbf24] transition-colors">
                Contact us →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
