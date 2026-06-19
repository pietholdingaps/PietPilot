"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Lead = {
  id: string;
  name: string;
  contact: string;
  message: string;
  created_at: string;
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
                <h2 className="text-lg font-bold text-white">Leads from your website</h2>
              </div>

              {leads.length === 0 ? (
                <p className="text-white/45 text-sm leading-relaxed">
                  When someone fills out the contact form on your website, their message will show up here —
                  and you'll also get an email straight away.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-white/[0.06] bg-[#0b1220] p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-white">{lead.name}</span>
                        <span className="text-white/35 text-xs">
                          {new Date(lead.created_at).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-[#f59e0b] text-sm font-semibold mb-2">{lead.contact}</p>
                      <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{lead.message}</p>
                    </div>
                  ))}
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
