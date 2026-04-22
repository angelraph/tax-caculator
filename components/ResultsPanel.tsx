'use client';

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { TaxResults, TaxInputs, UserType } from '@/types/tax';
import { formatNaira, formatPercent } from '@/lib/formatters';
import { SmartInsights } from './SmartInsights';
import { CalculationBreakdown } from './CalculationBreakdown';
import { IncomeBar } from './IncomeBar';
import { TaxSavingsSimulator } from './TaxSavingsSimulator';
import { ComplianceIndicator } from './ComplianceIndicator';
import { NextSteps } from './NextSteps';
import { ShareActions } from './ShareActions';
import { AnimatedNumber } from './AnimatedNumber';
import { DonutChart } from './DonutChart';
import { TrustSection } from './TrustSection';

// Stable format functions (module-level, no re-renders)
const nairaFmt = (n: number) => formatNaira(n);
const nairaFmtShort = (n: number) => formatNaira(n, true);
const monthlyFmt = (n: number) => `${formatNaira(n)}/mo`;
const rateFmt = (n: number) => `${n.toFixed(1)}%`;

interface ResultsPanelProps {
  results: TaxResults;
  inputs: TaxInputs;
  userType: UserType | null;
  onDownload: () => void;
  onCopyLink: () => void;
  onReset: () => void;
  shareSuccess: boolean;
  friendlyMode?: boolean; // kept for backwards-compat, not used (replaced by internal toggle)
}

// Framer Motion variants factory
function fadeUp(delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay } },
  };
}

