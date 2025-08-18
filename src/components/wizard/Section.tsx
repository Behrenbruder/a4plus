'use client';

import React, { PropsWithChildren, forwardRef } from 'react';

type Props = {
  number: number;
  title: string;
  done?: boolean;
  idAnchor: string;
};

const Section = forwardRef<HTMLDivElement, PropsWithChildren<Props>>(
  ({ number, title, done, idAnchor, children }, ref) => {
    return (
      <section id={idAnchor} ref={ref as any} className="scroll-mt-28">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold">
            {number}
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {done && (
            <span className="ml-1 inline-flex items-center text-emerald-700 text-sm">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              fertig
            </span>
          )}
        </div>

        <div className="p-4 border rounded-2xl bg-white shadow-sm">
          {children}
        </div>
      </section>
    );
  }
);

Section.displayName = 'Section';
export default Section;
