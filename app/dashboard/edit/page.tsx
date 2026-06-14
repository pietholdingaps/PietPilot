"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function EditSite() {
  return (
    <Suspense fallback={null}>
      <EditSiteInner />
    </Suspense>
  );
}

function EditSiteInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const siteId = searchParams.get("site");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [about, setAbout] = useState("");
  const [uploading, setUploading] = useState(false);
  const [reviews, setReviews] = useState<{ text: string; author: string }[]>([]);
  const [projectPhotos, setProjectPhotos] = useState<string[]>([]);
  const [photosUploading, setPhotosUploading] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerBio, setOwnerBio] = useState("");
  const [ownerPhotoUrl, setOwnerPhotoUrl] = useState("");
  const [ownerPhotoUploading, setOwnerPhotoUploading] = useState(false);

  useEffect(() => {
    if (!siteId) {
      setLoading(false);
      return;
    }
    fetch(`/api/dashboard?site=${siteId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.site) {
          const s = data.site;
          setBusinessName(s.business_name || "");
          setPhone(s.phone || "");
          setEmail(s.email || "");
          setAddress(s.address || "");
          setHours(s.hours || "");
          setLogoUrl(s.logo_url || "");
          if (s.generated_copy) {
            setHeadline(s.generated_copy.headline || "");
            setSubheadline(s.generated_copy.subheadline || "");
            setAbout(s.generated_copy.about || "");
          }
          if (s.reviews && s.reviews.length > 0) {
            setReviews(s.reviews);
          } else if (s.review_text) {
            setReviews([{ text: s.review_text, author: s.review_author || "" }]);
          }
          setProjectPhotos(s.project_photos || []);
          setOwnerName(s.owner_name || "");
          setOwnerBio(s.owner_bio || "");
          setOwnerPhotoUrl(s.owner_photo_url || "");
        }
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  async function handleLogoUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setLogoUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  async function handlePhotosUpload(files: FileList) {
    setPhotosUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, 6 - projectPhotos.length)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
        const json = await res.json();
        if (json.url) urls.push(json.url);
      }
      setProjectPhotos((p) => [...p, ...urls].slice(0, 6));
    } catch {
    } finally {
      setPhotosUploading(false);
    }
  }

  function removeProjectPhoto(url: string) {
    setProjectPhotos((p) => p.filter((u) => u !== url));
  }

  async function handleOwnerPhotoUpload(file: File) {
    setOwnerPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setOwnerPhotoUrl(data.url);
    } finally {
      setOwnerPhotoUploading(false);
    }
  }

  function addReview() {
    setReviews((r) => [...r, { text: "", author: "" }]);
  }

  function updateReview(index: number, field: "text" | "author", value: string) {
    setReviews((r) => r.map((rev, i) => (i === index ? { ...rev, [field]: value } : rev)));
  }

  function removeReview(index: number) {
    setReviews((r) => r.filter((_, i) => i !== index));
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
          siteId, businessName, phone, email, address, hours, logoUrl, headline, subheadline, about,
          reviews: reviews.filter((r) => r.text.trim()), projectPhotos, ownerName, ownerBio, ownerPhotoUrl,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!siteId) {
    return (
      <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-6 py-12 flex items-center justify-center">
        <p className="text-white/45">No website selected.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <span className="text-2xl font-extrabold tracking-tight">
            Piet<span className="text-[#f59e0b]">Pilot</span>
          </span>
          <Link href={`/dashboard?site=${siteId}`} className="text-white/40 hover:text-white/70 text-sm transition-colors">
            ← Back to dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Edit your website</h1>
        <p className="text-white/45 text-base mb-10">
          Changes go live on your website right away.
        </p>

        {loading ? (
          <p className="text-white/40 text-sm">Loading…</p>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-8">
            {/* BUSINESS INFO */}
            <div className="card rounded-2xl p-7">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-5">Business info</h2>
              <div className="flex flex-col gap-4">
                <Field label="Business name" value={businessName} onChange={setBusinessName} />
                <Field label="Phone" value={phone} onChange={setPhone} />
                <Field label="Contact email" value={email} onChange={setEmail} />
                <Field label="Address" value={address} onChange={setAddress} />
                <Field label="Opening hours" value={hours} onChange={setHours} />
              </div>
            </div>

            {/* LOGO */}
            <div className="card rounded-2xl p-7">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-5">Logo</h2>
              <div className="flex items-center gap-5">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-contain bg-white/5 border border-white/10" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-xs">
                    None
                  </div>
                )}
                <label className="cursor-pointer border border-white/10 hover:border-white/25 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                  {uploading ? "Uploading…" : "Upload new logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* HOMEPAGE TEXT */}
            <div className="card rounded-2xl p-7">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-5">Homepage text</h2>
              <div className="flex flex-col gap-4">
                <Field label="Headline" value={headline} onChange={setHeadline} />
                <Field label="Subheadline" value={subheadline} onChange={setSubheadline} />
                <Field label="About us" value={about} onChange={setAbout} textarea />
              </div>
            </div>

            {/* OM MIG */}
            <div className="card rounded-2xl p-7">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-5">About me</h2>
              <div className="flex flex-col gap-4">
                <Field label="Your name" value={ownerName} onChange={setOwnerName} />
                <Field label="A bit about yourself" value={ownerBio} onChange={setOwnerBio} textarea />
                <div className="flex items-center gap-5">
                  {ownerPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ownerPhotoUrl} alt="Owner" className="w-16 h-16 rounded-lg object-cover bg-white/5 border border-white/10" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-xs">
                      None
                    </div>
                  )}
                  <label className="cursor-pointer border border-white/10 hover:border-white/25 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                    {ownerPhotoUploading ? "Uploading…" : "Upload photo of yourself"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleOwnerPhotoUpload(file);
                      }}
                    />
                  </label>
                </div>
                <p className="text-white/30 text-xs">Leave blank to hide this section from your website.</p>
              </div>
            </div>

            {/* REVIEWS */}
            <div className="card rounded-2xl p-7">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-5">Customer reviews</h2>
              <div className="flex flex-col gap-5">
                {reviews.map((r, i) => (
                  <div key={i} className="border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/40">Review {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeReview(i)}
                        className="text-white/40 hover:text-red-400 text-xs font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <Field label="Review text" value={r.text} onChange={(v) => updateReview(i, "text", v)} textarea />
                    <Field label="From" value={r.author} onChange={(v) => updateReview(i, "author", v)} />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addReview}
                  className="self-start border border-white/10 hover:border-white/25 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  + Add review
                </button>
              </div>
            </div>

            {/* PROJECT PHOTOS */}
            <div className="card rounded-2xl p-7">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-5">Project photos</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                {projectPhotos.map((url) => (
                  <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Project" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeProjectPhoto(url)}
                      className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {projectPhotos.length < 6 ? (
                <label className="cursor-pointer border border-white/10 hover:border-white/25 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors inline-block">
                  {photosUploading ? "Uploading…" : "Upload photos"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) handlePhotosUpload(e.target.files);
                    }}
                  />
                </label>
              ) : (
                <p className="text-white/40 text-sm">Maximum of 6 photos added.</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-sm font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              {saved && <span className="text-emerald-400 text-sm font-semibold">Saved ✓</span>}
              {error && <span className="text-red-400 text-sm font-semibold">{error}</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-white/70">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="bg-[#0b1220] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#0b1220] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#f59e0b]/50"
        />
      )}
    </label>
  );
}
