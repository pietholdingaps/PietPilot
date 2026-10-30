"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  site: {
    id: string;
    slug?: string;
    owner_photo_url?: string;
    project_photos?: string[] | null;
    custom_domain?: string | null;
    generated_copy?: {
      services?: Array<{ photo?: string; customPhoto?: string }>;
      reviews?: Array<{ text: string }>;
    };
    generated_ads?: object | null;
    custom_images?: Record<string, string> | null;
  };
};

type Step = {
  id: string;
  icon: string;
  title: string;
  description: string;
  done: boolean;
  href: string;
  cta: string;
};

export default function SetupChecklist({ site }: Props) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(`setup_v2_dismissed_${site.id}`) === "1"; } catch { return false; }
  });

  const hasCustomServicePhoto = !!(
    site.custom_images && Object.keys(site.custom_images).some((k) => k.startsWith("service_"))
  );

  const steps: Step[] = [
    {
      id: "photos",
      icon: "📸",
      title: "Update your service photos",
      description: "AI picks generic stock photos. Upload your own to stand out.",
      done: hasCustomServicePhoto,
      href: `/dashboard/edit?site=${site.id}#services`,
      cta: "Edit photos",
    },
    {
      id: "review",
      icon: "⭐",
      title: "Add a customer review",
      description: "The #1 thing that converts visitors into leads.",
      done: !!(site.generated_copy?.reviews && site.generated_copy.reviews.length > 0),
      href: `/dashboard/edit?site=${site.id}#reviews`,
      cta: "Add review",
    },
    {
      id: "domain",
      icon: "🌐",
      title: "Connect your own domain",
      description: "Use yourbusiness.com instead of pietpilot.com/your-name.",
      done: !!(site.custom_domain),
      href: `/dashboard/edit?site=${site.id}#domain`,
      cta: "Set up domain",
    },
    {
      id: "ads",
      icon: "📢",
      title: "Start Google Ads",
      description: "Get in front of people searching for your services today.",
      done: !!(site.generated_ads),
      href: `/ads?site=${site.id}`,
      cta: "Set up ads",
    },
  ];

  const remaining = steps.filter((s) => !s.done);
  const doneCount = steps.length - remaining.length;

  if (dismissed || remaining.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-white">Get ready for customers</h2>
          <span className="text-xs text-white/40 bg-white/[0.06] px-2.5 py-1 rounded-full">
            {doneCount}/{steps.length} done
          </span>
        </div>
        <button
          onClick={() => {
            try { localStorage.setItem(`setup_v2_dismissed_${site.id}`, "1"); } catch {}
            setDismissed(true);
          }}
          className="text-white/20 hover:text-white/50 text-xs transition-colors"
        >
          Dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/[0.06] rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`card rounded-2xl p-5 flex gap-4 items-start transition-all ${
              step.done ? "opacity-40" : "border border-white/[0.08] hover:border-white/20"
            }`}
          >
            <span className="text-2xl flex-none mt-0.5">{step.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {step.done && (
                  <span className="text-emerald-400 text-xs font-bold">✓ Done</span>
                )}
                <p className={`text-sm font-bold ${step.done ? "line-through text-white/60" : "text-white"}`}>
                  {step.title}
                </p>
              </div>
              {!step.done && (
                <>
                  <p className="text-white/40 text-xs leading-relaxed mb-3">{step.description}</p>
                  <Link
                    href={step.href}
                    className="inline-block bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors"
                  >
                    {step.cta} →
                  </Link>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
