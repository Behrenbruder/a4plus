'use client';
import { PropsWithChildren } from 'react';

export function WizardShell({ step, total, title, children }: PropsWithChildren<{ step:number; total:number; title:string }>) {
  const pct = Math.round((step/total)*100);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-4">
        <div className="text-sm text-gray-500">Schritt {step} / {total}</div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="mt-3 h-2 bg-gray-200 rounded">
          <div className="h-2 bg-emerald-600 rounded" style={{width:`${pct}%`}} />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow">{children}</div>
    </div>
  );
}
