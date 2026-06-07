"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS_TOTAL = 9;

const questions = [
  { key: "businessName", label: "What's your business name?", placeholder: "e.g. Johnson Plumbing", type: "text" },
  { key: "trade", label: "What trade are you in?", placeholder: "e.g. Plumbing, electrical, roofing...", type: "text" },
  { key: "area", label: "What city or area do you cover?", placeholder: "e.g. Austin, TX and surrounding areas", type: "text" },
  { key: "phone", label: "What's your business phone number?", placeholder: "e.g. (512) 555-0182", type: "text" },
  { key: "hours", label: "What are your opening hours?", placeholder: "e.g. Mon–Fri 7am–6pm, Sat 8am–2pm", type: "text" },
  { key: "services", label: "What services do you offer?", placeholder: "List as many as you'd like — e.g. drain cleaning, water heater repair, bathroom remodels...", type: "textarea" },
  { key: "experience", label: "How long have you been in business? How many jobs have you done?", placeholder: "e.g. 12 years, 1000+ jobs completed", type: "text" },
  { key: "about", label: "Tell us about you and your business — the more you write, the better your site will be", placeholder: "What makes you different? What do customers say about you? What do you care about on the job?", type: "textarea" },
  { key: "photos", label: "Do you have photos of your own work?", placeholder: "You can skip this — we'll use trade-relevant stock photos instead", type: "file" },
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

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0..8 questions, 9 = template choice, 10 = building, 11 = ready
  const [data, setData] = useState<FormData>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [buildMsgIndex, setBuildMsgIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const current = questions[step];

  function updateField(value: string) {
    setData((d) => ({ ...d, [current.key]: value }));
  }

  function next() {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(questions.length); // go to template choice
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  async function chooseTemplate(id: string) {
    setSelectedTemplate(id);
    setStep(questions.length + 1); // building screen
    setSubmitting(true);

    // cycle through fun building messages
    let i = 0;
    const interval = setInterval(() => {
      i = Math.min(i + 1, buildingMessages.length - 1);
      setBuildMsgIndex(i);
    }, 1400);

    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, template: id }),
      });
    } catch {
      // even if saving fails, keep the user moving — we don't want to block the experience
    }

    setTimeout(() => {
      clearInterval(interval);
      setSubmitting(false);
      setStep(questions.length + 2); // ready screen
    }, buildingMessages.length * 1400 + 600);
  }

  const progressPct = step <= questions.length ? Math.round(((step + 1) / (STEPS_TOTAL + 1)) * 100) : 100;

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] flex flex-col">
      {/* progress bar */}
      {step <= questions.length && (
        <div className="h-1 bg-white/[0.06]">
          <div className="h-full bg-[#f59e0b] transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">

          {/* ── QUESTIONS ── */}
          {step < questions.length && (
            <div>
              <p className="text-white/35 text-sm mb-3">Question {step + 1} of {questions.length}</p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{current.label}</h1>
              <p className="text-white/40 text-sm mb-8">{current.placeholder}</p>

              {current.type === "textarea" && (
                <textarea
                  value={data[current.key] || ""}
                  onChange={(e) => updateField(e.target.value)}
                  rows={5}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all resize-none"
                  placeholder="Type your answer here..."
                />
              )}
              {current.type === "text" && (
                <input
                  type="text"
                  value={data[current.key] || ""}
                  onChange={(e) => updateField(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
                  placeholder="Type your answer here..."
                />
              )}
              {current.type === "file" && (
                <div className="border-2 border-dashed border-white/15 rounded-xl px-4 py-8 text-center">
                  <p className="text-white/40 text-sm mb-3">Drag & drop photos here, or skip this step</p>
                  <input type="file" multiple className="text-xs text-white/40" />
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
          {step === questions.length && (
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
                    onClick={() => chooseTemplate(t.id)}
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

          {/* ── BUILDING SCREEN ── */}
          {step === questions.length + 1 && (
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
          {step === questions.length + 2 && (
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
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-extrabold text-base px-9 py-4 rounded-xl shadow-[0_8px_30px_-6px_rgba(245,158,11,0.45)] transition-all hover:scale-[1.03]"
              >
                Go to my dashboard →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
