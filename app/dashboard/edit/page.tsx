"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import { getPhotosForTrade, getPhotoForService } from "@/lib/stockPhotos";
import { generateServiceDescription } from "@/lib/serviceDescriptions";

// ─── Section definitions ────────────────────────────────────────────────────

export const DEFAULT_SECTION_ORDER = [
  "hero", "stats", "about", "why", "services",
  "process", "reviews", "area", "contact", "owner", "photos",
];

const SECTION_META: Record<string, { emoji: string; title: string; hint: string }> = {
  hero:     { emoji: "🖼️", title: "Hero",           hint: "Headline, subheadline and background image" },
  stats:    { emoji: "📊", title: "Trust badges",   hint: "The 4 numbers shown below the hero" },
  about:    { emoji: "ℹ️",  title: "About us",       hint: "About your business and guarantee line" },
  why:      { emoji: "✅", title: "Why choose us",  hint: "3 reasons customers pick you" },
  services: { emoji: "🛠️", title: "Our services",   hint: "The services you offer with photos" },
  process:  { emoji: "🔄", title: "How it works",   hint: "4 steps showing how you work" },
  reviews:  { emoji: "⭐", title: "Reviews",         hint: "Trustpilot and Google links" },
  area:     { emoji: "📍", title: "Service area",   hint: "The area banner with your coverage" },
  contact:  { emoji: "📞", title: "Contact",         hint: "Phone, email, hours and contact form" },
  owner:    { emoji: "👤", title: "About you",      hint: "Your name, photo and bio (optional)" },
  photos:   { emoji: "📸", title: "Project photos", hint: "Gallery of your work" },
  domain:   { emoji: "🌐", title: "Custom domain",  hint: "Connect your own domain — e.g. www.yourbusiness.com" },
};

