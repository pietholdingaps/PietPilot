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
    custom_domain?: string | null;
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
  external?: boolean;
};

export default function SetupChecklist({ site }: Props) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(`setup_v3_dismissed_${site.id}`) === "1"; } catch { return false; }
  });

  const hasCustomServicePhoto = !!(
    site.custom_images && Object.keys(site.custom_images).some((k) => k.startsWith("service_"))
  );

  const steps: Step[] = [
    {
      id: "photos",
      icon: "📸",
      title: "Update service photos",
      description: "Replace AI stock photos with your own real work.",
      done: hasCustomServicePhoto,
      href: `/dashboard/edit?site=${site.id}#services`,
      cta: "Edit photos",
    },
    {
      id: "owner",
      icon: "👤",
      title: "Add your photo",
      description: "A face builds trust. Customers choose people, not logos.",
      done: !!(site.owner_name && site.owner_photo_url),
      href: `/dashboard/edit?site=${site.id}#owner`,
      cta: "Add photo",
    },
    {
      id: "project_photos",
      icon: "🏗️",
      title: "Add project photos",
      description: "Show real jobs you've done — your best sales tool.",
      done: !!(site.project_photos && site.project_photos.length > 0),
      href: `/dashboard/edit?site=${site.id}#photos`,
      cta: "Add photos",
    },
    {
      id: "googlemaps",
      icon: "🗺️",
      title: "Set up Google Maps",
      description: "Free listing. Gets you found in local searches instantly.",
      done: false,
      href: "https://business.google.com/create",
      cta: "Set up free →",
      external: true,
    },
    {
      id: "domain",
      icon: "🌐",
      title: "Connect your domain",
      description: "Use yourbusiness.com — looks far more professional.",
      done: !!(site.custom_domain),
      href: `/dashboard/edit?site=${site.id}#domain`,
      cta: "Set up domain",
    },
    {
      id: "ads",
      icon: "📢",
      title: "Start Google Ads",
      description: "Appear at the top when someone searches for your services.",
      done: !!(site.generated_ads),
      href: `/ads?site=${site.id}`,
      cta: "Set up ads",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  if (dismissed || allDone) return null;

  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-white">Optimize your PietPilot</h2>
          <span className="text-xs text-white/40 bg-white/[0.06] px-2.5 py-1 rounded-full">
            {doneCount}/{steps.length} done
          </span>
        </div>
        <button
          onClick={() => {
            try { localStorage.setItem(`setup_v3_dismissed_${site.id}`, "1"); } catch {}
            setDismissed(true);
          }}
          className="text-white/20 hover:text-white/50 text-xs transition-colors"
        >
          Dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-white/30 font-medium tabular-nums">{pct}%</span>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`rounded-2xl p-5 flex gap-4 items-start transition-all border ${
              step.done
                ? "border-emerald-500/20 bg-emerald-500/[0.04] opacity-60"
                : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
          >
            <span className="text-xl flex-none mt-0.5">{step.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className={`text-sm font-bold ${step.done ? "line-through text-white/50" : "text-white"}`}>
                  {step.title}
                </p>
                {step.done && <span className="text-emerald-400 text-xs font-bold flex-none">✓</span>}
              </div>
              {!step.done && (
                <>
                  <p className="text-white/40 text-xs leading-relaxed mb-3">{step.description}</p>
                  {step.external ? (
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors"
                    >
                      {step.cta}
                    </a>
                  ) : (
                    <Link
                      href={step.href}
                      className="inline-block bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors"
                    >
                      {step.cta} →
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
