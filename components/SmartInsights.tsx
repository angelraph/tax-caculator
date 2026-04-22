'use client';

import { TaxResults, UserType } from '@/types/tax';
import { formatNaira } from '@/lib/formatters';

interface Insight {
  type: 'success' | 'info' | 'warning' | 'tip';
  icon: string;
  title: string;
  body: string;
}

const styles: Record<Insight['type'], string> = {
  success:
    'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
  info: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300',
  warning:
    'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
  tip: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-300',
};

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div
      className={`flex gap-3 p-4 rounded-xl border ${styles[insight.type]} transition-all duration-300`}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{insight.icon}</span>
      <div>
        <p className="text-sm font-semibold">{insight.title}</p>
        <p className="text-sm opacity-80 mt-0.5">{insight.body}</p>
      </div>
    </div>
  );
}

export function SmartInsights({ results, userType, titleOverride }: { results: TaxResults; userType?: UserType | null; titleOverride?: string }) {
  const {
    grossAnnualIncome,
    isExempt,
    incomeTax,
    totalReliefs,
    taxableIncome,
    potentialSavings,
    effectiveRate,
    marginalRate,
    penalty,
    vatPayable,
  } = results;

  const insights: Insight[] = [];

  if (grossAnnualIncome === 0) {
    insights.push({
      type: 'info',
      icon: '💡',
      title: 'Enter your income to begin',
      body: 'Fill in your annual or monthly gross income to see your tax estimate in real-time.',
    });
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {titleOverride ?? 'Smart Insights'}
        </h2>
        {insights.map((ins, i) => (
          <InsightCard key={i} insight={ins} />
        ))}
      </div>
    );
  }

  if (isExempt) {
    insights.push({
      type: 'success',
      icon: '🎉',
      title: 'You qualify for full tax exemption',
      body: `Your annual income of ${formatNaira(grossAnnualIncome)} is below the ₦800,000 exemption threshold under the 2026 NTA. No income tax is due.`,
    });
  }

  if (!isExempt && totalReliefs === 0 && taxableIncome > 0) {
    insights.push({
      type: 'tip',
      icon: '💰',
      title: `Save up to ${formatNaira(potentialSavings)} with reliefs`,
      body: `You have not claimed any reliefs. Adding ₦500k in housing, pension, or dependent reliefs could save you approximately ${formatNaira(potentialSavings)} at your ${Math.round(marginalRate * 100)}% marginal rate.`,
    });
  }

  if (!isExempt && totalReliefs > 0 && taxableIncome > 0) {
    insights.push({
      type: 'success',
      icon: '✅',
      title: `Reliefs applied: ${formatNaira(totalReliefs)} deducted`,
      body: `Your declared reliefs have reduced your taxable base. Consider maximising pension contributions (8% of basic) for further savings.`,
    });
  }

  if (effectiveRate < marginalRate * 100 && !isExempt) {
    insights.push({
      type: 'info',
      icon: '📊',
      title: `Effective rate (${effectiveRate.toFixed(1)}%) is lower than marginal rate (${Math.round(marginalRate * 100)}%)`,
      body: `This is normal under a progressive tax system — only the income above each threshold is taxed at the higher rate.`,
    });
  }

  if (grossAnnualIncome > 10_000_000) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'High-income bracket — consider professional tax planning',
      body: `At this income level, a certified tax consultant can help structure your income and reliefs to optimise your obligation under the 2026 NTA.`,
    });
  }

  if (vatPayable > 0) {
    insights.push({
      type: 'info',
      icon: '🛒',
      title: `VAT of ${formatNaira(vatPayable)} applies to non-essential purchases`,
      body: `Essential goods (food, healthcare, education) are VAT-exempt. Only non-essential goods attract the 7.5% VAT rate.`,
    });
  }

  if (penalty > 0) {
    insights.push({
      type: 'warning',
      icon: '🚨',
      title: `Non-compliance penalty adds ${formatNaira(penalty)}`,
      body: `A 40% penalty has been added to your income tax. Filing and paying on time avoids this. FIRS deadline is typically March 31 each year.`,
    });
  }

  if (!isExempt && incomeTax > 0 && penalty === 0) {
    insights.push({
      type: 'tip',
      icon: '📅',
      title: 'File on time to avoid penalties',
      body: `Your PAYE or self-assessment return must be filed by March 31, 2027 for the 2026 tax year. Late filing attracts a 40% penalty on tax due.`,
    });
  }

  // User-type specific insights
  if (userType === 'salary') {
    insights.push({
      type: 'info',
      icon: '🏢',
      title: 'Verify your PAYE deductions with HR',
      body: 'Ask your payroll or HR team to confirm the monthly PAYE amount deducted from your salary matches this estimate. Discrepancies should be corrected before year-end filing.',
    });
  } else if (userType === 'freelancer') {
    insights.push({
      type: 'warning',
      icon: '📝',
      title: 'You must file your own self-assessment return',
      body: 'Freelancers and self-employed individuals are fully responsible for filing their own annual returns by March 31. Your clients do not deduct tax on your behalf — this is your responsibility.',
    });
  } else if (userType === 'business') {
    insights.push({
      type: 'info',
      icon: '🏛️',
      title: 'Company income is taxed separately under CIT',
      body: 'If your business is incorporated, it pays Company Income Tax (CIT) at 20–30% on its profits — separate from your personal income tax shown here. Work with an accountant to separate the two.',
    });
  }

  return (
    <div className="space-y-3 print:hidden">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        Smart Insights
      </h2>
      {insights.map((ins, i) => (
        <InsightCard key={i} insight={ins} />
      ))}
    </div>
  );
}
