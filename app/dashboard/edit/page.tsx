"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPhotosForTrade } from "@/lib/stockPhotos";

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

  // Business info
  const [businessName, setBusinessName] = useState("");
  const [trade, setTrade] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Hero
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [heroUploading, setHeroUploading] = useState(false);

  // Services
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");

  // About
  const [about, setAbout] = useState("");
  const [whyPoints, setWhyPoints] = useState<string[]>(["", "", ""]);
  const [guaranteeLine, setGuaranteeLine] = useState("");
  const [responsePromise, setResponsePromise] = useState("");

  // Service descriptions (keyed by service name)
  const [serviceDescriptions, setServiceDescriptions] = useState<Record<string, string>>({});

  // Reviews — now via platform links only
  const [trustpilotUrl, setTrustpilotUrl] = useState("");
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState("");

  // Owner
  const [ownerName, setOwnerName] = useState("");
  const [ownerBio, setOwnerBio] = useState("");
  const [ownerPhotoUrl, setOwnerPhotoUrl] = useState("");
  const [ownerPhotoUploading, setOwnerPhotoUploading] = useState(false);

  // Project photos
  const [projectPhotos, setProjectPhotos] = useState<string[]>([]);
  const [photosUploading, setPhotosUploading] = useState(false);

  // Stats badges under hero
  const [stats, setStats] = useState<{ value: string; label: string }[]>([
    { value: "5+", label: "Years Experience" },
    { value: "200+", label: "Jobs Completed" },
    { value: "", label: "Service Area" },
    { value: "1 Hour", label: "Response Time" },
  ]);

  // Design / template
  const [template, setTemplate] = useState("classic");

  // Hidden sections (toggled off on the live site)
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  function toggleSection(key: string) {
    setHiddenSections((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  }

  // Custom images (hero bg + per-service)
  const [customImages, setCustomImages] = useState<{
    hero?: string;
    services?: Record<string, string>;
  }>({});

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    fetch(`/api/dashboard?site=${siteId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.site) {
          const s = data.site;
          setBusinessName(s.business_name || "");
          setTrade(s.trade || "");
          setPhone(s.phone || "");
          setEmail(s.email || "");
          setAddress(s.address || "");
          setHours(s.hours || "");
          setLogoUrl(s.logo_url || "");
          if (s.generated_copy) {
            const biz = s.business_name || "";
            const tr = s.trade || "trade";
            const area = s.area || "the local area";
            // If headline is missing from generated_copy, use same fallback as live site
            setHeadline(s.generated_copy.headline || `${tr} services you can count on`);
            setSubheadline(s.generated_copy.subheadline || `${biz || "We"} proudly serve ${area} with fast, reliable work and honest pricing.`);
            // Fallback to raw onboarding field if generated_copy doesn't have it yet
            setAbout(s.generated_copy.about || s.about || "");
            setServices(
              s.generated_copy.services?.length > 0
                ? s.generated_copy.services
                : (s.services || "").split(/[\n,;•\-–]+/).map((x: string) => x.trim()).filter((x: string) => x.length > 1)
            );
            const pts = s.generated_copy.whyChooseUs?.points || [];
            setWhyPoints(pts.length > 0 ? pts : ["", "", ""]);
            if (s.generated_copy.stats?.length > 0) setStats(s.generated_copy.stats);
            setGuaranteeLine(s.generated_copy.guaranteeLine || "");
            setResponsePromise(s.generated_copy.responsePromise || "");
            // Load service descriptions keyed by name
            const descs: Record<string, string> = {};
            for (const d of s.generated_copy.serviceDetails || []) {
              if (d.title && d.description) descs[d.title] = d.description;
            }
            setServiceDescriptions(descs);
          } else {
            // No generated_copy yet — load straight from onboarding answers
            setAbout(s.about || "");
            const rawServices = (s.services || "").split(/[\n,;•\-–]+/).map((x: string) => x.trim()).filter((x: string) => x.length > 1);
            setServices(rawServices);
            // Build simple headline/subheadline from onboarding data so fields aren't blank
            const biz = s.business_name || "";
            const tr = s.trade || "trade";
            const area = s.area || "the local area";
            setHeadline(biz ? `${tr} services you can count on` : `Trusted ${tr} services`);
            setSubheadline(`${biz || "We"} proudly serve ${area} with fast, reliable work and honest pricing.`);
          }
          setTrustpilotUrl(s.trustpilot_url || "");
          setGoogleReviewsUrl(s.google_reviews_url || "");
          setProjectPhotos(s.project_photos || []);
          setOwnerName(s.owner_name || "");
          setOwnerBio(s.owner_bio || "");
          setOwnerPhotoUrl(s.owner_photo_url || "");
          setCustomImages(s.custom_images || {});
          setTemplate(s.template || "classic");
          setHiddenSections(s.hidden_sections || []);
        }
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  // Upload helpers
  async function upload(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
    const json = await res.json();
    return json.url || null;
  }

  async function handleLogoUpload(file: File) {
    setUploading(true);
    const url = await upload(file);
    if (url) setLogoUrl(url);
    setUploading(false);
  }

  async function handleHeroUpload(file: File) {
    setHeroUploading(true);
    const url = await upload(file);
    if (url) setCustomImages((ci) => ({ ...ci, hero: url }));
    setHeroUploading(false);
  }

  function resetHeroToStock() {
    setCustomImages((ci) => {
      const { hero: _hero, ...rest } = ci;
      return rest;
    });
  }

  async function handleServiceImageUpload(slug: string, file: File) {
    const url = await upload(file);
    if (url) {
      setCustomImages((ci) => ({
        ...ci,
        services: { ...(ci.services || {}), [slug]: url },
      }));
    }
  }

  function resetServiceImage(slug: string) {
    setCustomImages((ci) => {
      const newServices = { ...(ci.services || {}) };
      delete newServices[slug];
      return { ...ci, services: newServices };
    });
  }

  async function handlePhotosUpload(files: FileList) {
    setPhotosUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files).slice(0, 6 - projectPhotos.length)) {
      const url = await upload(file);
      if (url) urls.push(url);
    }
    setProjectPhotos((p) => [...p, ...urls].slice(0, 6));
    setPhotosUploading(false);
  }

  async function handleOwnerPhotoUpload(file: File) {
    setOwnerPhotoUploading(true);
    const url = await upload(file);
    if (url) setOwnerPhotoUrl(url);
    setOwnerPhotoUploading(false);
  }

  function addService() {
    const s = newService.trim();
    if (!s || services.includes(s)) return;
    setServices((prev) => [...prev, s]);
    setNewService("");
  }

  function removeService(s: string) {
    setServices((prev) => prev.filter((x) => x !== s));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/dashboard/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId, businessName, phone, email, address, hours, logoUrl,
          headline, subheadline, about, guaranteeLine, responsePromise,
          services, serviceDescriptions,
          whyPoints: whyPoints.filter((p) => p.trim()),
          stats: stats.filter((s) => s.value.trim()),
          trustpilotUrl, googleReviewsUrl,
          projectPhotos,
          ownerName, ownerBio, ownerPhotoUrl,
          customImages, template, hiddenSections,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Stock hero URL for preview/reset
  const stockHero = trade ? getPhotosForTrade(trade).hero : "";
  const currentHero = customImages?.hero || stockHero;

  if (!siteId) return (
    <div className="min-h-screen bg-[#0b1220] text-white/40 flex items-center justify-center text-sm">
      No website selected.
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-4 sm:px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <span className="text-2xl font-extrabold tracking-tight">
            Piet<span className="text-[#f59e0b]">Pilot</span>
          </span>
          <Link href={`/dashboard?site=${siteId}`} className="text-white/40 hover:text-white/70 text-sm transition-colors">
            ← Back
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">Edit your website</h1>
            <p className="text-white/45 text-sm">Open a section to edit it. Click Save at the bottom when done.</p>
          </div>
          <a
            href={`/site/${siteId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none border border-white/10 hover:border-white/25 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            Preview ↗
          </a>
        </div>

        {/* Completion score */}
        {!loading && (() => {
          const steps = [
            { label: "Business info", done: !!(businessName && phone) },
            { label: "Services", done: services.length > 0 },
            { label: "About", done: !!about },
            { label: "Reviews", done: !!(trustpilotUrl || googleReviewsUrl) },
            { label: "About you", done: !!(ownerName || ownerBio) },
            { label: "Project photos", done: projectPhotos.length > 0 },
          ];
          const done = steps.filter(s => s.done).length;
          const pct = Math.round((done / steps.length) * 100);
          const missing = steps.filter(s => !s.done).map(s => s.label);
          return (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold">Website completeness</p>
                <p className="text-sm font-extrabold" style={{ color: pct === 100 ? "#34d399" : "#f59e0b" }}>{pct}%</p>
              </div>
              <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: pct === 100 ? "#34d399" : "#f59e0b" }}
                />
              </div>
              {missing.length > 0 && (
                <p className="text-xs text-white/40">
                  Missing: {missing.join(", ")} — {missing.includes("Project photos") && <span className="text-[#f59e0b] font-semibold">real photos make the biggest difference!</span>}
                </p>
              )}
            </div>
          );
        })()}

        {loading ? (
          <p className="text-white/40 text-sm">Loading…</p>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-3">

            {/* 1. BUSINESS INFO */}
            <Section title="Business info" emoji="🏢" active={!!(businessName || phone || email)}>
              <Field label="Business name" value={businessName} onChange={setBusinessName} />
              <Field label="Phone" value={phone} onChange={setPhone} />
              <Field label="Contact email" value={email} onChange={setEmail} />
              <Field label="Address" value={address} onChange={setAddress} />
              <Field label="Opening hours" value={hours} onChange={setHours} />
              <div>
                <p className="text-sm font-semibold text-white/70 mb-2">Logo</p>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logo" className="w-14 h-14 rounded-lg object-contain bg-white/5 border border-white/10" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/25 text-xs">None</div>
                  )}
                  <label className="cursor-pointer border border-white/10 hover:border-white/25 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                    {uploading ? "Uploading…" : logoUrl ? "Change logo" : "Upload logo"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
                  </label>
                  {logoUrl && (
                    <button type="button" onClick={() => setLogoUrl("")} className="text-white/35 hover:text-red-400 text-xs font-semibold transition-colors">Remove</button>
                  )}
                </div>
              </div>
            </Section>

            {/* 2. HERO */}
            <Section title="Hero section" emoji="🖼️" active={!!(headline || subheadline)}>
              <Field label="Main headline" value={headline} onChange={setHeadline} />
              <Field label="Subheadline" value={subheadline} onChange={setSubheadline} />
              <div>
                <p className="text-sm font-semibold text-white/70 mb-3">Hero background image</p>
                {currentHero && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentHero} alt="Hero" className="w-full h-32 object-cover rounded-lg mb-3 border border-white/10" />
                )}
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer border border-white/10 hover:border-white/25 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                    {heroUploading ? "Uploading…" : "Upload your own photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleHeroUpload(f); }} />
                  </label>
                  {customImages?.hero && (
                    <button type="button" onClick={resetHeroToStock} className="border border-white/10 hover:border-white/25 text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-white/50">
                      ↺ Reset to stock photo
                    </button>
                  )}
                </div>
              </div>
            </Section>

            {/* 3. TRUST BADGES */}
            <Section title="Trust badges" emoji="📊" active={stats.some(s => s.value.trim())}>
              <p className="text-white/45 text-sm mb-1">The 4 stat badges shown just below your hero image. Keep the values short — they display as large bold numbers/words.</p>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0b1220] p-4">
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => setStats(prev => prev.map((s, j) => j === i ? { ...s, value: e.target.value } : s))}
                      placeholder="e.g. 10+"
                      maxLength={12}
                      className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#f59e0b]/50 mb-2"
                    />
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => setStats(prev => prev.map((s, j) => j === i ? { ...s, label: e.target.value } : s))}
                      placeholder="e.g. Years Experience"
                      maxLength={24}
                      className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-[#f59e0b]/50"
                    />
                  </div>
                ))}
              </div>
            </Section>

            {/* 4. SERVICES */}
            <Section title="Services" emoji="🛠️" active={services.length > 0}>
              <p className="text-white/45 text-sm">Add or remove the services you offer. Each service gets its own page and image.</p>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {services.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5 text-sm font-medium">
                    {s}
                    <button type="button" onClick={() => removeService(s)} className="text-white/40 hover:text-red-400 transition-colors leading-none">×</button>
                  </span>
                ))}
                {services.length === 0 && <p className="text-white/30 text-sm">No services yet.</p>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addService(); } }}
                  placeholder="e.g. Roof repairs"
                  className="flex-1 bg-[#0b1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50"
                />
                <button type="button" onClick={addService} className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-sm font-bold px-4 py-2.5 rounded-lg transition-colors">
                  + Add
                </button>
              </div>

              {/* Per-service image overrides */}
              {services.length > 0 && (
                <div className="mt-2 flex flex-col gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/35">Service images</p>
                  {services.map((s) => {
                    const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    const customImg = customImages?.services?.[slug];
                    return (
                      <div key={slug} className="flex items-center gap-3 rounded-xl border border-white/[0.06] p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={customImg || `https://images.unsplash.com/photo-1646324554833-f0b6a479fa5d?auto=format&fit=crop&w=80&q=50`}
                          alt={s}
                          className="w-14 h-14 rounded-lg object-cover flex-none border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate mb-1.5">{s}</p>
                          <textarea
                            value={serviceDescriptions[s] || ""}
                            onChange={(e) => setServiceDescriptions(prev => ({ ...prev, [s]: e.target.value }))}
                            placeholder="Short description shown on the service card..."
                            rows={2}
                            className="w-full bg-[#0b1220] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#f59e0b]/50 resize-none mb-1.5"
                          />
                          <div className="flex flex-wrap gap-1.5">
                            <label className="cursor-pointer text-xs font-semibold px-2.5 py-1 rounded-md border border-white/10 hover:border-white/25 transition-colors">
                              Upload photo
                              <input type="file" accept="image/*" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleServiceImageUpload(slug, f); }} />
                            </label>
                            {customImg && (
                              <button type="button" onClick={() => resetServiceImage(slug)}
                                className="text-xs font-semibold px-2.5 py-1 rounded-md border border-white/10 hover:border-white/25 text-white/50 transition-colors">
                                ↺ Reset
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            {/* 4. ABOUT */}
            <Section title="About your business" emoji="📖" active={!!(about || whyPoints.some(p => p.trim()))}>
              <Field label="About us text" value={about} onChange={setAbout} textarea />
              <Field label="Trust & license line" value={guaranteeLine} onChange={setGuaranteeLine} placeholder="e.g. Fully licensed & insured — License #TX-48213" />
              <Field label="Response promise" value={responsePromise} onChange={setResponsePromise} placeholder="e.g. We respond within 1 hour — guaranteed." />
              <div>
                <p className="text-sm font-semibold text-white/70 mb-3">Why customers choose you (3 reasons)</p>
                <div className="flex flex-col gap-2">
                  {whyPoints.map((pt, i) => (
                    <Field key={i} label={`Reason ${i + 1}`} value={pt} onChange={(v) => setWhyPoints((pts) => pts.map((p, j) => j === i ? v : p))} />
                  ))}
                </div>
              </div>
            </Section>

            {/* 5. REVIEWS */}
            <Section title="Reviews" emoji="⭐" active={!!(trustpilotUrl || googleReviewsUrl)}>
              <p className="text-white/45 text-sm">Connect your Trustpilot or Google Business profile. Your customers can click straight through to read your real reviews.</p>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Trustpilot profile URL</label>
                <input
                  type="url"
                  value={trustpilotUrl}
                  onChange={(e) => setTrustpilotUrl(e.target.value)}
                  placeholder="https://www.trustpilot.com/review/yourbusiness.com"
                  className="w-full bg-[#0b1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Google Business reviews URL</label>
                <input
                  type="url"
                  value={googleReviewsUrl}
                  onChange={(e) => setGoogleReviewsUrl(e.target.value)}
                  placeholder="https://g.page/r/yourbusiness/review"
                  className="w-full bg-[#0b1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50"
                />
                <p className="text-white/30 text-xs mt-2">Find your Google link: Google Maps → your business → Share → Copy link</p>
              </div>
            </Section>

            {/* 6. ABOUT ME */}
            <Section title="About you (owner)" emoji="👤" active={!!(ownerName || ownerBio)}>
              <p className="text-white/45 text-sm">Leave blank to hide this section from your website.</p>
              <Field label="Your name" value={ownerName} onChange={setOwnerName} />
              <Field label="A bit about yourself" value={ownerBio} onChange={setOwnerBio} textarea />
              <div>
                <p className="text-sm font-semibold text-white/70 mb-2">Your photo</p>
                <div className="flex items-center gap-4">
                  {ownerPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ownerPhotoUrl} alt="Owner" className="w-14 h-14 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/25 text-xs">None</div>
                  )}
                  <label className="cursor-pointer border border-white/10 hover:border-white/25 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                    {ownerPhotoUploading ? "Uploading…" : "Upload photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleOwnerPhotoUpload(f); }} />
                  </label>
                  {ownerPhotoUrl && (
                    <button type="button" onClick={() => setOwnerPhotoUrl("")} className="text-white/35 hover:text-red-400 text-xs font-semibold transition-colors">Remove</button>
                  )}
                </div>
              </div>
            </Section>

            {/* 7. PROJECT PHOTOS */}
            <Section title="Project photos" emoji="📸" active={projectPhotos.length > 0}>
              <p className="text-white/45 text-sm">Upload photos of your work. They appear in an &quot;Our Work&quot; gallery on your website.</p>
              <div className="flex flex-wrap gap-3">
                {projectPhotos.map((url) => (
                  <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Project" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setProjectPhotos((p) => p.filter((u) => u !== url))}
                      className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                  </div>
                ))}
              </div>
              {projectPhotos.length < 6 ? (
                <label className="cursor-pointer border border-white/10 hover:border-white/25 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors inline-block">
                  {photosUploading ? "Uploading…" : "Upload photos"}
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => { if (e.target.files?.length) handlePhotosUpload(e.target.files); }} />
                </label>
              ) : (
                <p className="text-white/40 text-sm">Maximum 6 photos.</p>
              )}
            </Section>

            {/* 8. DESIGN */}
            <Section title="Website design" emoji="🎨" active={true}>
              <p className="text-white/40 text-sm mb-6">Switch the look and feel of your website. You can change this at any time.</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { id: "classic", name: "Classic & Trustworthy", desc: "Clean, professional, no-nonsense. Built for trades that win on reliability.", accent: "#38bdf8" },
                  { id: "bold", name: "Modern & Bold", desc: "Sharp, confident, eye-catching. Stands out in a crowded local search.", accent: "#f59e0b" },
                  { id: "warm", name: "Warm & Personal", desc: "Friendly, approachable, community-feel. Great for owner-operated businesses.", accent: "#fb7185" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={`rounded-2xl p-5 text-left transition-all border ${
                      template === t.id
                        ? "border-[#f59e0b] bg-white/[0.04]"
                        : "border-white/[0.06] bg-white/[0.02] hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Mini browser preview */}
                    <div className="rounded-lg overflow-hidden border border-white/10 mb-4 bg-[#0b1220]">
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06]">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="h-3 w-2/3 rounded" style={{ background: t.accent, opacity: 0.8 }} />
                        <div className="h-2 w-full rounded bg-white/[0.08]" />
                        <div className="h-2 w-5/6 rounded bg-white/[0.08]" />
                        <div className="h-6 w-16 rounded mt-2" style={{ background: t.accent }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-white">{t.name}</h3>
                      {template === t.id && (
                        <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider">Active</span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed">{t.desc}</p>
                  </button>
                ))}
              </div>
            </Section>

            {/* SAVE */}
            <div className="flex items-center gap-4 pt-2">
              <button type="submit" disabled={saving}
                className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-sm font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50">
                {saving ? "Saving…" : "Save changes"}
              </button>
              {saved && (
                <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
                  Saved ✓
                  <a href={`/site/${siteId}`} target="_blank" rel="noopener noreferrer"
                    className="underline text-emerald-400/70 hover:text-emerald-400 transition-colors">
                    View site ↗
                  </a>
                </span>
              )}
              {error && <span className="text-red-400 text-sm font-semibold">{error}</span>}
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

// Accordion section
function Section({ title, emoji, defaultOpen, active, toggleKey, isHidden, onToggle, children }: {
  title: string;
  emoji: string;
  defaultOpen?: boolean;
  active?: boolean;
  toggleKey?: string;
  isHidden?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <summary className="list-none cursor-pointer flex items-center justify-between px-6 py-5 select-none hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-lg">{emoji}</span>
          <span className="font-bold text-white text-sm">{title}</span>
          {active === true && (
            <span style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
          {active === false && (
            <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Not set up
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {toggleKey && onToggle && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onToggle(); }}
              title={isHidden ? "Click to show on website" : "Click to hide from website"}
              className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                isHidden
                  ? "border-white/10 text-white/25 bg-transparent"
                  : "border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/10"
              }`}
            >
              {isHidden ? "Hidden" : "Visible"}
            </button>
          )}
          <span className="text-white/35 text-xs transition-transform duration-200 group-open:rotate-180">▾</span>
        </div>
      </summary>
      <div className="px-6 pb-6 pt-5 border-t border-white/[0.06] flex flex-col gap-4">
        {isHidden && toggleKey && (
          <p className="text-xs text-white/40 bg-white/[0.03] rounded-lg px-4 py-3 border border-white/[0.06]">
            This section is hidden on your website. Click <strong>Hidden</strong> above to show it again.
          </p>
        )}
        {children}
      </div>
    </details>
  );
}

// Reusable field
function Field({ label, value, onChange, textarea, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-white/45">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={placeholder}
          className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#f59e0b]/50 resize-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#f59e0b]/50" />
      )}
    </label>
  );
}
