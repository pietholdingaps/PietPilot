"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  site: {
    id: string;
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
  done: boolean;
  href: string;
  cta: string;
  external?: boolean;
};

export default function SetupChecklist({ site }: Props) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(`setup_v4_${site.id}`) === "1"; } catch { return false; }
  });

  const hasCustomServicePhoto = !!(
    site.custom_images && Object.keys(site.custom_images).some((k) => k.startsWith("service_"))
  );

  const steps: Step[] = [
    { id: "photos", icon: "📸", title: "Update service photos", done: hasCustomServicePhoto, href: `/dashboard/edit?site=${site.id}#services`, cta: "Edit" },
    { id: "owner", icon: "👤", title: "Add your photo", done: !!(site.owner_name && site.owner_photo_url), href: `/dashboard/edit?site=${site.id}#owner`, cta: "Add" },
    { id: "project_photos", icon: "🏗️", title: "Add project photos", done: !!(site.project_photos?.length), href: `/dashboard/edit?site=${site.id}#photos`, cta: "Add" },
    { id: "googlemaps", icon: "🗺️", title: "Set up Google Maps", done: false, href: "https://business.google.com/create", cta: "Open", external: true },
    { id: "domain", icon: "🌐", title: "Connect your domain", done: !!(site.custom_domain), href: `/dashboard/edit?site=${site.id}#domain`, cta: "Set up" },
    { id: "ads", icon: "📢", title: "Start Google Ads", done: !!(site.generated_ads), href: `/ads?site=${site.id}`, cta: "Set up" },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const remaining = steps.length - doneCount;

  if (dismissed || remaining === 0) return null;

  return (
    <div className="mb-8">
      {/* Collapsed bar */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-2xl px-5 py-3.5 transition-all text-left"
      >
        {/* Progress dots */}
        <div className="flex gap-1 flex-none">
          {steps.map((s) => (
            <span
              key={s.id}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${s.done ? "bg-emerald-400" : "bg-white/20"}`}
            />
          ))}
        </div>

        <span className="text-sm text-white/70 flex-1">
          <span className="font-semibold text-white">{remaining} step{remaining !== 1 ? "s" : ""} left</span>
          {" "}to optimize your PietPilot
        </span>

        {/* Progress bar */}
        <div className="hidden sm:block w-20 h-1 bg-white/[0.08] rounded-full overflow-hidden flex-none">
          <div
            className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>

        <span className="text-white/30 text-xs flex-none">{open ? "▲" : "▼"}</span>
      </button>

      {/* Expanded list */}
      {open && (
        <div className="mt-2 bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 px-5 py-3.5 ${i < steps.length - 1 ? "border-b border-white/[0.05]" : ""}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-none transition-colors ${step.done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.06] text-white/20"}`}>
                {step.done ? "✓" : ""}
              </span>
              <span className="text-base flex-none">{step.icon}</span>
              <span className={`text-sm flex-1 ${step.done ? "line-through text-white/30" : "text-white/80"}`}>
                {step.title}
              </span>
              {!step.done && (
                step.external ? (
                  <a href={step.href} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#f59e0b] hover:text-[#fbbf24] transition-colors flex-none">
                    {step.cta} →
                  </a>
                ) : (
                  <Link href={step.href}
                    className="text-xs font-semibold text-[#f59e0b] hover:text-[#fbbf24] transition-colors flex-none">
                    {step.cta} →
                  </Link>
                )
              )}
            </div>
          ))}
          <div className="px-5 py-3 border-t border-white/[0.05] flex justify-end">
            <button
              onClick={() => {
                try { localStorage.setItem(`setup_v4_${site.id}`, "1"); } catch {}
                setDismissed(true);
              }}
              className="text-white/25 hover:text-white/50 text-xs transition-colors"
            >
              Dismiss checklist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
