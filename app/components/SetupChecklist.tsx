"use client";

import Link from "next/link";

type Props = {
  site: {
    id: string;
    custom_domain?: string | null;
    generated_ads?: object | null;
    custom_images?: Record<string, string> | null;
    setup_completed?: Record<string, boolean> | null;
  };
};

export default function SetupChecklist({ site }: Props) {
  const hasCustomServicePhoto = !!(
    site.custom_images && Object.keys(site.custom_images).some((k) => k.startsWith("service_"))
  );

  const steps = [
    {
      id: "photos",
      label: "Update service photos with your real work",
      done: hasCustomServicePhoto || !!(site.setup_completed?.photos),
      href: `/dashboard/setup/photos?site=${site.id}`,
      external: false,
    },
    {
      id: "googlemaps",
      label: "Set up Google Maps to get found locally",
      done: false,
      href: `/dashboard/setup/googlemaps?site=${site.id}`,
      external: false,
    },
    {
      id: "domain",
      label: "Connect your own domain",
      done: !!(site.custom_domain),
      href: `/dashboard/setup/domain?site=${site.id}`,
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
  if (doneCount === steps.length) return null;

  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="mb-8 rounded-2xl overflow-hidden">
      {/* Top bar with progress */}
      <div className="bg-[#f59e0b] px-5 py-3 flex items-center justify-between">
        <p className="text-[#0b1220] text-sm font-extrabold tracking-tight">
          Get the most out of PietPilot
        </p>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-[#0b1220]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0b1220] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[#0b1220]/60 text-xs font-bold tabular-nums">{doneCount}/{steps.length}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-[#0f1a2e] border border-t-0 border-white/[0.06] rounded-b-2xl divide-y divide-white/[0.04]">
        {steps.map((step) => {
          const content = (
            <div className={`flex items-center gap-3.5 px-5 py-3.5 transition-colors ${
              !step.done ? "hover:bg-white/[0.03]" : ""
            }`}>
              <span className={`w-5 h-5 rounded-full flex-none flex items-center justify-center text-[10px] font-bold transition-all ${
                step.done
                  ? "bg-emerald-500 text-white"
                  : "border-2 border-[#f59e0b]/40 text-transparent"
              }`}>
                {step.done ? "✓" : ""}
              </span>
              <span className={`text-sm flex-1 ${step.done ? "text-white/30 line-through" : "text-white/75"}`}>
                {step.label}
              </span>
              {!step.done && (
                <span className="text-[#f59e0b] text-sm flex-none">→</span>
              )}
            </div>
          );

          if (step.done) return <div key={step.id}>{content}</div>;
          if (step.external) return (
            <a key={step.id} href={step.href} target="_blank" rel="noopener noreferrer" className="block">
              {content}
            </a>
          );
          return (
            <Link key={step.id} href={step.href} className="block">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
