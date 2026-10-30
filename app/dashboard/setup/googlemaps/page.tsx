"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SetupGoogleMaps() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}

function Inner() {
  const params = useSearchParams();
  const siteId = params.get("site");

  const steps = [
    {
      num: "1",
      title: "Go to Google Business Profile",
      body: "Click the button below to open Google's free setup page.",
      action: (
        <a
          href="https://business.google.com/create"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          Open Google Business Profile →
        </a>
      ),
    },
    {
      num: "2",
      title: "Enter your business name",
      body: "Type the name of your business exactly as you want it to appear on Google Maps.",
    },
    {
      num: "3",
      title: "Choose your business category",
      body: "Pick the category that best matches your trade — e.g. \"Plumber\", \"Electrician\" or \"Roofing contractor\".",
    },
    {
      num: "4",
      title: "Add your location and service area",
      body: "Enter your address and the towns or counties you work in. This is what determines which searches you show up for.",
    },
    {
      num: "5",
      title: "Verify your business",
      body: "Google sends a postcard with a code to your address (takes 1–2 weeks) or may offer instant verification by phone or email.",
    },
    {
      num: "6",
      title: "Add your website and phone number",
      body: "Add the link to your PietPilot website and your phone number. This gets you calls directly from Google Maps.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-4 sm:px-6 py-12">
      <div className="max-w-xl mx-auto">
        <Link href={`/dashboard?site=${siteId}`} className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/70 text-sm mb-8 transition-colors">
          ← Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Set up Google Maps</h1>
          <p className="text-white/45 text-sm">A free Google Business Profile gets you found when locals search for your services. Most tradespeople get their first lead within a week.</p>
        </div>

        <div className="flex flex-col gap-4">
          {steps.map((step) => (
            <div key={step.num} className="card rounded-2xl p-5 flex gap-4">
              <span className="w-7 h-7 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] text-sm font-extrabold flex items-center justify-center flex-none mt-0.5">
                {step.num}
              </span>
              <div>
                <p className="font-bold text-white text-sm mb-1">{step.title}</p>
                <p className="text-white/45 text-sm leading-relaxed">{step.body}</p>
                {step.action}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
          <p className="text-sm font-bold text-emerald-400 mb-1">💡 Pro tip</p>
          <p className="text-white/50 text-sm leading-relaxed">
            Once you're verified, ask your first few customers to leave a Google review. 5 reviews puts you ahead of 90% of local competitors.
          </p>
        </div>
      </div>
    </div>
  );
}
