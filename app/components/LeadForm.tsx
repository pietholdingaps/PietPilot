"use client";

import { useState } from "react";

export default function LeadForm({
  siteId,
  accent,
  accentText,
  textColor,
  mutedColor,
  cardBg,
  borderColor,
}: {
  siteId: string;
  accent: string;
  accentText: string;
  textColor: string;
  mutedColor: string;
  cardBg: string;
  borderColor: string;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !contact || !message) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, name, contact, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setName("");
      setContact("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: cardBg, border: `1px solid ${borderColor}` }}
      >
        <p className="font-bold text-lg mb-1">Thanks — message sent! ✓</p>
        <p className="text-sm" style={{ color: mutedColor }}>We'll get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 sm:p-8 space-y-4"
      style={{ background: cardBg, border: `1px solid ${borderColor}` }}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          style={{ background: "transparent", border: `1px solid ${borderColor}`, color: textColor }}
        />
        <input
          type="text"
          required
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone or email"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          style={{ background: "transparent", border: `1px solid ${borderColor}`, color: textColor }}
        />
      </div>
      <textarea
        required
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What can we help you with?"
        className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors"
        style={{ background: "transparent", border: `1px solid ${borderColor}`, color: textColor }}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        style={{ background: accent, color: accentText }}
        className="w-full inline-flex items-center justify-center gap-2 font-bold text-base px-8 py-3.5 rounded-xl shadow-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
      {status === "error" && (
        <p className="text-sm text-center" style={{ color: "#ef4444" }}>
          Something went wrong — please try calling or emailing us directly.
        </p>
      )}
    </form>
  );
}
