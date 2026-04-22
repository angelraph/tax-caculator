'use client';

import { TaxResults } from '@/types/tax';
import { formatNaira } from '@/lib/formatters';

type RiskLevel = 'safe' | 'caution' | 'danger';

function getRisk(results: TaxResults): { level: RiskLevel; headline: string; detail: string } {
  if (results.penalty > 0) {
    return {
      level: 'danger',
      headline: '🔴 Penalty Zone — Action Required',
      detail: `A 40% late-filing penalty of ${formatNaira(results.penalty)} has been added to your tax bill. File immediately with FIRS to stop further interest accumulation.`,
    };
  }
  if (results.grossAnnualIncome > 10_000_000) {
    return {
      level: 'caution',
      headline: '🟡 High-Income Alert',
      detail: `You are in the highest tax bracket (25%). Consider consulting a certified tax consultant to optimise your reliefs and ensure full compliance.`,
    };
  }
  if (results.isExempt) {
    return {
      level: 'safe',
      headline: '🟢 Fully Exempt — You\'re Safe',
      detail: 'Your income is below the ₦800,000 exemption threshold. No income tax is due. Keep your payslips and records safely.',
    };
  }
  return {
    level: 'safe',
    headline: '🟢 Compliance Status: Good',
    detail: 'No penalties detected. Ensure your employer files your PAYE on time, and keep your receipts for any relief claims.',
  };
}

const styles: Record<RiskLevel, { card: string; badge: string }> = {
  safe: {
    card: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  },
  caution: {
    card: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  },
  danger: {
    card: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  },
};

export function ComplianceIndicator({ results }: { results: TaxResults }) {
  const { level, headline, detail } = getRisk(results);
  const s = styles[level];

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${s.card}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🛡️</span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{headline}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{detail}</p>
        </div>
      </div>
    </div>
  );
}
