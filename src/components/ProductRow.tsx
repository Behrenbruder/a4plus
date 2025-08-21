// src/components/ProductRow.tsx
import * as React from "react";

type RowProps = {
  title: string;
  img: string;                 
  imgAlt?: string;             
  pdf?: string;                
  reverse?: boolean;           
  children: React.ReactNode;   
  imgClassName?: string;       
};

export default function ProductRow({
  title,
  img,
  imgAlt,
  pdf,
  reverse = false,
  children,
  imgClassName,
}: RowProps) {
  return (
    <article
      className={`group grid items-center gap-8 md:gap-12 md:grid-cols-2 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Bild */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="aspect-[4/3] w-full">
          <img
            src={img}
            alt={imgAlt ?? title}
            className={[
              "h-full w-full object-contain transition-transform duration-500 will-change-transform",
              "scale-[1.0] group-hover:scale-1.0",
              imgClassName ?? "",
            ].join(" ")}
            loading="lazy"
          />
        </div>
      </div>

      {/* Text */}
      <div>
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
          {title}
        </h3>

        <div className="prose prose-gray max-w-none text-gray-700">
          {children}
        </div>

        {pdf && (
          <a href={pdf} target="_blank" rel="noreferrer">
            Datenblatt (PDF) herunterladen →
          </a>
        )}
      </div>
    </article>
  );
}
