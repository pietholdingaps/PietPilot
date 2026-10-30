"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  site: {
    id: string;
    custom_domain?: string | null;
    generated_ads?: object | null;
    custom_images?: Record<string, string> | null;
  };
};

export default function SetupChecklist({ site }: Props) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(`setup_v5_${site.id}`) === "1"; } catch { return false; }
  });

  const hasCustomServicePhoto = !!(
    site.custom_images && Object.keys(site.custom_images).some((k) => k.startsWith("service_"))
  );

  const steps = [
    {
      id: "photos",
      label: "Update service photos with your real work",
      done: hasCustomServicePhoto,
      href: `/dashboard/edit?site=${site.id}#services`,
      external: false,
    },
    {
      id: "googlemaps",
      label: "Set up Google Maps (free — gets you local customers)",
      done: false,
      href: "https://business.google.com/create",
      external: true,
    },
    {
      id: "domain",
      label: "Connect your own domain",
      done: !!(site.custom_domain),
      href: `/dashboard/edit?site=${site.id}#domain`,
      external: false,
    },
    {
      id: "ads",
      label: "Start Google Ads",
      done: !!(site.generated_ads),
      href: `/ads?site=${site.id}`,
      external: false,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  if (dismissed || doneCount === steps.length) return null;

  return (
    <div className="mb-8 rounded-2xl border-l-2 border-[#f59e0b] bg-[#f59e0b]/[0.04] border border-[#f59e0b]/20 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-bold text-white">Get the most out of PietPilot</p>
          <p className="text-xs text-white/40 mt-0.5">{steps.length - doneCount} things left to do</p>
        </div>
        <button
          onClick={() => {
            try { localStorage.setItem(`setup_v5_${site.id}`, "1"); } catch {}
            setDismissed(true);
          }}
          className="text-white/20 hover:text-white/50 text-xs transition-colors flex-none"
        >
          Dismiss
        </button>
      </div>

      <div className="space-y-2.5">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            <span className={`w-4 h-4 rounded-full border flex-none flex items-center justify-center transition-colors ${
              step.done ? "bg-emerald-500 border-emerald-500" : "border-white/20"
            }`}>
              {step.done && <span className="text-white text-[9px] font-bold">✓</span>}
            </span>
            {step.done ? (
              <span className="text-sm text-white/30 line-through">{step.label}</span>
            ) : step.external ? (
              <a href={step.href} target="_blank" rel="noopener noreferrer"
                className="text-sm text-white/80 hover:text-[#f59e0b] transition-colors">
                {step.label} <span className="text-[#f59e0b]">→</span>
              </a>
            ) : (
              <Link href={step.href}
                className="text-sm text-white/80 hover:text-[#f59e0b] transition-colors">
                {step.label} <span className="text-[#f59e0b]">→</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
