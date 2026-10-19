"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("Incorrect email or password. Please try again.");
        return;
      }
      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] flex flex-col items-center justify-center px-6">
      <a href="/" className="text-2xl font-extrabold tracking-tight mb-10">
        Piet<span className="text-[#f59e0b]">Pilot</span>
      </a>

      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-center">Log in</h1>
        <p className="text-white/40 text-sm mb-8 text-center">
          Enter the email and password you used when you signed up.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            autoComplete="email"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full mt-2 bg-[#f59e0b] hover:bg-[#fbbf24] disabled:opacity-50 disabled:cursor-not-allowed text-[#0b1220] font-bold text-sm px-7 py-3.5 rounded-xl transition-colors"
          >
            {loading ? "Logging in…" : "Log in →"}
          </button>
        </form>

        <p className="text-white/35 text-sm text-center mt-6">
          New here?{" "}
          <a href="/onboarding" className="text-[#f59e0b] hover:text-[#fbbf24] font-semibold">
            Get started →
          </a>
        </p>
        <p className="text-white/35 text-sm text-center mt-2">
          Forgot your password?{" "}
          <a href="/reset-password" className="text-[#f59e0b] hover:text-[#fbbf24] font-semibold">
            Reset it
          </a>
        </p>
      </div>
    </div>
  );
}
