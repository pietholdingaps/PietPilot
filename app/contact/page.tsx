"use client";

import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit() {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#eef1f6] flex flex-col items-center justify-center px-6 py-20">
      <a href="/" className="text-2xl font-extrabold tracking-tight mb-10">
        Piet<span className="text-[#f59e0b]">Pilot</span>
      </a>

      <div className="w-full max-w-md">
        {status === "done" ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center mx-auto mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Message sent 🎉</h1>
            <p className="text-white/45 text-sm">Thanks for reaching out — we'll get back to you within a day.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight mb-2 text-center">Get in touch</h1>
            <p className="text-white/40 text-sm mb-8 text-center">
              Questions, feedback, or need a hand? Drop us a message and we'll reply quickly.
            </p>

            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="How can we help?"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 text-sm outline-none focus:border-[#f59e0b]/50 focus:bg-white/[0.08] transition-all resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-sm mt-3">Something went wrong — please try again or email us directly.</p>
            )}

            <button
              onClick={submit}
              disabled={status === "loading" || !email || !message}
              className="w-full mt-6 bg-[#f59e0b] hover:bg-[#fbbf24] disabled:opacity-40 disabled:cursor-not-allowed text-[#0b1220] font-bold text-sm px-7 py-3.5 rounded-xl transition-all"
            >
              {status === "loading" ? "Sending..." : "Send message"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
