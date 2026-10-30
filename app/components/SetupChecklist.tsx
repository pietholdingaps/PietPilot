"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  site: {
    id: string;
    slug?: string;
    owner_name?: string;
    owner_photo_url?: string;
    project_photos?: string[] | null;
    generated_copy?: {
      services?: Array<{ photo?: string }>;
      reviews?: Array<{ text: string }>;
    };
    generated_ads?: object | null;
    custom_domain?: string | null;
  };
};

type Step = {
  id: string;
  label: string;
  done: boolean;
  href: string;
  linkLabel: string;
};

export default function SetupChecklist({ site }: Props) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(`setup_dismissed_${site.id}`) === "1"; } catch { return false; }
  });

  const steps: Step[] = [
    {
      id: "live",
      label: "Your website is live",
      done: true,
      href: site.slug ? `/${site.slug}` : `/site/${site.id}`,
      linkLabel: "View site →",
    },
    {
      id: "service_photos",
      label: "Add photos to your services",
      done: !!(
        site.generated_copy?.services?.some((s) => s.photo && !s.photo.includes("pexels.com") && !s.photo.startsWith("https://images.unsplash"))
      ),
      href: `/dashboard/edit?site=${site.id}#services`,
      linkLabel: "Add photos →",
    },
    {
      id: "owner_photo",
      label: "Add a photo of yourself",
      done: !!(site.owner_name && site.owner_photo_url),
      href: `/dashboard/edit?site=${site.id}#owner`,
      linkLabel: "Add photo →",
    },
    {
      id: "project_photos",
      label: "Add project photos",
      done: !!(site.project_photos && site.project_photos.length > 0),
      href: `/dashboard/edit?site=${site.id}#photos`,
      linkLabel: "Add photos →",
    },
    {
      id: "review",
      label: "Add a customer review",
      done: !!(site.generated_copy?.reviews && site.generated_copy.reviews.length > 0),
      href: `/dashboard/edit?site=${site.id}#reviews`,
      linkLabel: "Add review →",
    },
    {
      id: "domain",
      label: "Connect your own domain",
      done: !!(site.custom_domain),
      href: `/dashboard/edit?site=${site.id}#domain`,
      linkLabel: "Set up domain →",
    },
    {
      id: "ads",
      label: "Connect Google Ads",
      done: !!(site.generated_ads),
      href: `/ads?site=${site.id}`,
      linkLabel: "Set up ads →",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  if (dismissed || allDone) return null;

  return (
    <div className="card rounded-2xl p-6 mb-8 border border-[#f59e0b]/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white mb-0.5">Finish setting up your website</h2>
          <p className="text-white/40 text-sm">{doneCount} of {steps.length} steps completed</p>
        </div>
        <button
          onClick={() => {
            try { localStorage.setItem(`setup_dismissed_${site.id}`, "1"); } catch {}
            setDismissed(true);
          }}
          className="text-white/20 hover:text-white/50 text-xs transition-colors ml-4 mt-0.5"
        >
          Dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/[0.06] rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2.5">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-none text-xs font-bold transition-colors ${
                step.done
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/[0.06] text-white/30"
              }`}>
                {step.done ? "✓" : ""}
              </span>
              <span className={`text-sm ${step.done ? "text-white/40 line-through" : "text-white/80"}`}>
                {step.label}
              </span>
            </div>
            {!step.done && (
              <Link
                href={step.href}
                className="text-[#f59e0b] text-xs font-semibold hover:text-[#fbbf24] transition-colors whitespace-nowrap"
              >
                {step.linkLabel}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
