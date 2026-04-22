'use client';

import { useState } from 'react';

export function HelpTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="inline-flex flex-col items-start ml-1.5 align-middle">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex-shrink-0"
      >
        ?
      </button>
      {open && (
        <span className="mt-1.5 block max-w-xs text-xs text-slate-600 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 leading-relaxed">
          {text}
        </span>
      )}
    </span>
  );
}
