"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GeneratedSite from "@/app/components/GeneratedSite";
import { GeneratedSiteCopy } from "@/lib/siteTypes";

const STEPS_TOTAL = 14;

// Used only if /api/preview-copy fails outright (e.g. network error), so the
// preview screen never gets stuck on "Writing your site's content..." forever.
function localFallbackCopy(businessName: string, trade: string, area: string, licenseNumber?: string): GeneratedSiteCopy {
  const services = ["Repairs & maintenance", "New installations", "Inspections", "Emergency call-outs", "Free estimates", "Maintenance plans"];
  return {
    headline: `${trade || "Trusted local"} services you can count on`,
    subheadline: `${businessName || "We"} proudly serve ${area || "the local area"} with fast, reliable work and honest pricing.`,
    about: `${businessName || "Our team"} is a local, trusted name for ${trade || "trade"} work in ${area || "the area"}. We focus on doing the job right the first time, with clear communication every step of the way.`,
    servicesIntro: "Here's what we can help you with:",
    services,
    allServices: [...services, "Upgrades & replacements", "Routine servicing"],
    ctaText: "Get a Free Quote",
    trustLine: `Proudly serving ${area || "your area"}`,
    responsePromise: "We respond within 24 hours — guaranteed.",
    guaranteeLine: licenseNumber
      ? `Fully licensed & insured for your peace of mind — License #${licenseNumber}.`
      : "Fully licensed & insured for your peace of mind.",
    whyChooseUs: {
      title: `Why choose ${businessName || "us"}?`,
      points: [
        "Local, reliable, and easy to reach",
        "Honest pricing with no surprises",
        "Quality work, done right the first time",
      ],
    },
    process: [
      { title: "Reach out", description: "Call, message, or fill out our form and tell us what you need." },
      { title: "Free assessment", description: "We visit (or review your details) and give you a clear, honest quote." },
      { title: "We get to work", description: "Our team shows up on time and does the job right the first time." },
      { title: "Job done, guaranteed", description: "We walk you through the finished work and stand behind it." },
    ],
    serviceDetails: services.map((title) => ({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: `${businessName || "We"} provide reliable ${title.toLowerCase()} for homes and businesses across ${area || "the local area"}. Our ${trade || "experienced"} team gets the job done right, on time, and at a fair price — with clear communication every step of the way. Get in touch today for a free quote.`,
      faqs: [
        { question: `How much does ${title.toLowerCase()} cost?`, answer: `Pricing depends on the size and scope of your project. Contact ${businessName || "us"} for a free, no-obligation quote.` },
        { question: "How soon can you start?", answer: `We aim to respond quickly and schedule the work as soon as possible — get in touch and we'll find a time that works for you.` },
        { question: "Do you offer a guarantee?", answer: licenseNumber ? `Yes — ${businessName || "we"} stand behind our work and are fully licensed & insured (License #${licenseNumber}).` : `Yes — ${businessName || "we"} stand behind our work and are fully licensed & insured for your peace of mind.` },
      ],
    })),
  };
}

const questions = [
  { key: "businessName", label: "What's your business name?", placeholder: "e.g. Johnson Plumbing", type: "text" },
  { key: "trade", label: "What trade are you in?", placeholder: "e.g. Plumbing, electrical, roofing...", type: "text" },
  { key: "area", label: "What city or area do you cover?", placeholder: "e.g. Austin, TX and surrounding areas", type: "text" },
  { key: "phone", label: "What's your business phone number?", placeholder: "e.g. (512) 555-0182", type: "text" },
  { key: "email", label: "What email should customers use to reach you?", placeholder: "e.g. info@johnsonplumbing.com (optional — leave blank to skip)", type: "text" },
  { key: "address", label: "What's your business address?", placeholder: "e.g. 123 Main St, Austin, TX 78701 (optional — leave blank to skip)", type: "text" },
  { key: "license", label: "Do you have a license or insurance number you'd like to display?", placeholder: "e.g. License #TX-48213 (optional — builds trust with customers, leave blank to skip)", type: "text" },
  { key: "hours", label: "What are your opening hours?", placeholder: "e.g. Mon–Fri 7am–6pm, Sat 8am–2pm", type: "text" },
  { key: "services", label: "What services do you offer?", placeholder: "List as many as you'd like — e.g. drain cleaning, water heater repair, bathroom remodels...", type: "textarea" },
  { key: "about", label: "Tell us about you and your business — the more you write, the better your site will be", placeholder: "How long have you been in business? How many jobs have you done? What makes you different? What do customers say about you? What do you care about on the job?", type: "textarea" },
  { key: "whyChooseUs", label: "Why should customers choose you over the competition?", placeholder: "e.g. fast response times, fair prices, years of experience, guarantees, certifications...", type: "textarea" },
  { key: "reviews", label: "Do you have a Trustpilot or Google Business profile with reviews?", placeholder: "", type: "reviews" },
  { key: "logo", label: "Do you have a logo you'd like to use?", placeholder: "Optional — upload an image, or skip and we'll use your business name as text", type: "logo" },
  { key: "photos", label: "Got photos of your own work?", placeholder: "Optional — upload a few (decks, roofs, kitchens, etc.) and we'll show them on your site instead of stock photos", type: "file" },
];

