"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import { getPhotosForTrade } from "@/lib/stockPhotos";

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

  // ── Project photos ──
  const [projectPhotos, setProjectPhotos] = useState<string[]>([]);
  const [photosUploading, setPhotosUploading] = useState(false);

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
        setLogoUrl(s.logo_url || "");
        setTemplate(s.template || "classic");
        // If hidden_sections was never explicitly saved, auto-hide sections with no content
        const savedHidden: string[] = s.hidden_sections || [];
        const autoHidden = new Set(savedHidden);
        // Only auto-hide if the user has never explicitly saved a preference (hidden_sections is null)
        if (!s.hidden_sections) {
          if (!s.owner_name && !s.owner_bio) autoHidden.add("owner");
          if (!s.project_photos || s.project_photos.length === 0) autoHidden.add("photos");
          if (!s.trustpilot_url && !s.google_reviews_url) autoHidden.add("reviews");
        }
        setHiddenSections(Array.from(autoHidden));
        // Section order — use saved or default
        if (s.section_order && s.section_order.length > 0) {
          // Merge: keep saved order but add any new sections that aren't in saved list
          const saved = s.section_order as string[];
          const merged = [...saved, ...DEFAULT_SECTION_ORDER.filter((id) => !saved.includes(id))];
          setSectionOrder(merged);
        }
        setTrustpilotUrl(s.trustpilot_url || "");
        setGoogleReviewsUrl(s.google_reviews_url || "");
        setProjectPhotos(s.project_photos || []);
        setOwnerName(s.owner_name || "");
        setOwnerBio(s.owner_bio || "");
        setOwnerPhotoUrl(s.owner_photo_url || "");
        setCustomImages(s.custom_images || {});

        const g = s.generated_copy;
        const biz = s.business_name || "";
        const tr = s.trade || "trade";
        const area = s.area || "the local area";

        if (g) {
          setHeadline(g.headline || `${tr} services you can count on`);
          setSubheadline(g.subheadline || `${biz || "We"} proudly serve ${area} with fast, reliable work and honest pricing.`);
          setCtaText(g.ctaText || "Get a Free Quote");
          setAbout(g.about || s.about || "");
          setGuaranteeLine(g.guaranteeLine || "");
          setResponsePromise(g.responsePromise || "");
          setTrustLine(g.trustLine || "");
          setServices(g.services?.length > 0 ? g.services : parseRaw(s.services || ""));
          const pts = g.whyChooseUs?.points || [];
          setWhyPoints(pts.length >= 3 ? pts : [...pts, ...Array(3 - pts.length).fill("")]);
          if (g.process?.length > 0) setProcessSteps(g.process);
          if (g.stats?.length > 0) setStats(g.stats);
          const descs: Record<string, string> = {};
          for (const d of g.serviceDetails || []) { if (d.title && d.description) descs[d.title] = d.description; }
          setServiceDescriptions(descs);
        } else {
          setHeadline(`${tr} services you can count on`);
          setSubheadline(`${biz || "We"} proudly serve ${area} with fast, reliable work and honest pricing.`);
          setCtaText("Get a Free Quote");
          setAbout(s.about || "");
          setServices(parseRaw(s.services || ""));
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
    const r = await fetch("/api/upload-logo", { method: "POST", body: fd });
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
    for (const file of Array.from(files).slice(0, 6 - projectPhotos.length)) {
      const url = await upload(file); if (url) setProjectPhotos((p) => [...p, url!].slice(0, 6));
    }
    setPhotosUploading(false);
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
          siteId, businessName, phone, email, address, hours, logoUrl, template,
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
                  {/* Logo */}
                  <div>
                    <p className="text-sm font-semibold text-white/70 mb-2">Logo</p>
                    <div className="flex items-center gap-4">
                      {logoUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={logoUrl} alt="Logo" className="w-14 h-14 rounded-lg object-contain bg-white/5 border border-white/10" />
                        : <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/25 text-xs">None</div>}
                      <label className="cursor-pointer border border-white/10 hover:border-white/25 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        {uploading ? "Uploading…" : logoUrl ? "Change logo" : "Upload logo"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
                      </label>
                      {logoUrl && <button type="button" onClick={() => setLogoUrl("")} className="text-white/35 hover:text-red-400 text-xs font-semibold">Remove</button>}
                    </div>
                  </div>
                  {/* Theme */}
                  <div>
                    <p className="text-sm font-semibold text-white/70 mb-2">Website theme</p>
                    <div className="flex gap-2">
                      {[
                        { id: "classic", label: "Classic", desc: "White & blue" },
                        { id: "bold",    label: "Bold",    desc: "Dark & gold" },
                        { id: "warm",    label: "Warm",    desc: "Cream & terracotta" },
                      ].map((t) => (
                        <button key={t.id} type="button" onClick={() => setTemplate(t.id)}
                          className={`flex-1 rounded-xl border py-3 text-center transition-colors ${template === t.id ? "border-[#f59e0b] bg-[#f59e0b]/10" : "border-white/10 bg-white/[0.02] hover:border-white/25"}`}>
                          <p className="text-sm font-bold">{t.label}</p>
                          <p className="text-xs text-white/35 mt-0.5">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
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
                  canHide={id !== "hero" && id !== "contact"}
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
                            placeholder="e.g. 10+"
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
                    {/* Per-service image + description */}
                    {services.length > 0 && (
                      <div className="flex flex-col gap-3 mt-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/30">Edit each service page</p>
                        {services.map((s, idx) => {
                          const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                          const customImg = customImages?.services?.[slug];
                          return (
                            <div key={slug} className="rounded-xl border border-white/[0.06] bg-[#0b1220] p-4 flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={customImg || `https://images.unsplash.com/photo-1646324554833-f0b6a479fa5d?auto=format&fit=crop&w=80&q=50`}
                                  alt={s} className="w-16 h-16 rounded-xl object-cover flex-none border border-white/10" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm mb-2">{s}</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25 transition-colors">
                                      {idx === 0 ? "Upload photo" : "Change photo"}
                                      <input type="file" accept="image/*" className="hidden"
                                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleServiceImageUpload(slug, f); }} />
                                    </label>
                                    {customImg && (
                                      <button type="button" onClick={() => setCustomImages((ci) => { const ns = { ...(ci.services || {}) }; delete ns[slug]; return { ...ci, services: ns }; })}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25 text-white/45 transition-colors">
                                        ↺ Reset
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <textarea
                                value={serviceDescriptions[s] || ""}
                                onChange={(e) => setServiceDescriptions((prev) => ({ ...prev, [s]: e.target.value }))}
                                placeholder={`Describe your ${s.toLowerCase()} service...`}
                                rows={3}
                                className="w-full bg-[#080e1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#f59e0b]/50 resize-none placeholder:text-white/20"
                              />
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
                    <Field label="Response promise" value={responsePromise} onChange={setResponsePromise}
                      placeholder="We respond within 24 hours — guaranteed." />
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
                    <p className="text-white/40 text-xs">Upload up to 6 photos of your work. Real photos make the biggest difference.</p>
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
                    {projectPhotos.length < 6 && (
                      <label className="cursor-pointer flex items-center justify-center gap-2 border border-dashed border-white/15 hover:border-white/30 rounded-xl py-5 text-sm font-semibold text-white/40 hover:text-white/60 transition-colors">
                        {photosUploading ? "Uploading…" : `+ Add photos (${projectPhotos.length}/6)`}
                        <input type="file" accept="image/*" multiple className="hidden"
                          onChange={(e) => { if (e.target.files) handlePhotosUpload(e.target.files); }} />
                      </label>
                    )}
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