function ResultRow({
  label, value, sub, highlight, muted, border,
}: {
  label: string; value: string; sub?: string;
  highlight?: boolean; muted?: boolean; border?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between py-3 ${border ? 'border-t border-slate-200 dark:border-slate-700' : ''}`}>
      <span className={`text-sm ${muted ? 'text-slate-400 dark:text-slate-500' : highlight ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
        {label}
      </span>
      <div className="text-right">
        <span className={`text-sm font-semibold ${highlight ? 'text-lg text-emerald-700 dark:text-emerald-400' : muted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
          {value}
        </span>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function BracketBar({ rate, taxable, max }: { rate: number; taxable: number; max: number }) {
  const pct = max > 0 ? Math.min((taxable / max) * 100, 100) : 0;
  const colors: Record<number, string> = { 0.1: 'bg-sky-400', 0.2: 'bg-amber-400', 0.25: 'bg-rose-400' };
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-slate-500 dark:text-slate-400">{Math.round(rate * 100)}%</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full ${colors[rate] ?? 'bg-emerald-400'} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-24 text-right text-slate-500 dark:text-slate-400">{formatNaira(taxable, true)}</span>
    </div>
  );
}

export function ResultsPanel({
  results, inputs, userType, onDownload, onCopyLink, onReset, shareSuccess,
}: ResultsPanelProps) {
  const [detailed, setDetailed] = useState(false);

  const {
    grossAnnualIncome, grossMonthlyIncome, totalReliefs, taxableIncome,
    incomeTax, monthlyIncomeTax, brackets, vatPayable, penalty,
    totalObligation, effectiveRate, isExempt,
  } = results;

  const maxTaxable = Math.max(...brackets.map(b => b.taxableInBracket), 1);

  const labels = detailed
    ? {
        breakdown: 'Tax Breakdown',
        grossIncome: 'Gross Annual Income',
        reliefs: 'Total Reliefs & Deductions',
        taxable: 'Taxable Income',
        incomeTax: 'Income Tax (PIT)',
        vat: 'VAT Payable (7.5%)',
        penalty: 'Non-Compliance Penalty (40%)',
        total: 'Total Tax Obligation',
        brackets: 'Tax Bracket Utilisation',
        bracketsNote: 'Bar width reflects relative taxable amount per bracket.',
      }
    : {
        breakdown: 'How Your Tax Was Calculated',
        grossIncome: 'Your Total Income',
        reliefs: 'Minus Allowances',
        taxable: 'Income After Allowances',
        incomeTax: 'Estimated Income Tax',
        vat: 'Sales Tax (VAT)',
        penalty: 'Late-Filing Penalty',
        total: 'Total You Owe This Year',
        brackets: 'Which Tax Band Applies to You',
        bracketsNote: 'Nigeria taxes different slices of your income at different rates.',
      };

  return (
    <div className="space-y-4 print:space-y-3">

      {/* ── Summary Card ───────────────────────────────────────────────── */}
      <motion.div variants={fadeUp(0)} initial="hidden" animate="visible">
        {isExempt ? (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white shadow-xl shadow-emerald-900/20 print:shadow-none">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">🎉</span>
              <div>
                <p className="text-emerald-100 text-xs font-medium uppercase tracking-widest">Great News!</p>
                <p className="text-2xl font-bold leading-tight">You pay ZERO income tax!</p>
              </div>
            </div>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Your yearly income of <strong>{formatNaira(grossAnnualIncome)}</strong> is below the ₦800,000 exemption threshold. Under Nigeria's 2026 Tax Act, you owe no income tax.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-5 text-white shadow-xl shadow-emerald-900/20 print:shadow-none">
            <p className="text-emerald-200 text-xs font-medium uppercase tracking-widest mb-1">
              Estimated Tax for 2026
            </p>
            <AnimatedNumber value={totalObligation} format={nairaFmt} className="text-4xl font-bold tracking-tight block" />
            <p className="text-emerald-200 text-sm mt-1">
              That's about{' '}
              <AnimatedNumber value={totalObligation / 12} format={nairaFmt} className="font-semibold" />
              {' '}every month
            </p>
            <div className="mt-4 pt-4 border-t border-emerald-600 grid grid-cols-2 gap-4">
              <div>
                <p className="text-emerald-300 text-xs">Effective tax rate</p>
                <AnimatedNumber value={effectiveRate} format={rateFmt} className="text-xl font-semibold" />
              </div>
              <div>
                <p className="text-emerald-300 text-xs">Your annual income</p>
                <AnimatedNumber value={grossAnnualIncome} format={nairaFmtShort} className="text-xl font-semibold" />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Simple / Detailed Toggle ────────────────────────────────────── */}
      <motion.div variants={fadeUp(0.07)} initial="hidden" animate="visible" className="flex justify-center print:hidden">
        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-full p-1 gap-0.5">
          <button
            onClick={() => setDetailed(false)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${!detailed ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Summary
          </button>
          <button
            onClick={() => setDetailed(true)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${detailed ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Detailed
          </button>
        </div>
      </motion.div>

      {/* ── Donut Chart ─────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp(0.13)} initial="hidden" animate="visible">
        <DonutChart results={results} />
      </motion.div>

      {/* ── Detailed sections (animated in/out) ─────────────────────────── */}
      <AnimatePresence>
        {detailed && (
          <motion.div
            key="detailed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 overflow-hidden"
          >
            {/* Income bar */}
            <IncomeBar results={results} />

            {/* Breakdown table */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{labels.breakdown}</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                <ResultRow label={labels.grossIncome} value={formatNaira(grossAnnualIncome)} sub={`${formatNaira(grossMonthlyIncome)}/mo`} />
                <ResultRow label={labels.reliefs} value={`– ${formatNaira(totalReliefs)}`} muted={totalReliefs === 0} />
                <ResultRow label={labels.taxable} value={formatNaira(taxableIncome)} />
                <ResultRow label={labels.incomeTax} value={formatNaira(incomeTax)} sub={`${formatNaira(monthlyIncomeTax)}/mo`} />
                {vatPayable > 0 && <ResultRow label={labels.vat} value={formatNaira(vatPayable)} />}
                {penalty > 0 && <ResultRow label={labels.penalty} value={formatNaira(penalty)} />}
                <ResultRow label={labels.total} value={formatNaira(totalObligation)} sub={`${formatNaira(totalObligation / 12)}/mo`} highlight border />
              </div>
            </div>

            {/* Tax bracket visualizer */}
            {!isExempt && brackets.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm print:hidden">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{labels.brackets}</h3>
                <div className="space-y-2.5">
                  {brackets.map((b, i) => (
                    <BracketBar key={i} rate={b.rate} taxable={b.taxableInBracket} max={maxTaxable} />
                  ))}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">{labels.bracketsNote}</p>
              </div>
            )}

            {/* Step-by-step calculation */}
            <CalculationBreakdown results={results} />

            {/* Tax Savings Simulator */}
            <TaxSavingsSimulator inputs={inputs} currentResults={results} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Compliance Risk ─────────────────────────────────────────────── */}
      <motion.div variants={fadeUp(0.18)} initial="hidden" animate="visible">
        <ComplianceIndicator results={results} />
      </motion.div>

      {/* ── Smart Insights ──────────────────────────────────────────────── */}
      <motion.div variants={fadeUp(0.22)} initial="hidden" animate="visible">
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm print:hidden">
          <SmartInsights results={results} userType={userType} titleOverride="Tips for You" />
        </div>
      </motion.div>

      {/* ── What To Do Next ─────────────────────────────────────────────── */}
      <motion.div variants={fadeUp(0.26)} initial="hidden" animate="visible">
        <NextSteps userType={userType} results={results} />
      </motion.div>

      {/* ── Share ───────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp(0.3)} initial="hidden" animate="visible">
        <ShareActions results={results} inputs={inputs} shareSuccess={shareSuccess} onCopyLink={onCopyLink} />
      </motion.div>

      {/* ── Trust Section ───────────────────────────────────────────────── */}
      <motion.div variants={fadeUp(0.33)} initial="hidden" animate="visible">
        <TrustSection />
      </motion.div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp(0.36)} initial="hidden" animate="visible" className="flex flex-col gap-2 print:hidden">
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </button>
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-dashed border-slate-200 dark:border-slate-600 transition-colors"
        >
          ↩ Start Over
        </button>
      </motion.div>

    </div>
  );
}
