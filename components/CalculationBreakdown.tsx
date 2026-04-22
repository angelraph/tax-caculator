'use client';

import { useState } from 'react';
import { TaxResults } from '@/types/tax';
import { formatNaira } from '@/lib/formatters';

const EXEMPTION = 800_000;

function CalcRow({
  op,
  label,
  value,
  note,
  bold,
  separator,
  indent,
}: {
  op?: string;
  label: string;
  value: string;
  note?: string;
  bold?: boolean;
  separator?: boolean;
  indent?: boolean;
}) {
  return (
    <>
      {separator && <div className="border-t border-dashed border-slate-200 dark:border-slate-600 my-2" />}
      <div className={`flex items-start justify-between py-1.5 ${indent ? 'pl-4' : ''}`}>
        <div className="flex items-start gap-2">
          {op && (
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-4 flex-shrink-0 mt-0.5">
              {op}
            </span>
          )}
          <div>
            <span className={`text-sm ${bold ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
              {label}
            </span>
            {note && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{note}</p>}
          </div>
        </div>
        <span className={`text-sm ml-4 flex-shrink-0 ${bold ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
          {value}
        </span>
      </div>
    </>
  );
}

export function CalculationBreakdown({ results }: { results: TaxResults }) {
  const [open, setOpen] = useState(false);
  const {
    grossAnnualIncome,
    grossMonthlyIncome,
    totalReliefs,
    taxableIncome,
    brackets,
    incomeTax,
    isExempt,
  } = results;

  const bracketLabels: Record<number, string> = {
    0.1: 'First ₦2,200,000 of taxable income',
    0.2: 'Next ₦7,000,000 of taxable income',
    0.25: 'Income above ₦9,200,000',
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🧮</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">How This Was Calculated</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Step-by-step tax breakdown</p>
          </div>
        </div>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700 pt-4">
          <div className="space-y-0">
            <CalcRow
              label="Annual Gross Income"
              note={`${formatNaira(grossMonthlyIncome)}/month`}
              value={formatNaira(grossAnnualIncome)}
            />
            <CalcRow
              op="−"
              label="Tax Exemption Threshold"
              note="First ₦800,000 of income is tax-free under 2026 NTA"
              value={formatNaira(EXEMPTION)}
            />
            {totalReliefs > 0 && (
              <CalcRow
                op="−"
                label="Total Allowances & Reliefs"
                note="Housing, pension, dependants, other deductions"
                value={formatNaira(totalReliefs)}
              />
            )}
            <CalcRow
              op="="
              label="Taxable Income"
              note="The amount your tax rate is applied to"
              value={formatNaira(taxableIncome)}
              bold
              separator
            />

            {isExempt ? (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                  🎉 Your income is fully exempt — no income tax applies.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-3 mb-1">
                  Progressive Tax Rates Applied
                </p>
                {brackets.map((b, i) => (
                  <CalcRow
                    key={i}
                    indent
                    label={bracketLabels[b.rate] ?? `${Math.round(b.rate * 100)}% bracket`}
                    note={`${formatNaira(b.taxableInBracket)} × ${Math.round(b.rate * 100)}%`}
                    value={formatNaira(b.tax)}
                  />
                ))}
                <CalcRow
                  op="="
                  label="Total Income Tax (PIT)"
                  value={formatNaira(incomeTax)}
                  bold
                  separator
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
