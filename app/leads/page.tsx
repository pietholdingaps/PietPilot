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

export default function LeadsPage() {
  return <Suspense fallback={null}><LeadsInner /></Suspense>;
}

function LeadsInner() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("site");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "done">("all");

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    fetch(`/api/dashboard?site=${siteId}`)
      .then(r => r.json())
      .then(d => { setLeads(d.leads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [siteId]);

  async function updateLeadStatus(leadId: string, status: Lead["status"]) {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    await fetch("/api/lead/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, status }),
    });
  }

  const filtered = filter === "all" ? leads : leads.filter(l => l.status === filter);

  const statusColors = {
    new: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
    contacted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    done: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-6 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <span className="text-2xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
          <Link href={`/dashboard?site=${siteId}`} className="text-white/40 text-sm hover:text-white transition-colors">← Back to dashboard</Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Leads</h1>
            <p className="text-white/40 text-sm mt-1">{leads.filter(l => l.status === "new").length} new · {leads.length} total</p>
          </div>
          {/* Filter */}
          <div className="flex gap-2">
            {(["all", "new", "contacted", "done"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors capitalize ${filter === f ? "bg-[#f59e0b] text-[#0b1220] border-[#f59e0b]" : "border-white/10 text-white/40 hover:border-white/25"}`}>
                {f === "all" ? `All (${leads.length})` : f === "new" ? `New (${leads.filter(l => l.status === "new").length})` : f === "contacted" ? `Contacted (${leads.filter(l => l.status === "contacted").length})` : `Done (${leads.filter(l => l.status === "done").length})`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-white/50 text-sm font-semibold">No leads {filter !== "all" ? `with status "${filter}"` : "yet"}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(lead => {
              const isExpanded = expandedLead === lead.id;
              const contactEmail = lead.email || (lead.contact?.includes("@") ? lead.contact : null);
              const contactPhone = lead.phone || (!lead.contact?.includes("@") ? lead.contact : null);
              return (
                <div key={lead.id} className={`card rounded-2xl border transition-colors ${lead.status === "new" ? "border-[#f59e0b]/20" : "border-white/[0.06]"}`}>
                  <button type="button" onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                    className="w-full flex items-center gap-3 p-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-white/60 flex-none">
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
                    <span className="text-white/25 text-xs flex-none">{isExpanded ? "▲" : "▼"}</span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/[0.06] pt-4 space-y-4">
                      <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{lead.message}</p>
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
                      <div className="flex gap-2 items-center">
                        <p className="text-xs text-white/30 mr-1">Mark as:</p>
                        {(["new", "contacted", "done"] as const).map(s => (
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
    </div>
  );
}
