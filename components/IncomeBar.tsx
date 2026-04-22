'use client';

import { TaxResults } from '@/types/tax';
import { formatNaira } from '@/lib/formatters';

export function IncomeBar({ results }: { results: TaxResults }) {
  const { grossAnnualIncome, totalObligation, isExempt } = results;
  if (grossAnnualIncome === 0) return null;

  const takeHome = grossAnnualIncome - totalObligation;
  const taxPct = Math.min((totalObligation / grossAnnualIncome) * 100, 100);
  const keepPct = 100 - taxPct;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Your Income Breakdown</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isExempt
              ? 'You keep 100% of your income — no tax!'
              : `You keep ${keepPct.toFixed(1)}% of your income`}
          </p>
        </div>
      </div>

      {/* Segmented bar */}
      <div className="h-8 rounded-xl overflow-hidden flex mb-3 bg-slate-100 dark:bg-slate-700">
        {!isExempt && taxPct > 0 && (
          <div
            className="h-full bg-rose-400 dark:bg-rose-500 flex items-center justify-center transition-all duration-700"
            style={{ width: `${taxPct}%` }}
          >
            {taxPct > 8 && (
              <span className="text-[10px] font-bold text-white">{taxPct.toFixed(1)}%</span>
            )}
          </div>
        )}
        <div
          className="h-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center transition-all duration-700"
          style={{ width: `${keepPct}%` }}
        >
          {keepPct > 8 && (
            <span className="text-[10px] font-bold text-white">{keepPct.toFixed(1)}%</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {!isExempt && (
          <div className="flex items-start gap-2">
            <span className="w-3 h-3 rounded-sm bg-rose-400 dark:bg-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tax & Obligations</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatNaira(totalObligation)}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{formatNaira(totalObligation / 12)}/mo</p>
            </div>
          </div>
        )}
        <div className={`flex items-start gap-2 ${isExempt ? 'col-span-2' : ''}`}>
          <span className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isExempt ? 'Your full take-home pay' : 'Your take-home pay'}
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{formatNaira(takeHome)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{formatNaira(takeHome / 12)}/mo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
