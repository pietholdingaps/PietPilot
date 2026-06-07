"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setErrorMsg("Something went wrong. Try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-12 h-12 rounded-full bg-[#c75d3c]/15 border border-[#c75d3c]/30 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c75d3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="text-[#1b2430] font-semibold text-lg">You&apos;re on the list.</p>
        <p className="text-[#1b2430]/45 text-sm text-center max-w-xs">
          We&apos;ll reach out personally before you&apos;re charged anything. Expect to hear from us within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          className="flex-1 bg-white border border-[#1b2430]/12 rounded-xl px-4 py-3.5 text-[#1b2430] placeholder-[#1b2430]/30 text-sm outline-none focus:border-[#c75d3c]/50 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="bg-[#c75d3c] hover:bg-[#b44f30] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all whitespace-nowrap"
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Sending...
            </span>
          ) : (
            "Get Early Access →"
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-400 text-xs mt-3 text-center">{errorMsg}</p>
      )}
      <p className="text-[#1b2430]/30 text-xs text-center mt-3">
        No credit card. No spam. We&apos;ll reach out personally.
      </p>
    </form>
  );
}
