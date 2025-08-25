"use client";
import Link from "next/link";
import { useRef } from "react";

type Slide = { title: string; img: string; href: string; caption?: string };

export default function ProductCarouselWide({ slides }: { slides: Slide[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth; // eine volle Ansicht weiter
      containerRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }

  return (
    <div className="relative">
      {/* Pfeile */}
      <button
        aria-label="Zurück"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2"
      >
        ‹
      </button>
      <button
        aria-label="Weiter"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2"
      >
        ›
      </button>

      {/* Slider-Container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide px-10"
      >
        {slides.map((s, idx) => (
          <Link
            key={idx}
            href={s.href}
            className="flex-shrink-0 w-[calc(33.333%-1rem)] min-w-[280px] bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-t-xl">
              <img
                src={s.img}
                alt={s.title}
                className="w-full h-full object-contain bg-gray-50 hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{s.title}</h3>
              {s.caption && <p className="text-sm text-gray-500">{s.caption}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
