"use client";

import { useState, useEffect, useCallback } from "react";

interface WorkGalleryProps {
  photos: string[];
  businessName: string;
  accent: string;
}

export default function WorkGallery({ photos, businessName, accent }: WorkGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const open = (i: number) => setLightboxIndex(i);
  const close = () => setLightboxIndex(null);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  }, [photos.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, prev, next]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  return (
    <>
      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {photos.map((url, i) => (
          <button
            key={i}
            onClick={() => open(i)}
            className="rounded-2xl overflow-hidden aspect-[4/3] block w-full focus:outline-none group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${businessName} project ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={close}
        >
          {/* Image */}
          <div
            className="relative max-w-5xl w-full mx-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightboxIndex]}
              alt={`${businessName} project ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {/* Counter */}
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
            >
              {lightboxIndex + 1} / {photos.length}
            </div>

            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold hover:opacity-70 transition-opacity"
              style={{ background: "rgba(0,0,0,0.6)" }}
              aria-label="Close"
            >
              ×
            </button>

            {/* Prev */}
            {photos.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-0 -translate-x-14 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold hover:opacity-70 transition-opacity"
                style={{ background: accent }}
                aria-label="Previous"
              >
                ←
              </button>
            )}

            {/* Next */}
            {photos.length > 1 && (
              <button
                onClick={next}
                className="absolute right-0 translate-x-14 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold hover:opacity-70 transition-opacity"
                style={{ background: accent }}
                aria-label="Next"
              >
                →
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
