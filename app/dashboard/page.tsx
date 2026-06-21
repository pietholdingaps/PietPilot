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
  keywords?: string[];
  negativeKeywords?: string[];
  estimatedClicksPerDay?: number;
  estimatedLeadsPerMonth?: number;
  focusService: string;
  paused?: boolean;
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
  slug?: string;
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
                  href={site.slug ? `/${site.slug}` : `/site/${site.id}`}
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

              <div className="card rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Leads</div>
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <h3 className="text-3xl font-extrabold text-white">{leads.length}</h3>
                      <p className="text-white/45 text-sm">{leads.length === 0 ? "No messages yet" : "total received"}</p>
                    </div>
                    <div className="flex items-end gap-1 h-14">
                      {(() => {
                        const days = Array.from({ length: 7 }, (_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - (6 - i));
                          return d.toDateString();
                        });
                        const counts = days.map(day =>
                          leads.filter(l => new Date(l.created_at).toDateString() === day).length
                        );
                        const max = Math.max(...counts, 1);
                        return counts.map((count, i) => (
                          <div key={i} className="w-5 rounded-t transition-all"
                            style={{
                              height: `${Math.max(8, (count / max) * 100)}%`,
                              background: count > 0 ? "#f59e0b" : "rgba(255,255,255,0.08)"
                            }}
                          />
                        ));
                      })()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/[0.06]">
                  <div className="text-center">
                    <p className="text-xl font-extrabold text-[#f59e0b]">{leads.filter(l => l.status === "new").length}</p>
                    <p className="text-xs text-white/30 mt-0.5">New</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-extrabold text-blue-400">{leads.filter(l => l.status === "contacted").length}</p>
                    <p className="text-xs text-white/30 mt-0.5">Contacted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-extrabold text-green-400">{leads.filter(l => l.status === "done").length}</p>
                    <p className="text-xs text-white/30 mt-0.5">Done</p>
                  </div>
                </div>
              </div>

              <div className="card rounded-2xl p-7 border border-[#f59e0b]/15">
                <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">🗺️ Google Maps</div>
                <h3 className="text-base font-bold text-white mb-1">Get found on Google Maps</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-4">Set up your free Google Business Profile — the #1 thing you can do to get more local customers.</p>
                <a
                  href="https://business.google.com/create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  Set up for free →
                </a>
              </div>
            </div>

            {/* LEADS + ADS row */}
            <div className="grid md:grid-cols-2 gap-4 mb-10">

            {/* LEADS */}
            <div className="card rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Leads</h2>
                <div className="flex gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">{leads.filter(l => l.status === "new").length} New</span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">{leads.filter(l => l.status === "contacted").length} Contacted</span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">{leads.filter(l => l.status === "done").length} Done</span>
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                  <p className="text-3xl mb-3">📭</p>
                  <p className="text-white/50 text-sm font-semibold">No leads yet</p>
                  <p className="text-white/30 text-xs mt-1 text-center">When someone fills out your contact form, they&apos;ll appear here.</p>
                </div>
              ) : (
                <div className="flex flex-col flex-1">
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
                      <div className={`rounded-xl border bg-[#0b1220] mb-3 ${lead.status === "new" ? "border-[#f59e0b]/20" : "border-white/[0.06]"}`}>
                        <div className="flex items-center gap-3 p-4">
                          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-white/60 flex-none">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white truncate">{lead.name}</p>
                            <p className="text-white/40 text-xs truncate">{contactEmail || contactPhone || lead.contact}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-none ${statusColors[lead.status || "new"]}`}>
                            {lead.status === "new" ? "New" : lead.status === "contacted" ? "Contacted" : "Done"}
                          </span>
                          <span className="text-white/25 text-xs flex-none">
                            {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 space-y-3">
                          <p className="text-white/60 text-sm leading-relaxed">{lead.message}</p>
                          <div className="flex gap-2">
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
                  <Link href={`/leads?site=${siteId}`}
                    className="mt-auto flex items-center justify-center w-full py-3 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-sm font-bold transition-colors">
                    See all leads →
                  </Link>
                </div>
              )}
            </div>

            {/* GOOGLE ADS */}
            {(() => {
              const hasActiveCampaign = generatedAds && generatedAds.ads && generatedAds.ads.length > 0;
              return (
                <div className="card rounded-2xl p-6 flex flex-col">
                  <div className="mb-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-1">Google Ads</div>
                    <h2 className="text-lg font-bold text-white">AI-generated ads</h2>
                  </div>

                  {!hasActiveCampaign ? (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3 mb-5">
                        {[
                          { emoji: "🎯", text: "Targets people searching for your exact services" },
                          { emoji: "🤖", text: "AI writes and tests the ads automatically" },
                          { emoji: "📈", text: "Only pay when someone clicks your ad" },
                        ].map(({ emoji, text }) => (
                          <div key={text} className="flex items-center gap-3">
                            <span className="text-lg flex-none">{emoji}</span>
                            <p className="text-sm text-white/50">{text}</p>
                          </div>
                        ))}
                      </div>
                      <Link href={`/ads?site=${siteId}`}
                        className="flex items-center justify-center w-full py-3 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-sm font-bold transition-colors">
                        Manage Google Ads →
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-none ${generatedAds.paused ? "bg-white/20" : "bg-green-400"}`} />
                        <span className="text-sm text-white/60">
                          {generatedAds.paused ? "Paused · $0/day" : `Running · $${generatedAds.dailyBudget}/day`}
                        </span>
                        <span className="text-white/20">·</span>
                        <span className="text-white/40 text-sm">{generatedAds.focusService === "all" ? "All services" : generatedAds.focusService}</span>
                      </div>
                      {generatedAds.ads.slice(0, 1).map((ad, i) => (
                        <div key={i} className="rounded-xl border bg-[#0b1220] border-white/[0.07] p-4">
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
                        className="mt-auto flex items-center justify-center w-full py-3 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-sm font-bold transition-colors">
                        Manage Google Ads →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })()}

            </div> {/* end grid */}

            {/* SUPPORT */}
            <div className="card rounded-2xl p-7">
              <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Support</div>
              <h3 className="text-lg font-bold text-white mb-2">We've got you</h3>
              <p className="text-white/45 text-sm leading-relaxed mb-4">
                Questions or want to change something on your site? Just reach out.
              </p>
              <a href={`/contact?from=dashboard&site=${siteId}`} className="text-[#f59e0b] text-sm font-semibold hover:text-[#fbbf24] transition-colors">
                Contact us →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
