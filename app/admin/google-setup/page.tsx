"use client";

import { useState } from "react";
import Link from "next/link";

const CORRECT = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bep55pfk";

export default function GoogleSetupPage() {
  const [input, setInput] = useState("");
  const [authed, setAuthed] = useState(!CORRECT);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === CORRECT) { setAuthed(true); }
    else { setError("Forkert kode."); }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center px-6">
        <div className="mb-8 text-center">
          <span className="text-2xl font-extrabold tracking-tight">Piet<span className="text-[#f59e0b]">Pilot</span></span>
          <p className="text-white/30 text-sm mt-2">Google Ads Setup</p>
        </div>
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <input type="password" value={input} onChange={e => setInput(e.target.value)} placeholder="Adgangskode" autoFocus
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm outline-none focus:border-[#f59e0b]/40 transition-all" />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={!input}
            className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] disabled:opacity-40 text-[#0b1220] font-bold text-sm py-3.5 rounded-xl transition-colors">
            Continue →
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">

        <Link href="/admin" className="text-white/30 text-sm hover:text-white/60 transition-colors mb-8 inline-block">
          ← Back to admin
        </Link>

        <h1 className="text-2xl font-extrabold tracking-tight mb-2">
          Google Ads — <span className="text-[#f59e0b]">One-time setup</span>
        </h1>
        <p className="text-white/40 text-sm mb-10">
          This authorizes Emil's MCC account (399-473-1141) to manage customer campaigns. You only need to do this once.
        </p>

        {/* Prerequisites checklist */}
        <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-6 mb-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/30 mb-5">Prerequisites</div>
          <div className="space-y-3">
            {[
              { label: "Google Cloud project created", sub: "console.cloud.google.com → create project" },
              { label: "OAuth 2.0 credentials created", sub: "APIs & Services → Credentials → Create OAuth client ID → Web application" },
              { label: "Redirect URI added", sub: `Add: ${typeof window !== "undefined" ? window.location.origin : "https://pietpilot.com"}/api/auth/google-ads/callback` },
              { label: "GOOGLE_CLIENT_ID added to Vercel", sub: "Vercel → Settings → Environment Variables" },
              { label: "GOOGLE_CLIENT_SECRET added to Vercel", sub: "Vercel → Settings → Environment Variables" },
              { label: "GOOGLE_ADS_DEVELOPER_TOKEN added to Vercel", sub: "From Google Ads → Tools → API Center" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full border border-white/20 flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white/80">{item.label}</div>
                  <div className="text-xs text-white/30 mt-0.5">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Authorize button */}
        <div className="bg-[#111] border border-[#f59e0b]/20 rounded-2xl p-6 mb-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#f59e0b]/60 mb-3">Authorize Emil's Google Account</div>
          <p className="text-sm text-white/50 mb-5">
            Click the button below to log in with the Google account that controls MCC 399-473-1141.
            After authorizing, you'll receive a refresh token to add to Vercel.
          </p>
          <a
            href="/api/auth/google-ads"
            className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#0b1220] font-bold text-sm px-6 py-3.5 rounded-xl transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.316 0-9.817-3.616-11.367-8.592l-6.498 4.988C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            Authorize with Google
          </a>
        </div>

        {/* After authorization */}
        <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/30 mb-3">After authorization</div>
          <ol className="space-y-2 text-sm text-white/50">
            <li>1. You'll see your refresh token on the next page</li>
            <li>2. Add it to Vercel as <code className="text-white/70 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">GOOGLE_ADS_REFRESH_TOKEN</code></li>
            <li>3. Also add <code className="text-white/70 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">GOOGLE_ADS_MCC_ID</code> = <code className="text-white/70 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">3994731141</code></li>
            <li>4. Redeploy → ads will create real campaigns</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
