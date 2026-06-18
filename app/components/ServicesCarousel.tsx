"use client";

import { useRef, useState } from "react";
import { Theme } from "./GeneratedSite";

export type ServiceCardItem = {
  title: string;
  description: string;
  image: string;
  href?: string;
};

export default function ServicesCarousel({ items, theme }: { items: ServiceCardItem[]; theme: Theme }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollToIndex(i: number) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    if (card) el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    setActive(i);
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    let closest = 0;
    let closestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const dist = Math.abs((child as HTMLElement).offsetLeft - el.scrollLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActive(closest);
  }

  // Shared classes for every flex item (whether <a> or <div>)
  const itemClass = "relative flex-none w-[260px] sm:w-[300px] aspect-[3/4] rounded-2xl overflow-hidden snap-start group cursor-pointer";

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 sm:-mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => {
          const inner = (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-extrabold text-lg mb-2 leading-tight">{item.title}</h3>
                <p className="text-sm text-white/80 mb-4 leading-relaxed line-clamp-3">{item.description}</p>
                {item.href && (
                  <span className="text-sm font-bold" style={{ color: theme.accent }}>
                    Learn more →
                  </span>
                )}
              </div>
            </>
          );

          return item.href ? (
            <a key={i} href={item.href} className={itemClass}>
              {inner}
            </a>
          ) : (
            <div key={i} className={itemClass}>
              {inner}
            </div>
          );
        })}
      </div>

      {/* Dot navigation */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to service ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{
                background: i === active ? theme.accent : `${theme.text}30`,
                transform: i === active ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