// ─── Tiny reusable components ───────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title={on ? "Visible on your website" : "Hidden from your website"}
      className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors ${on ? "bg-[#f59e0b]" : "bg-white/10"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function Field({
  label, value, onChange, textarea, placeholder, hint, rows,
}: {
  label: string; value: string; onChange: (v: string) => void;
  textarea?: boolean; placeholder?: string; hint?: string; rows?: number;
}) {
  const cls = "w-full bg-[#0b1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 placeholder:text-white/25";
  return (
    <div>
      <label className="block text-sm font-semibold text-white/70 mb-1.5">{label}</label>
      {textarea
        ? <textarea rows={rows || 3} value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-none`} placeholder={placeholder} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} placeholder={placeholder} />}
      {hint && <p className="text-xs text-white/30 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Sortable section card ───────────────────────────────────────────────────

function SortableSection({
  id, isHidden, isOpen, onToggleHidden, onToggleOpen, children, canHide = true,
}: {
  id: string; isHidden: boolean; isOpen: boolean;
  onToggleHidden: () => void; onToggleOpen: () => void;
  children: React.ReactNode; canHide?: boolean;
}) {
  const controls = useDragControls();
  const meta = SECTION_META[id];

  return (
    <Reorder.Item value={id} dragListener={false} dragControls={controls} as="div">
      <div className={`rounded-2xl border transition-colors ${isOpen ? "border-[#f59e0b]/25 bg-white/[0.035]" : "border-white/[0.07] bg-white/[0.02]"} overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          {/* Drag handle — 6-dot grip */}
          <div
            className="cursor-grab active:cursor-grabbing touch-none flex-none opacity-25 hover:opacity-60 transition-opacity select-none px-0.5"
            onPointerDown={(e) => controls.start(e)}
          >
            <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor">
              <circle cx="3" cy="3" r="1.5"/><circle cx="9" cy="3" r="1.5"/>
              <circle cx="3" cy="9" r="1.5"/><circle cx="9" cy="9" r="1.5"/>
              <circle cx="3" cy="15" r="1.5"/><circle cx="9" cy="15" r="1.5"/>
            </svg>
          </div>
          {/* Title + hint — clicking expands */}
          <span className="text-lg flex-none select-none">{meta.emoji}</span>
          <button type="button" onClick={onToggleOpen} className="flex-1 text-left min-w-0">
            <p className={`font-bold text-sm leading-tight ${isHidden ? "text-white/30" : ""}`}>{meta.title}</p>
            <p className="text-xs text-white/30 truncate">{meta.hint}</p>
          </button>
          {/* Visible toggle */}
          {canHide && <Toggle on={!isHidden} onToggle={onToggleHidden} />}
          {/* Expand chevron */}
          <button type="button" onClick={onToggleOpen} className="text-white/30 hover:text-white/60 transition-colors flex-none w-6 text-center text-xs">
            {isOpen ? "▲" : "▼"}
          </button>
        </div>
        {/* Expanded fields */}
        {isOpen && (
          <div className="px-5 pb-5 pt-4 border-t border-white/[0.06] flex flex-col gap-4">
            {children}
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function EditSite() {
  return (
    <Suspense fallback={null}>
      <EditSiteInner />
    </Suspense>
  );
}

function EditSiteInner() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get("site");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);

  // ── Business (pinned top — not a visible page section) ──
  const [businessName, setBusinessName] = useState("");
  const [trade, setTrade] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");
  const [template, setTemplate] = useState("classic");
  const [uploading, setUploading] = useState(false);

  // ── Section order + visibility ──
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

  function toggleHidden(id: string) {
    setHiddenSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  // ── Hero ──
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [heroUploading, setHeroUploading] = useState(false);

  // ── Stats ──
  const [stats, setStats] = useState<{ value: string; label: string }[]>([
    { value: "5+", label: "Years Experience" },
    { value: "200+", label: "Jobs Completed" },
    { value: "", label: "Service Area" },
    { value: "1 Hour", label: "Response Time" },
  ]);

  // ── About ──
  const [about, setAbout] = useState("");
  const [guaranteeLine, setGuaranteeLine] = useState("");

  // ── Why choose us ──
  const [whyPoints, setWhyPoints] = useState<string[]>(["", "", ""]);

  // ── Services ──
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [serviceDescriptions, setServiceDescriptions] = useState<Record<string, string>>({});
  const [expandedService, setExpandedService] = useState<string | null>(null);

  // ── How it works ──
  const [processSteps, setProcessSteps] = useState<{ title: string; description: string }[]>([
    { title: "Reach out", description: "Call, message, or fill out our form and tell us what you need." },
    { title: "Free assessment", description: "We visit and give you a clear, honest quote." },
    { title: "We get to work", description: "Our team shows up on time and gets the job done right." },
    { title: "Job done, guaranteed", description: "We walk you through the finished work and stand behind it." },
  ]);
  const [responsePromise, setResponsePromise] = useState("");

  // ── Reviews ──
  const [trustpilotUrl, setTrustpilotUrl] = useState("");
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState("");

  // ── Service area ──
  const [trustLine, setTrustLine] = useState("");

  // ── Owner ──
  const [ownerName, setOwnerName] = useState("");
  const [ownerBio, setOwnerBio] = useState("");
  const [ownerPhotoUrl, setOwnerPhotoUrl] = useState("");
  const [ownerPhotoUploading, setOwnerPhotoUploading] = useState(false);

  // ── Domain ──
  const [customDomain, setCustomDomain] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainResult, setDomainResult] = useState<{ isApex: boolean; cname: string; aRecord: string } | null>(null);
  const [domainError, setDomainError] = useState("");

  // ── Project photos ──
  const [projectPhotos, setProjectPhotos] = useState<string[]>([]);
  const [photosUploading, setPhotosUploading] = useState(false);
  const [photosError, setPhotosError] = useState("");

  // ── Custom images ──
  const [customImages, setCustomImages] = useState<{ hero?: string; services?: Record<string, string> }>({});

  // ─── Load data ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    fetch(`/api/dashboard?site=${siteId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.site) return;
        const s = data.site;
        setBusinessName(s.business_name || "");
        setTrade(s.trade || "");
        setPhone(s.phone || "");
        setEmail(s.email || "");
        setAddress(s.address || "");
        setHours(s.hours || "");
        setLicenseNumber(s.license_number || "");
        setNotifyEmail(s.notify_email !== false);
        setNotifySms(s.notify_sms !== false);
        setLogoUrl(s.logo_url || "");
        setTemplate(s.template || "classic");
        // Start from whatever was saved, then enforce content rules:
        // sections with no content are always hidden regardless of saved state.
        const savedHidden: string[] = s.hidden_sections || [];
        const finalHidden = new Set(savedHidden);
        if (!s.owner_name && !s.owner_bio) finalHidden.add("owner");
        if (!s.project_photos || s.project_photos.length === 0) finalHidden.add("photos");
        if (!s.trustpilot_url && !s.google_reviews_url) finalHidden.add("reviews");
        setHiddenSections(Array.from(finalHidden));
        // Section order — use saved or default
        if (s.section_order && s.section_order.length > 0) {
          // Merge: keep saved order but add any new sections that aren't in saved list
          const saved = s.section_order as string[];
          const merged = [...saved, ...DEFAULT_SECTION_ORDER.filter((id) => !saved.includes(id))];
          setSectionOrder(merged);
        }
        setTrustpilotUrl(s.trustpilot_url || "");
        setGoogleReviewsUrl(s.google_reviews_url || "");
        setCustomDomain(s.custom_domain || "");
        setDomainInput(s.custom_domain || "");
        setProjectPhotos(s.project_photos || []);
        setOwnerName(s.owner_name || "");
        setOwnerBio(s.owner_bio || "");
        setOwnerPhotoUrl(s.owner_photo_url || "");
        setCustomImages(s.custom_images || {});

        const g = s.generated_copy;
        const biz = s.business_name || "";
        const tr = s.trade || "trade";
        const area = s.area || "the local area";

        // Compute fallbacks that match what the live site shows
        const licClean = (s.license_number || "").replace(/^license\s*#?\s*/i, "").trim();
        const fallbackGuaranteeLine = licClean
          ? `Fully licensed & insured — License #${licClean}.`
          : "Fully licensed & insured for your peace of mind.";
        const fallbackWhyPoints = [
          "Local, reliable, and easy to reach",
          "Honest pricing with no surprises",
          "Quality work, done right the first time",
        ];
        const fallbackProcess = [
          { title: "Reach out", description: "Call, message, or fill out our form and tell us what you need." },
          { title: "Free assessment", description: "We visit and give you a clear, honest quote." },
          { title: "We get to work", description: "Our team shows up on time and gets the job done right." },
          { title: "Job done, guaranteed", description: `${biz || "We"} stand${biz ? "s" : ""} behind our work — guaranteed.` },
        ];

        // Extract real stats numbers from raw onboarding fields
        const rawExp = (s.experience || "") + " " + (s.about || "");
        const yearsM = rawExp.match(/(\d[\d,\.]*)\s*\+?\s*(year|years|yr|yrs|år|årig)/i);
        const jobsM  = rawExp.match(/(\d[\d,\.]*)\s*\+?\s*(job|jobs|project|projects|home|homes|roof|roofs|house|houses|property|properties|customer|customers|client|clients|repair|repairs|install|installations|vehicle|vehicles|system|systems|unit|units|opgave|opgaver|kunde|kunder)/i);
        const extractedYears = yearsM ? yearsM[1].replace(/[,\.]/g, "") + "+" : null;
        const extractedJobs  = jobsM  ? jobsM[1].replace(/[,\.]/g, "") + "+" : null;
        const areaCity = area.split(/\s+and\s+/i)[0].split(/[,&]/)[0].trim().split(" ")[0];

        if (g) {
          setHeadline(g.headline || `${tr} services you can count on`);
          setSubheadline(g.subheadline || `${biz || "We"} proudly serve ${area} with fast, reliable work and honest pricing.`);
          setCtaText(g.ctaText || "Get a Free Quote");
          setAbout(g.about || s.about || "");
          setGuaranteeLine(g.guaranteeLine || fallbackGuaranteeLine);
          setResponsePromise(g.responsePromise || "We respond within 24 hours — guaranteed.");
          setTrustLine(g.trustLine || `Proudly serving ${area}`);
          setServices(g.services?.length > 0 ? g.services : parseRaw(s.services || ""));
          const pts = g.whyChooseUs?.points?.filter(Boolean) || [];
          setWhyPoints(pts.length >= 3 ? pts : [...pts, ...fallbackWhyPoints.slice(pts.length)]);
          if (g.process?.length > 0) setProcessSteps(g.process);
          // Stats — prefer generated but override years/jobs with real extracted numbers
          const baseStats = g.stats?.length > 0 ? [...g.stats] : [
            { value: extractedYears || "5+", label: "Years Experience" },
            { value: extractedJobs || "200+", label: "Jobs Completed" },
            { value: areaCity || "Local", label: "Service Area" },
            { value: "1 Hour", label: "Response Time" },
          ];
          if (extractedYears) baseStats[0] = { ...baseStats[0], value: extractedYears };
          if (extractedJobs)  baseStats[1] = { ...baseStats[1], value: extractedJobs };
          setStats(baseStats);
          const descs: Record<string, string> = {};
          for (const d of g.serviceDetails || []) { if (d.title && d.description) descs[d.title] = d.description; }
          setServiceDescriptions(descs);
        } else {
          // No generated_copy yet — show the same fallback text the live site shows
          setHeadline(`${tr} services you can count on`);
          setSubheadline(`${biz || "We"} proudly serve ${area} with fast, reliable work and honest pricing.`);
          setCtaText("Get a Free Quote");
          setAbout(s.about || "");
          setGuaranteeLine(fallbackGuaranteeLine);
          setResponsePromise("We respond within 24 hours — guaranteed.");
          setTrustLine(`Proudly serving ${area}`);
          setServices(parseRaw(s.services || ""));
          setWhyPoints(fallbackWhyPoints);
          setProcessSteps(fallbackProcess);
          setStats([
            { value: extractedYears || "5+", label: "Years Experience" },
            { value: extractedJobs || "200+", label: "Jobs Completed" },
            { value: areaCity || "Local", label: "Service Area" },
            { value: "1 Hour", label: "Response Time" },
          ]);
        }
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  function parseRaw(raw: string) {
    return raw.split(/[\n,;•\-–]+/).map((x) => x.trim()).filter((x) => x.length > 1);
  }

  // ─── Upload helpers ────────────────────────────────────────────────────────

  async function upload(file: File): Promise<string | null> {
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/upload-image", { method: "POST", body: fd });
    return (await r.json()).url || null;
  }

  async function handleLogoUpload(file: File) {
    setUploading(true);
    const url = await upload(file); if (url) setLogoUrl(url);
    setUploading(false);
  }

  async function handleHeroUpload(file: File) {
    setHeroUploading(true);
    const url = await upload(file); if (url) setCustomImages((ci) => ({ ...ci, hero: url }));
    setHeroUploading(false);
  }

  async function handleServiceImageUpload(slug: string, file: File) {
    const url = await upload(file);
    if (url) setCustomImages((ci) => ({ ...ci, services: { ...(ci.services || {}), [slug]: url } }));
  }

  async function handleOwnerPhotoUpload(file: File) {
    setOwnerPhotoUploading(true);
    const url = await upload(file); if (url) setOwnerPhotoUrl(url);
    setOwnerPhotoUploading(false);
  }

  async function handlePhotosUpload(files: FileList) {
    setPhotosUploading(true);
    setPhotosError("");
    let anyFailed = false;
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/upload-image", { method: "POST", body: fd });
      const json = await r.json();
      if (json.url) {
        setProjectPhotos((p) => [...p, json.url]);
      } else {
        anyFailed = true;
        console.error("Photo upload failed:", json.error);
      }
    }
    if (anyFailed) setPhotosError("One or more photos failed to upload. Check your internet connection and try again.");
    setPhotosUploading(false);
  }

  // ─── Domain handler ────────────────────────────────────────────────────────

  async function handleConnectDomain() {
    if (!domainInput.trim()) return;
    setDomainLoading(true); setDomainError(""); setDomainResult(null);
    try {
      const res = await fetch("/api/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, domain: domainInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setDomainError(data.error || "Something went wrong"); return; }
      setCustomDomain(domainInput.trim());
      setDomainResult({ isApex: data.isApex, cname: data.cname, aRecord: data.aRecord });
    } catch {
      setDomainError("Could not connect domain. Please try again.");
    } finally {
      setDomainLoading(false);
    }
  }

  async function handleRemoveDomain() {
    await fetch("/api/domain", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId }),
    });
    setCustomDomain(""); setDomainInput(""); setDomainResult(null);
  }

  // ─── Services helpers ──────────────────────────────────────────────────────

  function addService() {
    const s = newService.trim();
    if (!s || services.includes(s)) return;
    setServices((p) => [...p, s]); setNewService("");
  }

  function removeService(s: string) { setServices((p) => p.filter((x) => x !== s)); }

  // ─── Save ─────────────────────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setSaved(false); setError("");
    try {
      const res = await fetch("/api/dashboard/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId, businessName, phone, email, address, hours, logoUrl, template, licenseNumber, notifyEmail, notifySms,
          headline, subheadline, ctaText,
          about, guaranteeLine, responsePromise, trustLine,
          services, serviceDescriptions,
          whyPoints: whyPoints.filter((p) => p.trim()),
          processSteps,
          stats: stats.filter((s) => s.value.trim()),
          trustpilotUrl, googleReviewsUrl,
          projectPhotos,
          ownerName, ownerBio, ownerPhotoUrl,
          customImages,
          hiddenSections,
          sectionOrder,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setSaving(false); }
  }

  const stockHero = trade ? getPhotosForTrade(trade).hero : "";
  const currentHero = customImages?.hero || stockHero;

  if (!siteId) return (
    <div className="min-h-screen bg-[#0b1220] text-white/40 flex items-center justify-center text-sm">No website selected.</div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-4 sm:px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-10">
          <span className="text-2xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
          <Link href={`/dashboard?site=${siteId}`} className="text-white/40 hover:text-white/70 text-sm transition-colors">← Back</Link>
        </div>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">Edit your website</h1>
            <p className="text-white/40 text-sm">Click any section to edit it. Drag to reorder. Toggle to show/hide.</p>
          </div>
          <a href={`/site/${siteId}`} target="_blank" rel="noopener noreferrer"
            className="flex-none border border-white/10 hover:border-white/25 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap">
            Preview ↗
          </a>
        </div>

        {loading ? <p className="text-white/40 text-sm">Loading…</p> : (
          <form onSubmit={handleSave} className="flex flex-col gap-3">

            {/* ── DESIGN PICKER ────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === "design" ? null : "design")}
                className="flex items-center gap-3 px-4 py-3.5 w-full text-left"
              >
                <span className="text-lg flex-none">🎨</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight">Website design</p>
                  <p className="text-xs text-white/30">
                    {template === "classic" ? "Classic & Trustworthy" : template === "bold" ? "Modern & Bold" : "Warm & Personal"} — click to change
                  </p>
                </div>
                <span className="text-white/30 text-xs">{openSection === "design" ? "▲" : "▼"}</span>
              </button>
              {openSection === "design" && (
                <div className="px-5 pb-5 pt-4 border-t border-white/[0.06]">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "classic", name: "Classic & Trustworthy", desc: "Clean, professional, no-nonsense. Built for trades that win on reliability.", accent: "#38bdf8" },
                      { id: "bold",    name: "Modern & Bold",          desc: "Sharp, confident, eye-catching. Stands out in a crowded local search.",    accent: "#f59e0b" },
                      { id: "warm",    name: "Warm & Personal",        desc: "Friendly, approachable, community-feel. Great for owner-operated businesses.", accent: "#fb7185" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { setTemplate(t.id); setOpenSection(null); }}
                        className={`rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 ${template === t.id ? "border-2 border-[#f59e0b] bg-[#f59e0b]/10" : "border border-white/10 bg-white/[0.02] hover:border-white/25"}`}
                      >
                        {/* Mini browser mockup */}
                        <div className="rounded-lg overflow-hidden border border-white/10 mb-3 bg-[#0b1220]">
                          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-white/[0.06]">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                            <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                            <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                          </div>
                          <div className="p-2.5 space-y-1.5">
                            <div className="h-2.5 w-2/3 rounded" style={{ background: t.accent, opacity: 0.85 }} />
                            <div className="h-1.5 w-full rounded bg-white/[0.08]" />
                            <div className="h-1.5 w-5/6 rounded bg-white/[0.08]" />
                            <div className="h-5 w-14 rounded mt-1.5" style={{ background: t.accent }} />
                          </div>
                        </div>
                        <p className="text-xs font-bold text-white leading-snug mb-0.5">{t.name}</p>
                        <p className="text-[10px] text-white/35 leading-relaxed">{t.desc}</p>
                        {template === t.id && (
                          <p className="text-[10px] font-bold text-[#f59e0b] mt-1.5">✓ Active</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── BUSINESS INFO (pinned — not a page section) ──────────────── */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden mb-1">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === "business" ? null : "business")}
                className="flex items-center gap-3 px-4 py-3.5 w-full text-left"
              >
                <span className="text-lg flex-none">🏢</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight">Business info</p>
                  <p className="text-xs text-white/30">Name, phone, email, address, hours and logo</p>
                </div>
                <span className="text-white/30 text-xs">{openSection === "business" ? "▲" : "▼"}</span>
              </button>
              {openSection === "business" && (
                <div className="px-5 pb-5 pt-4 border-t border-white/[0.06] flex flex-col gap-4">
                  <Field label="Business name" value={businessName} onChange={setBusinessName} />
                  <Field label="Phone" value={phone} onChange={setPhone} placeholder="(123) 456-7890" />
                  <Field label="Contact email" value={email} onChange={setEmail} placeholder="info@yourbusiness.com" />
                  <Field label="Address" value={address} onChange={setAddress} placeholder="123 Main St, City" />
                  <Field label="Opening hours" value={hours} onChange={setHours} placeholder="Mon–Fri 7am–5pm, Sat 8am–2pm" />
                </div>
              )}
            </div>

            {/* ── DOMAIN (pinned under Business info) ──────────────────────── */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <button type="button" onClick={() => setOpenSection(openSection === "domain" ? null : "domain")}
                className="flex items-center gap-3 px-4 py-3.5 w-full text-left">
                <span className="text-lg flex-none">🌐</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">Custom domain</p>
                  <p className="text-xs text-white/30 truncate">{customDomain || "Connect your own domain — e.g. www.yourbusiness.com"}</p>
                </div>
                {customDomain && <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex-none">Connected</span>}
                <span className="text-white/30 text-xs flex-none">{openSection === "domain" ? "▲" : "▼"}</span>
              </button>
              {openSection === "domain" && (
                <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-4">
                  {!customDomain ? (
                    <>
                      <p className="text-white/50 text-sm">Enter your domain name below. We&apos;ll tell you exactly what to do — step by step.</p>
                      <div className="flex gap-2">
                        <input type="text" value={domainInput} onChange={(e) => setDomainInput(e.target.value)}
                          placeholder="www.yourbusiness.com"
                          className="flex-1 bg-[#0b1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 placeholder:text-white/25"
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleConnectDomain())} />
                        <button type="button" onClick={handleConnectDomain} disabled={domainLoading || !domainInput.trim()}
                          className="bg-[#f59e0b] text-[#0b1220] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#fbbf24] disabled:opacity-50 transition-colors flex-none">
                          {domainLoading ? "Connecting…" : "Connect"}
                        </button>
                      </div>
                      {domainError && <p className="text-red-400 text-xs">{domainError}</p>}
                    </>
                  ) : (
                    <>
                      {domainResult ? (
                        <div className="space-y-3">
                          <p className="text-white/70 text-sm font-semibold">Follow these steps in your domain provider:</p>
                          <div className="space-y-2">
                            {["Log in to wherever you bought your domain (GoDaddy, Namecheap, etc.)", "Find DNS Settings or Manage DNS"].map((txt, i) => (
                              <div key={i} className="flex gap-3 items-start">
                                <span className="w-6 h-6 rounded-full bg-[#f59e0b] text-[#0b1220] text-xs font-black flex items-center justify-center flex-none mt-0.5">{i + 1}</span>
                                <p className="text-sm text-white/60">{txt}</p>
                              </div>
                            ))}
                            <div className="flex gap-3 items-start">
                              <span className="w-6 h-6 rounded-full bg-[#f59e0b] text-[#0b1220] text-xs font-black flex items-center justify-center flex-none mt-0.5">3</span>
                              <div className="flex-1">
                                <p className="text-sm text-white/60 mb-2">Add this record:</p>
                                <div className="bg-[#0b1220] rounded-lg p-3 border border-white/10 font-mono text-xs space-y-1">
                                  <div className="flex gap-4"><span className="text-white/40 w-12">Type</span><span className="text-white font-bold">{domainResult.isApex ? "A" : "CNAME"}</span></div>
                                  <div className="flex gap-4"><span className="text-white/40 w-12">Name</span><span className="text-white font-bold">{domainResult.isApex ? "@" : "www"}</span></div>
                                  <div className="flex gap-4 items-center">
                                    <span className="text-white/40 w-12">Value</span>
                                    <span className="text-[#f59e0b] font-bold">{domainResult.isApex ? domainResult.aRecord : domainResult.cname}</span>
                                    <button type="button" onClick={() => navigator.clipboard.writeText(domainResult.isApex ? domainResult.aRecord : domainResult.cname)} className="text-white/30 hover:text-white text-[10px] ml-auto">Copy</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3 items-start">
                              <span className="w-6 h-6 rounded-full bg-[#f59e0b] text-[#0b1220] text-xs font-black flex items-center justify-center flex-none mt-0.5">4</span>
                              <p className="text-sm text-white/60">Save — your site will be live on <strong className="text-white">{customDomain}</strong> within 10–30 minutes.</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-white/60">Connected to <strong className="text-white">{customDomain}</strong></p>
                          <p className="text-xs text-white/30">It can take up to 30 minutes to go live.</p>
                        </div>
                      )}
                      <button type="button" onClick={handleRemoveDomain} className="text-xs text-white/30 hover:text-red-400 transition-colors">Remove domain</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── DRAGGABLE SECTIONS ─────────────────────────────────────── */}
            <p className="text-xs text-white/30 px-1 mb-0.5">Drag to reorder · toggle to show/hide each section</p>
            <Reorder.Group axis="y" values={sectionOrder} onReorder={setSectionOrder} as="div" className="flex flex-col gap-3">
              {sectionOrder.map((id) => (
                <SortableSection
                  key={id}
                  id={id}
                  isHidden={hiddenSections.includes(id)}
                  isOpen={openSection === id}
                  onToggleHidden={() => toggleHidden(id)}
                  onToggleOpen={() => setOpenSection(openSection === id ? null : id)}
                  canHide={id !== "hero" && id !== "contact" && id !== "domain"}
                >
                  {/* ── HERO ── */}
                  {id === "hero" && <>
                    <Field label="Main headline" value={headline} onChange={setHeadline} placeholder="e.g. 13 Years of Trusted Plumbing in Austin" />
                    <Field label="Subheadline" value={subheadline} onChange={setSubheadline} placeholder="One sentence about your business and area" />
                    <Field label="Button text" value={ctaText} onChange={setCtaText} placeholder="Get a Free Quote" />
                    <div>
                      <p className="text-sm font-semibold text-white/70 mb-2">Background image</p>
                      {currentHero && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={currentHero} alt="Hero" className="w-full h-28 object-cover rounded-lg mb-3 border border-white/10" />
                      )}
                      <div className="flex flex-wrap gap-2">
                        <label className="cursor-pointer border border-white/10 hover:border-white/25 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                          {heroUploading ? "Uploading…" : "Upload your own photo"}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleHeroUpload(f); }} />
                        </label>
                        {customImages?.hero && (
                          <button type="button" onClick={() => setCustomImages((ci) => { const { hero: _, ...rest } = ci; return rest; })}
                            className="border border-white/10 hover:border-white/25 text-sm font-semibold px-4 py-2 rounded-lg text-white/50 transition-colors">
                            ↺ Reset to stock photo
                          </button>
                        )}
                      </div>
                    </div>
                  </>}

                  {/* ── STATS ── */}
                  {id === "stats" && <>
                    <p className="text-white/40 text-xs">Keep values short — they display as large bold numbers.</p>
                    <div className="grid grid-cols-2 gap-3">
                      {stats.map((stat, i) => (
                        <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0b1220] p-3">
                          <input
                            type="text" value={stat.value} maxLength={12}
                            onChange={(e) => setStats((prev) => prev.map((s, j) => j === i ? { ...s, value: e.target.value } : s))}
                            placeholder={i === 0 ? "e.g. 10+" : i === 1 ? "e.g. 500+" : i === 2 ? "e.g. Austin" : "e.g. 1 Hour"}
                            className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#f59e0b]/50 mb-2 placeholder:text-white/20"
                          />
                          <input
                            type="text" value={stat.label} maxLength={24}
                            onChange={(e) => setStats((prev) => prev.map((s, j) => j === i ? { ...s, label: e.target.value } : s))}
                            placeholder="e.g. Years Experience"
                            className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-[#f59e0b]/50 placeholder:text-white/20"
                          />
                        </div>
                      ))}
                    </div>
                  </>}

                  {/* ── ABOUT ── */}
                  {id === "about" && <>
                    <Field label="About your business" value={about} onChange={setAbout} textarea rows={4}
                      placeholder="Tell customers about your experience, what you specialize in, and what makes you different..." />
                    <Field label="License & trust line" value={guaranteeLine} onChange={setGuaranteeLine}
                      placeholder="Fully licensed & insured — License #TX-12345." />
                  </>}

                  {/* ── WHY CHOOSE US ── */}
                  {id === "why" && <>
                    <p className="text-white/40 text-xs">3 short reasons customers should pick you — shown as bold cards.</p>
                    {whyPoints.map((pt, i) => (
                      <Field key={i} label={`Reason ${i + 1}`} value={pt}
                        onChange={(v) => setWhyPoints((pts) => pts.map((p, j) => j === i ? v : p))}
                        placeholder={["Local, reliable, and easy to reach", "Honest pricing with no surprises", "Quality work, done right the first time"][i]} />
                    ))}
                  </>}

                  {/* ── SERVICES ── */}
                  {id === "services" && <>
                    <p className="text-white/40 text-xs">Add or remove the services you offer. Each gets its own page.</p>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {services.map((s) => (
                        <span key={s} className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5 text-sm font-medium">
                          {s}
                          <button type="button" onClick={() => removeService(s)} className="text-white/40 hover:text-red-400 transition-colors leading-none">×</button>
                        </span>
                      ))}
                      {services.length === 0 && <p className="text-white/25 text-sm">No services yet.</p>}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newService} onChange={(e) => setNewService(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addService(); } }}
                        placeholder="e.g. Roof repairs"
                        className="flex-1 bg-[#0b1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 placeholder:text-white/25" />
                      <button type="button" onClick={addService} className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-sm font-bold px-4 py-2.5 rounded-lg transition-colors">+ Add</button>
                    </div>
                    {/* Per-service accordion */}
                    {services.length > 0 && (
                      <div className="flex flex-col gap-2 mt-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/30">Click a service to edit its page</p>
                        {services.map((s, idx) => {
                          const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                          const customImg = customImages?.services?.[slug];
                          const stockImg = getPhotoForService(s, trade, idx);
                          const displayImg = customImg || stockImg;
                          const isOpen = expandedService === slug;
                          // Show actual description or smart-generated fallback
                          const desc = serviceDescriptions[s] || generateServiceDescription(s, businessName, address || "your local area");
                          return (
                            <div key={slug} className={`rounded-xl border transition-colors overflow-hidden ${isOpen ? "border-[#f59e0b]/30 bg-[#0b1220]" : "border-white/[0.06] bg-[#080e1a]"}`}>
                              {/* Row header — always visible */}
                              <button
                                type="button"
                                onClick={() => setExpandedService(isOpen ? null : slug)}
                                className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.02] transition-colors"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={displayImg} alt={s} className="w-12 h-12 rounded-lg object-cover flex-none border border-white/10" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm capitalize">{s}</p>
                                  <p className="text-xs text-white/35 truncate mt-0.5">{desc}</p>
                                </div>
                                <span className="text-white/25 text-xs flex-none">{isOpen ? "▲" : "▼"}</span>
                              </button>
                              {/* Expanded content */}
                              {isOpen && (
                                <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] flex flex-col gap-3">
                                  <div>
                                    <p className="text-xs font-semibold text-white/40 mb-2">Description shown on the service page</p>
                                    <textarea
                                      value={serviceDescriptions[s] || desc}
                                      onChange={(e) => setServiceDescriptions((prev) => ({ ...prev, [s]: e.target.value }))}
                                      rows={4}
                                      className="w-full bg-[#060c18] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#f59e0b]/50 resize-none"
                                    />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-white/40 mb-2">Photo</p>
                                    <div className="flex items-center gap-3">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={displayImg} alt={s} className="w-20 h-20 rounded-xl object-cover border border-white/10 flex-none" />
                                      <div className="flex flex-col gap-2">
                                        <label className="cursor-pointer text-xs font-semibold px-3 py-2 rounded-lg border border-white/15 hover:border-white/30 transition-colors inline-block">
                                          {customImg ? "Change photo" : "Upload your own photo"}
                                          <input type="file" accept="image/*" className="hidden"
                                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleServiceImageUpload(slug, f); }} />
                                        </label>
                                        {customImg && (
                                          <button type="button"
                                            onClick={() => setCustomImages((ci) => { const ns = { ...(ci.services || {}) }; delete ns[slug]; return { ...ci, services: ns }; })}
                                            className="text-xs text-white/35 hover:text-white/60 transition-colors text-left">
                                            ↺ Reset to auto photo
                                          </button>
                                        )}
                                        {!customImg && <p className="text-xs text-white/25">Auto-selected based on service type</p>}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>}

                  {/* ── HOW IT WORKS ── */}
                  {id === "process" && <>
                    <Field label="Subtitle under heading" value={responsePromise} onChange={setResponsePromise}
                      placeholder="We respond within 24 hours — guaranteed." />
                    <p className="text-xs font-bold uppercase tracking-widest text-white/30">The 4 steps</p>
                    {processSteps.map((step, i) => (
                      <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0b1220] p-4 flex flex-col gap-2">
                        <p className="text-xs text-white/35 font-bold">Step {i + 1}</p>
                        <input type="text" value={step.title}
                          onChange={(e) => setProcessSteps((prev) => prev.map((s, j) => j === i ? { ...s, title: e.target.value } : s))}
                          placeholder="Step title"
                          className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#f59e0b]/50 placeholder:text-white/20" />
                        <textarea rows={2} value={step.description}
                          onChange={(e) => setProcessSteps((prev) => prev.map((s, j) => j === i ? { ...s, description: e.target.value } : s))}
                          placeholder="One sentence describing this step"
                          className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-[#f59e0b]/50 resize-none placeholder:text-white/20" />
                      </div>
                    ))}
                  </>}

                  {/* ── REVIEWS ── */}
                  {id === "reviews" && <>
                    <p className="text-white/40 text-xs">Connect your Trustpilot or Google Business profile. Visitors can click through to read your real reviews.</p>
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-1.5">Trustpilot URL</label>
                      <input type="url" value={trustpilotUrl} onChange={(e) => setTrustpilotUrl(e.target.value)}
                        placeholder="https://www.trustpilot.com/review/yourbusiness.com"
                        className="w-full bg-[#0b1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 placeholder:text-white/25" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-1.5">Google Business reviews URL</label>
                      <input type="url" value={googleReviewsUrl} onChange={(e) => setGoogleReviewsUrl(e.target.value)}
                        placeholder="https://g.page/r/yourbusiness/review"
                        className="w-full bg-[#0b1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 placeholder:text-white/25" />
                      <p className="text-white/25 text-xs mt-1.5">Find your Google link: Google Maps → your business → Share → Copy link</p>
                    </div>
                  </>}

                  {/* ── SERVICE AREA ── */}
                  {id === "area" && <>
                    <Field label="Service area headline" value={trustLine} onChange={setTrustLine}
                      hint="Shown as the big white text on the area banner"
                      placeholder="Proudly serving Copenhagen and surrounding areas" />
                  </>}

                  {/* ── CONTACT ── */}
                  {id === "contact" && <>
                    <Field label="Phone" value={phone} onChange={setPhone} placeholder="(123) 456-7890" />
                    <Field label="Email" value={email} onChange={setEmail} placeholder="info@yourbusiness.com" />
                    <Field label="Address" value={address} onChange={setAddress} placeholder="123 Main St, City" />
                    <Field label="Opening hours" value={hours} onChange={setHours} placeholder="Mon–Fri 7am–5pm, Sat 8am–2pm" />
                    <Field label="License / Insurance number" value={licenseNumber} onChange={setLicenseNumber}
                      placeholder="e.g. TX-PLB-12345"
                      hint="Shown in footer and guarantee line. Leave blank to hide." />
                    <Field label="Response promise" value={responsePromise} onChange={setResponsePromise}
                      placeholder="We respond within 24 hours — guaranteed." />

                    {/* Notification preferences */}
                    <div>
                      <p className="text-sm font-semibold text-white/70 mb-3">Lead notifications</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">Email notification</p>
                            <p className="text-xs text-white/30">Receive an email when a new lead comes in</p>
                          </div>
                          <Toggle on={notifyEmail} onToggle={() => setNotifyEmail(v => !v)} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">SMS notification</p>
                            <p className="text-xs text-white/30">Receive a text message when a new lead comes in</p>
                          </div>
                          <Toggle on={notifySms} onToggle={() => setNotifySms(v => !v)} />
                        </div>
                      </div>
                    </div>
                  </>}

                  {/* ── OWNER ── */}
                  {id === "owner" && <>
                    <p className="text-white/40 text-xs">Leave blank to hide this section completely.</p>
                    <Field label="Your name" value={ownerName} onChange={setOwnerName} placeholder="John Smith" />
                    <Field label="A bit about yourself" value={ownerBio} onChange={setOwnerBio} textarea rows={3}
                      placeholder="Tell customers who you are and why you love the work..." />
                    <div>
                      <p className="text-sm font-semibold text-white/70 mb-2">Your photo</p>
                      <div className="flex items-center gap-4">
                        {ownerPhotoUrl
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={ownerPhotoUrl} alt="Owner" className="w-14 h-14 rounded-full object-cover border border-white/10" />
                          : <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/25 text-xs">None</div>}
                        <label className="cursor-pointer border border-white/10 hover:border-white/25 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                          {ownerPhotoUploading ? "Uploading…" : "Upload photo"}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleOwnerPhotoUpload(f); }} />
                        </label>
                        {ownerPhotoUrl && <button type="button" onClick={() => setOwnerPhotoUrl("")} className="text-white/35 hover:text-red-400 text-xs font-semibold">Remove</button>}
                      </div>
                    </div>
                  </>}

                  {/* ── PROJECT PHOTOS ── */}
                  {id === "photos" && <>
                    <p className="text-white/40 text-xs">Upload photos of your work. Real photos make the biggest difference.</p>
                    {projectPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {projectPhotos.map((url, i) => (
                          <div key={i} className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Project ${i + 1}`} className="w-full aspect-square object-cover rounded-xl border border-white/10" />
                            <button type="button" onClick={() => setProjectPhotos((p) => p.filter((_, j) => j !== i))}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white/80 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="cursor-pointer flex items-center justify-center gap-2 border border-dashed border-white/15 hover:border-white/30 rounded-xl py-5 text-sm font-semibold text-white/40 hover:text-white/60 transition-colors">
                      {photosUploading ? "Uploading…" : `+ Add photos${projectPhotos.length > 0 ? ` (${projectPhotos.length} added)` : ""}`}
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => { if (e.target.files) handlePhotosUpload(e.target.files); }} />
                    </label>
                    {photosError && <p className="text-red-400 text-xs mt-1">{photosError}</p>}
                  </>}

                </SortableSection>
              ))}
            </Reorder.Group>

            {/* ── SAVE BAR ─────────────────────────────────────────────── */}
            <div className="sticky bottom-6 mt-6">
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#0b1220]/95 backdrop-blur-md px-5 py-4">
                {error && <p className="flex-1 text-red-400 text-sm font-medium">{error}</p>}
                {saved && <p className="flex-1 text-emerald-400 text-sm font-bold">✓ Saved!</p>}
                {!error && !saved && <p className="flex-1 text-white/30 text-sm">Remember to click Save when done.</p>}
                <button type="submit" disabled={saving}
                  className="flex-none bg-[#f59e0b] hover:bg-[#f59e0b]/90 disabled:opacity-50 text-black font-extrabold px-8 py-3 rounded-xl text-sm transition-colors">
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
