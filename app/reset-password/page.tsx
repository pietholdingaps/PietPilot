"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] flex flex-col items-center justify-center px-6">
      <a href="/" className="text-2xl font-extrabold tracking-tight mb-10">
        Piet<span className="text-[#f59e0b]">Pilot</span>
      </a>

      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-center">Reset your password</h1>

        {sent ? (
          <div className="text-center mt-6">
            <p className="text-white/60 text-sm mb-4">
              Check your inbox — we sent a password reset link to <strong className="text-white">{email}</strong>.
            </p>
            <a href="/login" className="text-[#f59e0b] text-sm font-semibold hover:text-[#fbbf24]">
              Back to login →
            </a>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 mt-8">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] disabled:opacity-50 text-[#0b1220] font-bold text-sm px-7 py-3.5 rounded-xl transition-colors"
            >
              {loading ? "Sending…" : "Send reset link →"}
            </button>
            <p className="text-center">
              <a href="/login" className="text-white/35 text-sm hover:text-white/60">
                Back to login
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
