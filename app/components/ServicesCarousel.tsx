"use client";

import { useRef, useState, useCallback } from "react";
import { Theme } from "./GeneratedSite";

export type ServiceCardItem = {
  title: string;
  description: string;
  image: string;
  fallbackImage?: string;
  href?: string;
};

export default function ServicesCarousel({ items, theme }: { items: ServiceCardItem[]; theme: Theme }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Mouse drag-to-scroll state
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

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

  // Mouse drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    dragStartX.current = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    el.scrollLeft = dragScrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    const el = scrollRef.current;
    if (el) {
      el.style.cursor = "grab";
      el.style.userSelect = "";
    }
  }, []);

  function prev() {
    const i = Math.max(0, active - 1);
    scrollToIndex(i);
  }

  function next() {
    const i = Math.min(items.length - 1, active + 1);
    scrollToIndex(i);
  }

  // Shared classes for every flex item (whether <a> or <div>)
  const itemClass = "relative flex-none w-[72vw] sm:w-[45vw] md:w-[calc(25%-15px)] aspect-[3/4] rounded-2xl overflow-hidden snap-start group";

  return (
    <div className="relative">
      {/* Scroll track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 sm:-mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ cursor: "grab" }}
      >
        {items.map((item, i) => {
          const inner = (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                draggable={false}
                onError={(e) => {
                  const el = e.currentTarget;
                  if (item.fallbackImage && el.src !== item.fallbackImage) {
                    el.src = item.fallbackImage;
                  } else if (el.src !== "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=70") {
                    // Last resort: generic tradesperson photo that will never break
                    el.src = "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=70";
                  }
                }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-extrabold text-lg mb-2 leading-tight capitalize">{item.title}</h3>
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

      {/* Arrow buttons — only show if more than 1 item */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            disabled={active === 0}
            aria-label="Previous service"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
            style={{ background: theme.accent, color: "#fff" }}
          >
            ←
          </button>
          <button
            onClick={next}
            disabled={active === items.length - 1}
            aria-label="Next service"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
            style={{ background: theme.accent, color: "#fff" }}
          >
            →
          </button>
        </>
      )}

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
