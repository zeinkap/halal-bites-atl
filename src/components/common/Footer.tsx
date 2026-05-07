import React from 'react';
import { ExclamationTriangleIcon } from '../ui/icons';

export default function Footer() {
  return (
    <footer
      aria-label="Site disclaimer"
      className="w-full mt-auto pt-6 pb-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs text-stone-600">
            <span className="inline-flex items-center gap-1.5 shrink-0 font-medium text-amber-700">
              <ExclamationTriangleIcon className="w-3 h-3 text-amber-500" aria-hidden="true" />
              Disclaimer
            </span>
            <p className="leading-snug">
              Details may change. Confirm with the restaurant before your visit.
            </p>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} Halal Bites ATL · Atlanta, GA
        </p>
      </div>
    </footer>
  );
}
