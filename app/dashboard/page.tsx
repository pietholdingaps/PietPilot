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
        if (data.site) setSite(data.site);
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Leads</h2>
                  <p className="text-white/40 text-xs mt-0.5">
                    {leads.filter(l => l.status === "new").length > 0
                      ? `${leads.filter(l => l.status === "new").length} new · ${leads.length} total`
                      : `${leads.length} total`}
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
                    {leads.filter(l => l.status === "new").length} New
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">
                    {leads.filter(l => l.status === "contacted").length} Contacted
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">
                    {leads.filter(l => l.status === "done").length} Done
                  </span>
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-3">📭</p>
                  <p className="text-white/50 text-sm font-semibold">No leads yet</p>
                  <p className="text-white/30 text-xs mt-1">When someone fills out your contact form, they&apos;ll appear here — and you&apos;ll get an email and SMS right away.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {leads.map((lead) => {
                    const isExpanded = expandedLead === lead.id;
                    const contactEmail = lead.email || (lead.contact?.includes("@") ? lead.contact : null);
                    const contactPhone = lead.phone || (!lead.contact?.includes("@") ? lead.contact : null);
                    const statusColors = {
                      new: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
                      contacted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      done: "bg-green-500/10 text-green-400 border-green-500/20",
                    };
                    return (
                      <div key={lead.id} className={`rounded-xl border bg-[#0b1220] transition-colors ${lead.status === "new" ? "border-[#f59e0b]/20" : "border-white/[0.06]"}`}>
                        {/* Header row */}
                        <button
                          type="button"
                          onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                          className="w-full flex items-center gap-3 p-4 text-left"
                        >
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
                          <span className="text-white/25 text-xs flex-none">{isExpanded ? "▲" : "▼"}</span>
                        </button>

                        {/* Expanded */}
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-white/[0.06] pt-4 space-y-4">
                            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{lead.message}</p>

                            {/* Contact buttons */}
                            <div className="flex flex-wrap gap-2">
                              {contactEmail && (
                                <a href={`mailto:${contactEmail}?subject=Re: Your inquiry&body=Hi ${lead.name},%0D%0A%0D%0AThank you for reaching out!`}
                                  className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg bg-[#f59e0b] text-[#0b1220] hover:bg-[#fbbf24] transition-colors">
                                  ✉ Reply by email
                                </a>
                              )}
                              {contactPhone && (
                                <a href={`tel:${contactPhone}`}
                                  className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg border border-white/10 hover:border-white/25 transition-colors">
                                  📞 Call {contactPhone}
                                </a>
                              )}
                            </div>

                            {/* Status buttons */}
                            <div className="flex gap-2">
                              <p className="text-xs text-white/30 self-center mr-1">Mark as:</p>
                              {(["new", "contacted", "done"] as const).map((s) => (
                                <button key={s} type="button" onClick={() => updateLeadStatus(lead.id, s)}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${lead.status === s ? statusColors[s] : "border-white/10 text-white/30 hover:border-white/25"}`}>
                                  {s === "new" ? "New" : s === "contacted" ? "Contacted" : "Done"}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
