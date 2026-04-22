'use client';

import { TaxResults } from '@/types/tax';
import { formatNaira } from '@/lib/formatters';

interface MiniPreviewProps {
  step: number;
  results: TaxResults;
}

export function MiniPreview({ step, results }: MiniPreviewProps) {
  const { monthlyIncomeTax, isExempt, totalReliefs, vatPayable, penalty } = results;

  let label = '';
  let value = '';
  let valueColor = 'text-emerald-700 dark:text-emerald-400';

  if (step === 1) {
    label = 'Est. monthly income tax';
    if (results.grossAnnualIncome === 0) {
      value = '—';
      valueColor = 'text-slate-400 dark:text-slate-500';
    } else if (isExempt) {
      value = 'Exempt — ₦0 tax!';
      valueColor = 'text-emerald-600 dark:text-emerald-400 font-bold';
    } else {
      value = formatNaira(monthlyIncomeTax) + '/mo';
    }
  } else if (step === 2) {
    label = 'Your reliefs save you';
    if (totalReliefs === 0) {
      value = '—';
      valueColor = 'text-slate-400 dark:text-slate-500';
    } else {
      const savedTax = totalReliefs * results.marginalRate;
      value = formatNaira(savedTax) + '/yr';
    }
  } else if (step === 3) {
    label = 'VAT on this purchase';
    if (vatPayable === 0) {
      value = '—';
      valueColor = 'text-slate-400 dark:text-slate-500';
    } else {
      value = formatNaira(vatPayable);
    }
  } else if (step === 4) {
    label = 'Non-compliance penalty';
    if (penalty === 0) {
      value = 'No penalty — great!';
      valueColor = 'text-emerald-600 dark:text-emerald-400';
    } else {
      value = '+' + formatNaira(penalty);
      valueColor = 'text-rose-600 dark:text-rose-400';
    }
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/40 px-5 py-3 flex items-center justify-between rounded-b-2xl">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-sm font-bold ${valueColor} transition-all duration-300`}>{value}</span>
    </div>
  );
}
