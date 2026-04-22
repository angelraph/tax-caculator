'use client';

import { TaxResults } from '@/types/tax';
import { formatNaira, formatPercent } from '@/lib/formatters';

interface ResultsPanelProps {
  results: TaxResults;
  onDownload: () => void;
  onShare: () => void;
  shareSuccess: boolean;
}

function ResultRow({
  label,
  value,
  sub,
  highlight,
  muted,
  border,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  muted?: boolean;
  border?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between py-3 ${
        border ? 'border-t border-slate-200 dark:border-slate-700' : ''
      } ${highlight ? 'mt-1' : ''}`}
    >
      <span
        className={`text-sm ${
          muted
            ? 'text-slate-400 dark:text-slate-500'
            : highlight
            ? 'font-semibold text-slate-900 dark:text-white'
            : 'text-slate-600 dark:text-slate-400'
        }`}
      >
        {label}
      </span>
      <div className="text-right">
        <span
          className={`text-sm font-semibold ${
            highlight
              ? 'text-lg text-emerald-700 dark:text-emerald-400'
              : muted
              ? 'text-slate-400 dark:text-slate-500'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {value}
        </span>
        {sub && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function BracketBar({ rate, taxable, max }: { rate: number; taxable: number; max: number }) {
  const pct = max > 0 ? Math.min((taxable / max) * 100, 100) : 0;
  const colors: Record<number, string> = {
    0.1: 'bg-sky-400',
    0.2: 'bg-amber-400',
    0.25: 'bg-rose-400',
  };
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-slate-500 dark:text-slate-400">{Math.round(rate * 100)}%</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[rate] ?? 'bg-emerald-400'} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-24 text-right text-slate-500 dark:text-slate-400">
        {formatNaira(taxable, true)}
      </span>
    </div>
  );
}

export function ResultsPanel({ results, onDownload, onShare, shareSuccess }: ResultsPanelProps) {
  const {
    grossAnnualIncome,
    grossMonthlyIncome,
    totalReliefs,
    taxableIncome,
    incomeTax,
    monthlyIncomeTax,
    brackets,
    vatPayable,
    penalty,
    totalObligation,
    effectiveRate,
    isExempt,
  } = results;

  const maxTaxable = Math.max(...brackets.map(b => b.taxableInBracket), 1);

  return (
    <div className="space-y-4 print:space-y-3">
      {/* Summary Card */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-5 text-white shadow-xl shadow-emerald-900/20 print:shadow-none">
        <p className="text-emerald-200 text-xs font-medium uppercase tracking-widest mb-1">Total Tax Obligation</p>
        <p className="text-4xl font-bold tracking-tight">{formatNaira(totalObligation)}</p>
        <p className="text-emerald-200 text-sm mt-1">
          {formatNaira(totalObligation / 12)}/month
        </p>
        <div className="mt-4 pt-4 border-t border-emerald-600 grid grid-cols-2 gap-4">
          <div>
            <p className="text-emerald-300 text-xs">Effective Rate</p>
            <p className="text-xl font-semibold">{formatPercent(effectiveRate)}</p>
          </div>
          <div>
            <p className="text-emerald-300 text-xs">Annual Income</p>
            <p className="text-xl font-semibold">{formatNaira(grossAnnualIncome, true)}</p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Breakdown</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          <ResultRow
            label="Gross Annual Income"
            value={formatNaira(grossAnnualIncome)}
            sub={`${formatNaira(grossMonthlyIncome)}/mo`}
          />
          <ResultRow
            label="Total Reliefs & Deductions"
            value={`– ${formatNaira(totalReliefs)}`}
            muted={totalReliefs === 0}
          />
          <ResultRow label="Taxable Income" value={formatNaira(taxableIncome)} />
          <ResultRow
            label="Income Tax (PIT)"
            value={formatNaira(incomeTax)}
            sub={`${formatNaira(monthlyIncomeTax)}/mo`}
          />
          {vatPayable > 0 && (
            <ResultRow label="VAT Payable (7.5%)" value={formatNaira(vatPayable)} />
          )}
          {penalty > 0 && (
            <ResultRow
              label="Non-Compliance Penalty (40%)"
              value={formatNaira(penalty)}
            />
          )}
          <ResultRow
            label="Total Obligation"
            value={formatNaira(totalObligation)}
            sub={`${formatNaira(totalObligation / 12)}/mo`}
            highlight
            border
          />
        </div>
      </div>

      {/* Tax Bracket Visualizer */}
      {!isExempt && brackets.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm print:hidden">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Tax Bracket Utilization
          </h3>
          <div className="space-y-2.5">
            {brackets.map((b, i) => (
              <BracketBar key={i} rate={b.rate} taxable={b.taxableInBracket} max={maxTaxable} />
            ))}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Width shows relative taxable amount per bracket
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 print:hidden">
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </button>
        <button
          onClick={onShare}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            shareSuccess
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
              : 'border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {shareSuccess ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Link Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Share Results
            </>
          )}
        </button>
      </div>
    </div>
  );
}
