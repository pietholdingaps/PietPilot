"use client";

import { useState } from "react";

const items = [
  {
    q: "Do I need any technical skills to use PietPilot?",
    a: "No. We build and run everything for you — the website, the SEO, the ads. You don't need to touch a line of code or learn any new software.",
  },
  {
    q: "How does the 14-day free trial work?",
    a: "You get full access for 14 days. We'll ask for a card to set up your account, but you won't be charged until the trial ends — and you can cancel anytime before then with no charge at all.",
  },
  {
    q: "What happens if I cancel?",
    a: "You can cancel anytime, month to month — no contracts. If you cancel, your hosted website comes down at the end of your billing period.",
  },
  {
    q: "How long does it take to get my website live?",
    a: "Your website is typically live within minutes of completing the setup. Answer a few questions about your business, pick a design, and we generate your full site on the spot — copy, SEO, and all.",
  },
  {
    q: "Will my site show up in local Google searches?",
    a: "Every site we build is set up correctly for local SEO from day one — the right structure, keywords, and location signals that Google looks for. That said, SEO takes time to build up. Most businesses start seeing results within a few weeks to a few months. Google Ads will get you in front of customers immediately while your organic ranking grows.",
  },
  {
    q: "Is Google Ads spend included in the $149/month?",
    a: "No — and we want to be upfront about that. Your $149/month covers everything we do: building and hosting your website, managing your Google Ads campaigns, and your leads dashboard. The actual money you spend on Google Ads (what Google charges per click) is separate and paid directly to Google. You set your own daily budget — most tradespeople start with $10–30/day. You're always in control of what you spend.",
  },
  {
    q: "What web address will my site have?",
    a: "By default, your site gets a clean address like pietpilot.com/your-business-name — completely free and shareable. We strongly recommend also connecting your own domain (like www.jensensplumbing.com), as it looks far more professional to customers and builds trust. You can connect your existing domain or buy a new one for around $10–15/year. We'll walk you through the setup step by step — it takes about 5 minutes.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto divide-y divide-white/[0.06] rounded-2xl border border-white/10 overflow-hidden">
      {items.map(({ q, a }, i) => (
        <div key={q} className="bg-[#121b2e]">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 text-white font-semibold text-sm sm:text-base"
          >
            {q}
            <span className={`flex-shrink-0 text-[#f59e0b] transition-transform duration-200 ${open === i ? "rotate-45" : ""}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </span>
          </button>
          <div
            className="grid transition-all duration-200 ease-in-out"
            style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <p className="px-6 pb-5 text-white/50 text-sm leading-relaxed">{a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
