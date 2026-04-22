'use client';

import { useState, useMemo } from 'react';
import { TaxInputs, TaxResults } from '@/types/tax';
import { calculateTax } from '@/lib/taxCalculations';
import { formatNaira } from '@/lib/formatters';

interface Props {
  inputs: TaxInputs;
  currentResults: TaxResults;
}

const MAX_RELIEF = 1_000_000;
const STEP = 10_000;

export function TaxSavingsSimulator({ inputs, currentResults }: Props) {
  const [extra, setExtra] = useState(0);

  const simulated = useMemo(() => {
    if (extra === 0) return currentResults;
    return calculateTax({ ...inputs, otherDeductions: inputs.otherDeductions + extra });
  }, [inputs, extra, currentResults]);

  const saving = Math.max(0, currentResults.incomeTax - simulated.incomeTax);

  if (currentResults.isExempt || currentResults.taxableIncome === 0) return null;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">💡</span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Tax Savings Simulator</p>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 ml-7">
        Drag the slider to see how adding more legal reliefs reduces your tax
      </p>

      {/* Slider */}
      <div className="space-y-2 mb-5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Extra relief amount
          </label>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {formatNaira(extra)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_RELIEF}
          step={STEP}
          value={extra}
          onChange={e => setExtra(Number(e.target.value))}
          className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>₦0</span>
          <span>₦500k</span>
          <span>₦1M</span>
        </div>
      </div>

      {/* Result cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
          <p className="text-xs text-slate-500 dark:text-slate-400">Current tax</p>
          <p className="text-base font-bold text-slate-900 dark:text-white">{formatNaira(currentResults.incomeTax)}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{formatNaira(currentResults.monthlyIncomeTax)}/mo</p>
        </div>
        <div className={`p-3 rounded-xl border transition-colors duration-300 ${
          saving > 0
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
        }`}>
          <p className="text-xs text-slate-500 dark:text-slate-400">With added relief</p>
          <p className={`text-base font-bold ${saving > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
            {formatNaira(simulated.incomeTax)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{formatNaira(simulated.monthlyIncomeTax)}/mo</p>
        </div>
      </div>

      {saving > 0 && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <span className="text-xl">🎉</span>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Adding <strong>{formatNaira(extra)}</strong> in reliefs saves you{' '}
            <strong>{formatNaira(saving)}</strong> in tax per year
            ({formatNaira(saving / 12)}/month)
          </p>
        </div>
      )}
    </div>
  );
}
