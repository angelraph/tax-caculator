'use client';

import { useState, useEffect } from 'react';
import { TaxResults } from '@/types/tax';
import { formatNaira } from '@/lib/formatters';

const R = 54;
const C = 2 * Math.PI * R;
const STROKE = 20;

export function DonutChart({ results }: { results: TaxResults }) {
  const { grossAnnualIncome, totalObligation, isExempt } = results;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  if (grossAnnualIncome === 0) return null;

  const taxPct = Math.min((totalObligation / grossAnnualIncome) * 100, 100);
  const keepPct = 100 - taxPct;
  const takeHome = grossAnnualIncome - totalObligation;

  const keepLen = animated ? (isExempt ? C : (keepPct / 100) * C) : 0;
  const taxLen = animated ? (isExempt ? 0 : (taxPct / 100) * C) : 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">💰</span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Where Your Money Goes</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isExempt ? 'You keep every naira — no tax!' : `You keep ${Math.round(keepPct)}% of your annual income`}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="absolute inset-0" width="160" height="160" viewBox="0 0 160 160">
            <g transform="rotate(-90, 80, 80)">
              {/* Track */}
              <circle
                cx={80} cy={80} r={R}
                fill="none"
                strokeWidth={STROKE}
                className="stroke-slate-100 dark:stroke-slate-700"
              />
              {/* Keep segment — emerald */}
              <circle
                cx={80} cy={80} r={R}
                fill="none"
                stroke="#10b981"
                strokeWidth={STROKE}
                strokeLinecap="butt"
                style={{
                  strokeDasharray: `${keepLen} ${C}`,
                  transition: 'stroke-dasharray 1.1s cubic-bezier(0.34, 1.2, 0.64, 1)',
                }}
              />
              {/* Tax segment — rose, offset after keep */}
              {!isExempt && (
                <circle
                  cx={80} cy={80} r={R}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth={STROKE}
                  strokeLinecap="butt"
                  style={{
                    strokeDasharray: `${taxLen} ${C}`,
                    strokeDashoffset: -keepLen,
                    transition: 'stroke-dasharray 1.1s cubic-bezier(0.34, 1.2, 0.64, 1), stroke-dashoffset 1.1s cubic-bezier(0.34, 1.2, 0.64, 1)',
                  }}
                />
              )}
            </g>
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
              {isExempt ? '100%' : `${Math.round(keepPct)}%`}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">you keep</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-4 w-full">
          {/* Keep */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">You Keep</p>
              <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                {formatNaira(isExempt ? grossAnnualIncome : takeHome)}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {formatNaira(isExempt ? grossAnnualIncome / 12 : takeHome / 12)}/month
              </p>
            </div>
          </div>
          {/* Tax */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isExempt ? 'bg-slate-100 dark:bg-slate-700' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
              <div className={`w-4 h-4 rounded-full ${isExempt ? 'bg-slate-300 dark:bg-slate-600' : 'bg-rose-500'}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tax Paid</p>
              <p className={`text-base font-bold ${isExempt ? 'text-slate-400 dark:text-slate-500' : 'text-rose-600 dark:text-rose-400'}`}>
                {isExempt ? '₦0 — Exempt' : formatNaira(totalObligation)}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {isExempt ? '₦0/month' : `${formatNaira(totalObligation / 12)}/month`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
