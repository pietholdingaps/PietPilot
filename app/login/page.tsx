"use client";

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
          />
        </div>

        <button
          disabled
          className="w-full mt-6 bg-[#f59e0b]/40 text-[#0b1220] font-bold text-sm px-7 py-3.5 rounded-xl cursor-not-allowed"
        >
          Log in (coming soon)
        </button>

        <p className="text-white/35 text-sm text-center mt-6">
          Account login is launching shortly. In the meantime, just{" "}
          <a href="/contact" className="text-[#f59e0b] hover:text-[#fbbf24] font-semibold">
            contact us
          </a>{" "}
          and we'll get you sorted.
        </p>
        <p className="text-white/35 text-sm text-center mt-2">
          New here?{" "}
          <a href="/onboarding" className="text-[#f59e0b] hover:text-[#fbbf24] font-semibold">
            Get started →
          </a>
        </p>
      </div>
    </div>
  );
}
