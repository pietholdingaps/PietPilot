"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    const supabase = createSupabaseClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError("Something went wrong. Please try resetting again.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] flex flex-col items-center justify-center px-6">
      <a href="/" className="text-2xl font-extrabold tracking-tight mb-10">
        Piet<span className="text-[#f59e0b]">Pilot</span>
      </a>

      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-center">Set new password</h1>

        <form onSubmit={handleUpdate} className="space-y-4 mt-8">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min. 8 characters)"
            required
            autoComplete="new-password"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 transition-all"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
            autoComplete="new-password"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 transition-all"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full bg-[#f59e0b] hover:bg-[#fbbf24] disabled:opacity-50 text-[#0b1220] font-bold text-sm px-7 py-3.5 rounded-xl transition-colors"
          >
            {loading ? "Updating…" : "Update password →"}
          </button>
        </form>
      </div>
    </div>
  );
}
