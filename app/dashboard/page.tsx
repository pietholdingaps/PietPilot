"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const searchParams = useSearchParams();
  const [site, setSite] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("site");
    if (fromUrl) {
      setSite(fromUrl);
      localStorage.setItem("pietpilot_site_id", fromUrl);
    } else {
      const stored = localStorage.getItem("pietpilot_site_id");
      if (stored) setSite(stored);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <span className="text-2xl font-extrabold tracking-tight">
            Piet<span className="text-[#f59e0b]">Pilot</span>
          </span>
          <span className="text-white/40 text-sm">Dashboard</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome aboard 👋</h1>
        <p className="text-white/45 text-base mb-12 max-w-lg">
          Your website is live. Here's where you'll manage everything — leads, ads, and
          your site — all in one place as we roll out new features.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="card rounded-2xl p-7">
            <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Your website</div>
            <h3 className="text-lg font-bold text-white mb-2">Live & published</h3>
            <p className="text-white/45 text-sm leading-relaxed mb-4">
              Your site is online and optimized for local search.
            </p>
            {site ? (
              <a
                href={`/site/${site}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f59e0b] text-sm font-semibold hover:text-[#fbbf24] transition-colors"
              >
                View my website ↗
              </a>
            ) : (
              <span className="text-white/30 text-sm">
                Couldn't find your site —{" "}
                <a href="/contact" className="text-[#f59e0b] hover:text-[#fbbf24] font-semibold">
                  contact us
                </a>{" "}
                and we'll sort it.
              </span>
            )}
          </div>

          <div className="card rounded-2xl p-7">
            <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Leads</div>
            <h3 className="text-lg font-bold text-white mb-2">Coming soon</h3>
            <p className="text-white/45 text-sm leading-relaxed">
              Once your Google Ads are connected, leads will show up here automatically.
            </p>
          </div>

          <div className="card rounded-2xl p-7">
            <div className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-3">Support</div>
            <h3 className="text-lg font-bold text-white mb-2">We've got you</h3>
            <p className="text-white/45 text-sm leading-relaxed mb-4">
              Questions or want to change something on your site? Just reach out.
            </p>
            <a href="/contact" className="text-[#f59e0b] text-sm font-semibold hover:text-[#fbbf24] transition-colors">
              Contact us →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
