"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPhotoForService } from "@/lib/stockPhotos";

export default function SetupPhotos() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}

function Inner() {
  const params = useSearchParams();
  const siteId = params.get("site");

  const [services, setServices] = useState<string[]>([]);
  const [trade, setTrade] = useState("");
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [existingCustomImages, setExistingCustomImages] = useState<Record<string, unknown>>({});
  const [saved, setSaved] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId) return;
    fetch(`/api/dashboard?site=${siteId}`)
      .then((r) => r.json())
      .then((d) => {
        const s = d.site;
        if (!s) return;
        setTrade(s.trade || "");
        const details = s.generated_copy?.serviceDetails || [];
        const detailNames = details.map((x: { title?: string }) => x.title || "").filter(Boolean);
        if (detailNames.length > 0) {
          setServices(detailNames);
        } else {
          const fromCopy = s.generated_copy?.services || [];
          const fromCopyNames = fromCopy.map((x: { title?: string } | string) => (typeof x === "string" ? x : x.title || "")).filter(Boolean);
          if (fromCopyNames.length > 0) {
            setServices(fromCopyNames);
          } else if (s.services) {
            const parsed = s.services.split(/[,\n;]+/).map((x: string) => x.trim()).filter((x: string) => x.length > 1 && x.length < 60);
            setServices(parsed);
          }
        }
        setExistingCustomImages(s.custom_images || {});
        setCustomImages(s.custom_images?.services || {});
        setDone(!!(s.setup_completed?.photos));
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  async function upload(file: File): Promise<string | null> {
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/upload-image", { method: "POST", body: fd });
    return (await r.json()).url || null;
  }

  async function handleUpload(slug: string, file: File) {
    const url = await upload(file);
    if (!url) return;
    const updated = { ...customImages, [slug]: url };
    setCustomImages(updated);
    await fetch("/api/dashboard/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, customImages: { ...existingCustomImages, services: updated } }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function markDone() {
    await fetch("/api/setup-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, step: "photos" }),
    });
    setDone(true);
  }

  if (loading) return <Screen siteId={siteId}><p className="text-white/40 text-sm">Loading…</p></Screen>;

  return (
    <Screen siteId={siteId}>
      {/* Header with Done button */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Update service photos</h1>
          <p className="text-white/45 text-sm">Upload real photos of your work. Customers trust photos over stock images.</p>
        </div>
        {done ? (
          <div className="flex-none flex items-center gap-1.5 text-emerald-400 text-sm font-bold mt-1">✓ Done</div>
        ) : (
          <button onClick={markDone}
            className="flex-none bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-sm font-bold px-5 py-2.5 rounded-xl transition-colors mt-1">
            Done ✓
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {services.map((name, idx) => {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const stock = getPhotoForService(name, trade, idx);
          const custom = customImages[slug];
          const current = custom || stock;
          return (
            <div key={slug} className="card rounded-2xl p-5 flex gap-5 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current} alt={name}
                onClick={() => setLightbox(current)}
                className="w-20 h-20 rounded-xl object-cover flex-none border border-white/10 cursor-zoom-in hover:opacity-80 transition-opacity" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white capitalize mb-1">{name}</p>
                {custom
                  ? <p className="text-xs text-emerald-400 mb-2">✓ Custom photo</p>
                  : <p className="text-xs text-white/35 mb-2">Using stock photo</p>}
                <label className="cursor-pointer inline-block text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] transition-colors">
                  {custom ? "Change photo" : "Upload photo"}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(slug, f); }} />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {services.length === 0 && (
        <p className="text-white/40 text-sm">No services found. <Link href={`/dashboard/edit?site=${siteId}`} className="text-[#f59e0b]">Edit your website</Link> to add services first.</p>
      )}

      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg">
          ✓ Photo saved
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="Preview" className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl" />
          <button onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 text-white/60 hover:text-white text-2xl font-bold transition-colors">✕</button>
        </div>
      )}
    </Screen>
  );
}

function Screen({ siteId, children }: { siteId: string | null; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-4 sm:px-6 py-12">
      <div className="max-w-xl mx-auto">
        <Link href={`/dashboard?site=${siteId}`} className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/70 text-sm mb-8 transition-colors">
          ← Back to dashboard
        </Link>
        {children}
      </div>
    </div>
  );
}