const templates = [
  { id: "classic", name: "Classic & Trustworthy", desc: "Clean, professional, no-nonsense. Built for trades that win on reliability.", accent: "#38bdf8" },
  { id: "bold", name: "Modern & Bold", desc: "Sharp, confident, eye-catching. Stands out in a crowded local search.", accent: "#f59e0b" },
  { id: "warm", name: "Warm & Personal", desc: "Friendly, approachable, community-feel. Great for owner-operated businesses.", accent: "#fb7185" },
];

const buildingMessages = [
  "Reading through what you told us...",
  "Writing your headlines and page copy...",
  "Picking photos that match your trade...",
  "Optimizing your site to rank locally on Google...",
  "Putting on the finishing touches...",
];

type FormData = Record<string, string>;

function OnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accountDone, setAccountDone] = useState(false);
  const [account, setAccount] = useState({ name: "", email: "", password: "" });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [generatedSiteId, setGeneratedSiteId] = useState<string | null>(null);

  // If we're returning from Stripe Checkout, restore the saved account info and skip ahead
  useEffect(() => {
    if (searchParams.get("account") === "done") {
      const saved = sessionStorage.getItem("pp_account");
      if (saved) setAccount(JSON.parse(saved));
      setAccountDone(true);
    }
  }, [searchParams]);

  async function startCheckout() {
    setCheckoutError("");
    setCheckoutLoading(true);
    sessionStorage.setItem("pp_account", JSON.stringify(account));
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: account.name, email: account.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutError(data.error || "Something went wrong. Try again.");
        setCheckoutLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Something went wrong. Try again.");
      setCheckoutLoading(false);
    }
  }
  const [step, setStep] = useState(0); // 0..8 questions, 9 = template choice, 10 = preview, 11 = building, 12 = ready
  const [data, setData] = useState<FormData>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [buildMsgIndex, setBuildMsgIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [previewCopy, setPreviewCopy] = useState<GeneratedSiteCopy | null>(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [projectPhotos, setProjectPhotos] = useState<string[]>([]);
  const [photosUploading, setPhotosUploading] = useState(false);
  const [trustpilotUrl, setTrustpilotUrl] = useState("");
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState("");

  async function handleLogoUpload(file: File) {
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      const json = await res.json();
      if (json.url) setLogoUrl(json.url);
    } catch {
      // ignore — logo is optional, user can continue without it
    } finally {
      setLogoUploading(false);
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
      // ignore — photos are optional
    } finally {
      setPhotosUploading(false);
    }
  }

  function removeProjectPhoto(url: string) {
    setProjectPhotos((p) => p.filter((u) => u !== url));
  }

  const current = questions[step];

  function updateField(value: string) {
    setData((d) => ({ ...d, [current.key]: value }));
  }

  function next() {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // last question — generate the site copy once, then show template choice
      setGeneratingPreview(true);
      fetch("/api/preview-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((r) => r.json())
        .then((json) => setPreviewCopy(json.copy || localFallbackCopy(data.businessName || "", data.trade || "", data.area || "", data.license || "")))
        .catch(() => setPreviewCopy(localFallbackCopy(data.businessName || "", data.trade || "", data.area || "", data.license || "")))
        .finally(() => {
          setGeneratingPreview(false);
          setStep(questions.length);
        });
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function previewTemplate(id: string) {
    setSelectedTemplate(id);
    setStep(questions.length + 1); // preview screen
  }

  async function confirmTemplate(id: string) {
    setStep(questions.length + 2); // building screen
    setSubmitting(true);

    // cycle through fun building messages
    let i = 0;
    const interval = setInterval(() => {
      i = Math.min(i + 1, buildingMessages.length - 1);
      setBuildMsgIndex(i);
    }, 1400);

    let siteId: string | null = null;
    try {
      // 1. Save submission to DB
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, logoUrl, projectPhotos, trustpilotUrl, googleReviewsUrl, template: id, accountName: account.name, accountEmail: account.email }),
      });
      const json = await res.json();
      siteId = json?.id || null;
      setGeneratedSiteId(siteId);
      if (siteId) localStorage.setItem("pietpilot_site_id", siteId);

      // 2. Run AI generation + minimum animation time in parallel — show ready only when BOTH are done
      const minAnimation = new Promise<void>((resolve) =>
        setTimeout(resolve, buildingMessages.length * 1400 + 600)
      );
      const generate = siteId
        ? fetch("/api/generate-site", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: siteId }),
          }).catch(() => {})
        : Promise.resolve();

      await Promise.all([minAnimation, generate]);
    } catch {
      // if something fails, still show ready after minimum animation time
      await new Promise<void>((resolve) =>
        setTimeout(resolve, buildingMessages.length * 1400 + 600)
      );
    }

    clearInterval(interval);
    setSubmitting(false);
    setStep(questions.length + 3); // ready screen
  }

  const progressPct = step <= questions.length ? Math.round(((step + 1) / (STEPS_TOTAL + 1)) * 100) : 100;

  if (accountDone && generatingPreview) {
    return (
      <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] flex flex-col items-center justify-center px-6 text-center">
        <a href="/" className="text-2xl font-extrabold tracking-tight mb-12">
          Piet<span className="text-[#f59e0b]">Pilot</span>
        </a>
        <div className="w-12 h-12 border-2 border-white/20 border-t-[#f59e0b] rounded-full animate-spin mb-8" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Putting together your previews...</h1>
        <p className="text-white/40 text-sm max-w-md">
          We're writing the headlines, copy and content for {data.businessName || "your business"} so you
          can see how each design looks with your real info — just a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] flex flex-col">
      {/* logo */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <a href="/" className="text-2xl font-extrabold tracking-tight">
            Piet<span className="text-[#f59e0b]">Pilot</span>
          </a>
        </div>
      </div>

      {/* progress bar */}
      {accountDone && !generatingPreview && step <= questions.length && (
        <div className="h-1 bg-white/[0.06]">
          <div className="h-full bg-[#f59e0b] transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">

          {/* ── ACCOUNT CREATION ── */}
          {!accountDone && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Let's create your account</h1>
              <p className="text-white/40 text-sm mb-8">
                Just the basics — we'll ask about your business next.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={account.name}
                  onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter" && account.name && account.email && account.password) startCheckout(); }}
                  placeholder="Your name"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
                />
                <input
                  type="email"
                  value={account.email}
                  onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter" && account.name && account.email && account.password) startCheckout(); }}
                  placeholder="Your email"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
                />
                <input
                  type="password"
                  value={account.password}
                  onChange={(e) => setAccount((a) => ({ ...a, password: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter" && account.name && account.email && account.password) startCheckout(); }}
                  placeholder="Choose a password"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
                />
              </div>

              <p className="text-white/30 text-xs mt-4">
                Next, you'll add your card to start your 14-day free trial — you won't be charged until the trial ends.
              </p>
              {checkoutError && <p className="text-red-400 text-xs mt-3">{checkoutError}</p>}

              <div className="flex justify-end mt-6">
                <button
                  onClick={startCheckout}
                  disabled={!account.name || !account.email || !account.password || checkoutLoading}
                  className="bg-[#f59e0b] hover:bg-[#fbbf24] disabled:opacity-40 disabled:cursor-not-allowed text-[#0b1220] font-bold text-sm px-7 py-3 rounded-xl transition-all hover:scale-[1.02]"
                >
                  {checkoutLoading ? "Redirecting to checkout..." : "Continue to payment →"}
                </button>
              </div>
            </div>
          )}

          {/* ── QUESTIONS ── */}
          {accountDone && !generatingPreview && step < questions.length && (
            <div>
              <p className="text-white/35 text-sm mb-3">Question {step + 1} of {questions.length}</p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{current.label}</h1>
              <p className="text-white/40 text-sm mb-8">{current.placeholder}</p>

              {current.type === "textarea" && (
                <textarea
                  value={data[current.key] || ""}
                  onChange={(e) => updateField(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) next(); }}
                  rows={5}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all resize-none"
                  placeholder="Type your answer here..."
                />
              )}
              {current.type === "textarea" && (
                <p className="text-white/25 text-xs mt-2">Press {typeof window !== "undefined" && /Mac/.test(navigator.platform) ? "⌘" : "Ctrl"}+Enter to continue</p>
              )}
              {current.type === "text" && (
                <input
                  type="text"
                  value={data[current.key] || ""}
                  onChange={(e) => updateField(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") next(); }}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
                  placeholder="Type your answer here..."
                />
              )}
              {current.type === "file" && (
                <div className="border-2 border-dashed border-white/15 rounded-xl px-4 py-8 text-center">
                  {projectPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-3 justify-center mb-5">
                      {projectPhotos.map((url) => (
                        <div key={url} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Your work" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                          <button
                            onClick={() => removeProjectPhoto(url)}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {projectPhotos.length < 6 ? (
                    <>
                      <p className="text-white/40 text-sm mb-3">
                        {photosUploading ? "Uploading..." : "Upload up to 6 photos, or skip this step"}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={photosUploading}
                        onChange={(e) => {
                          if (e.target.files?.length) handlePhotosUpload(e.target.files);
                        }}
                        className="text-xs text-white/40"
                      />
                    </>
                  ) : (
                    <p className="text-white/40 text-sm">You've added 6 photos — remove one to add another</p>
                  )}
                </div>
              )}
              {current.type === "reviews" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-white/70">Trustpilot profile URL</label>
                    <input
                      type="url"
                      value={trustpilotUrl}
                      onChange={(e) => setTrustpilotUrl(e.target.value)}
                      placeholder="https://www.trustpilot.com/review/yourbusiness.com"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-white/70">Google Business reviews URL</label>
                    <input
                      type="url"
                      value={googleReviewsUrl}
                      onChange={(e) => setGoogleReviewsUrl(e.target.value)}
                      placeholder="https://g.page/r/yourbusiness/review"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50"
                    />
                    <p className="text-white/30 text-xs">Find your Google link: Google Maps → your business → Share → Copy link</p>
                  </div>
                  <p className="text-white/30 text-xs">Optional — skip this if you don&apos;t have any yet. You can always add them later in your dashboard.</p>
                </div>
              )}
              {current.type === "logo" && (
                <div className="border-2 border-dashed border-white/15 rounded-xl px-4 py-8 text-center">
                  {logoUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoUrl} alt="Your logo" className="max-h-20 max-w-[200px] object-contain" />
                      <button
                        onClick={() => setLogoUrl("")}
                        className="text-white/40 hover:text-white text-xs font-medium transition-colors"
                      >
                        Remove and upload a different logo
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-white/40 text-sm mb-3">
                        {logoUploading ? "Uploading..." : "Upload your logo, or skip this step"}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={logoUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file);
                        }}
                        className="text-xs text-white/40"
                      />
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-10">
                <button
                  onClick={back}
                  disabled={step === 0}
                  className="text-white/40 hover:text-white text-sm font-medium disabled:opacity-0 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={next}
                  className="bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-bold text-sm px-7 py-3 rounded-xl transition-all hover:scale-[1.02]"
                >
                  {step === questions.length - 1 ? "See my website options →" : "Continue →"}
                </button>
              </div>
            </div>
          )}

          {/* ── TEMPLATE CHOICE ── */}
          {accountDone && !generatingPreview && step === questions.length && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-center">
                Pick a starting look for your site
              </h1>
              <p className="text-white/40 text-sm mb-2 text-center max-w-md mx-auto">
                We've matched these to your trade. Whatever you pick now is just a starting point —
              </p>
              <p className="text-[#f59e0b] text-sm font-semibold mb-10 text-center">
                you can always edit the design or switch to a different one later. You're never locked in.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => previewTemplate(t.id)}
                    className="card rounded-2xl p-5 text-left hover:-translate-y-1 transition-transform"
                  >
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
                    <h3 className="text-sm font-bold text-white mb-1">{t.name}</h3>
                    <p className="text-white/40 text-xs leading-relaxed">{t.desc}</p>
                  </button>
                ))}
              </div>

              <div className="text-center mt-10">
                <button onClick={back} className="text-white/40 hover:text-white text-sm font-medium transition-colors">
                  ← Back to questions
                </button>
              </div>
            </div>
          )}

          {/* ── TEMPLATE PREVIEW ── */}
          {accountDone && step === questions.length + 1 && selectedTemplate && (
            <div>
              {(() => {
                const t = templates.find((x) => x.id === selectedTemplate)!;
                return (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-center">
                      Here's a look at the "{t.name}" style
                    </h1>
                    <p className="text-white/40 text-sm mb-8 text-center max-w-md mx-auto">
                      This is just a preview of the look and feel — your real site will be filled
                      with content written specifically for {data.businessName || "your business"}.
                    </p>

                    <div className="rounded-2xl border border-white/10 bg-[#121b2e] overflow-hidden shadow-2xl mb-3">
                      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                        <span className="ml-3 text-xs text-white/30">{(data.businessName || "yourcompany").toLowerCase().replace(/[^a-z0-9]/g, "")}.com</span>
                      </div>
                      {!previewCopy ? (
                        <div className="p-16 flex flex-col items-center justify-center gap-3 text-white/40 text-sm">
                          <div className="w-6 h-6 border-2 border-white/20 border-t-[#f59e0b] rounded-full animate-spin" />
                          Writing your site's content...
                        </div>
                      ) : (
                        <div className="h-[480px] overflow-hidden relative">
                          <div
                            className="absolute top-0 left-0 origin-top-left"
                            style={{ width: "200%", transform: "scale(0.5)" }}
                          >
                            <GeneratedSite
                              data={{
                                id: "preview",
                                businessName: data.businessName || "Your Business",
                                trade: data.trade || "",
                                area: data.area || "",
                                phone: data.phone || "",
                                email: data.email || "",
                                address: data.address || "",
                                licenseNumber: data.license || "",
                                logoUrl: logoUrl || "",
                                hours: data.hours || "",
                                template: t.id,
                                copy: previewCopy,
                                projectPhotos,
                                trustpilotUrl,
                                googleReviewsUrl,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-[#f59e0b] text-xs font-semibold text-center mb-10">
                      Remember — you can always edit this design or switch to another later. You're never locked in.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => setStep(questions.length)}
                        className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
                      >
                        ← Try a different design
                      </button>
                      <button
                        onClick={() => confirmTemplate(t.id)}
                        className="inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-[0_8px_30px_-6px_rgba(245,158,11,0.45)] transition-all hover:scale-[1.03]"
                      >
                        Use this design →
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ── BUILDING SCREEN ── */}
          {accountDone && step === questions.length + 2 && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-8 relative">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-[#f59e0b] border-t-transparent animate-spin" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-3">Building your website...</h1>
              <p className="text-white/45 text-base transition-opacity duration-300">{buildingMessages[buildMsgIndex]}</p>
            </div>
          )}

          {/* ── READY SCREEN ── */}
          {accountDone && step === questions.length + 3 && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Your website is ready! 🎉</h1>
              <p className="text-white/45 text-base mb-10 max-w-sm mx-auto">
                {data.businessName ? `${data.businessName}'s` : "Your"} new site is live and already optimized to be found locally. You can edit anything, anytime.
              </p>
              <div className="flex items-center justify-center gap-4">
                {generatedSiteId && (
                  <a
                    href={`/site/${generatedSiteId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white text-sm font-semibold transition-colors"
                  >
                    View my website ↗
                  </a>
                )}
                <button
                  onClick={() => router.push(`/dashboard${generatedSiteId ? `?site=${generatedSiteId}` : ""}`)}
                  className="inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-base px-9 py-4 rounded-xl shadow-[0_8px_30px_-6px_rgba(245,158,11,0.45)] transition-all hover:scale-[1.03]"
                >
                  Go to my dashboard →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={null}>
      <OnboardingInner />
    </Suspense>
  );
}
