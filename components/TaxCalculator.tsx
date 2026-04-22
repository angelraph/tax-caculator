'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { TaxInputs, VATCategory } from '@/types/tax';
import { calculateTax } from '@/lib/taxCalculations';
import { parseNairaInput, encodeShareable, decodeShareable } from '@/lib/formatters';
import { ResultsPanel } from './ResultsPanel';
import { SmartInsights } from './SmartInsights';
import { InputField } from './InputField';

const DEFAULT_INPUTS: TaxInputs = {
  incomeType: 'annual',
  grossIncome: 0,
  housingRelief: 0,
  dependentRelief: 0,
  pensionContribution: 0,
  otherDeductions: 0,
  vatAmount: 0,
  vatCategory: 'non-essential',
  nonCompliant: false,
};

const STORAGE_KEY = 'ntc-inputs-v1';

function SectionCard({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-200">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-700 dark:text-emerald-400">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
        active
          ? 'bg-emerald-700 text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

export function TaxCalculator() {
  const [raw, setRaw] = useState<Record<string, string>>({
    grossIncome: '',
    housingRelief: '',
    dependentRelief: '',
    pensionContribution: '',
    otherDeductions: '',
    vatAmount: '',
  });
  const [inputs, setInputs] = useState<TaxInputs>(DEFAULT_INPUTS);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Load from localStorage or URL param on mount
  useEffect(() => {
    const applyDecoded = (decoded: Partial<TaxInputs>) => {
      const merged = { ...DEFAULT_INPUTS, ...decoded };
      setInputs(merged);
      setRaw({
        grossIncome: merged.grossIncome ? String(merged.grossIncome) : '',
        housingRelief: merged.housingRelief ? String(merged.housingRelief) : '',
        dependentRelief: merged.dependentRelief ? String(merged.dependentRelief) : '',
        pensionContribution: merged.pensionContribution ? String(merged.pensionContribution) : '',
        otherDeductions: merged.otherDeductions ? String(merged.otherDeductions) : '',
        vatAmount: merged.vatAmount ? String(merged.vatAmount) : '',
      });
    };

    const params = new URLSearchParams(window.location.search);
    const shared = params.get('data');
    if (shared) {
      const decoded = decodeShareable(shared);
      if (decoded) {
        applyDecoded(decoded as Partial<TaxInputs>);
        return;
      }
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { inputs: TaxInputs; raw: Record<string, string> };
        setInputs(parsed.inputs);
        setRaw(parsed.raw);
      } catch {
        // ignore corrupt storage
      }
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs, raw }));
  }, [inputs, raw]);

  const setField = useCallback((field: keyof TaxInputs, rawVal: string) => {
    setRaw(prev => ({ ...prev, [field]: rawVal }));
    setInputs(prev => ({ ...prev, [field]: parseNairaInput(rawVal) }));
  }, []);

  const results = useMemo(() => calculateTax(inputs), [inputs]);

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setRaw({
      grossIncome: '',
      housingRelief: '',
      dependentRelief: '',
      pensionContribution: '',
      otherDeductions: '',
      vatAmount: '',
    });
    localStorage.removeItem(STORAGE_KEY);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleDownload = () => {
    window.print();
  };

  const handleShare = async () => {
    const encoded = encodeShareable(inputs as unknown as Record<string, unknown>);
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Calculate Your 2026 Tax Obligation
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Based on the Nigeria Tax Act (NTA) and Nigerian Tax Administration Act (NTAA), effective January 1, 2026.
          Results update instantly as you type.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* ── LEFT: Form ── */}
        <div className="space-y-4">

          {/* Income Section */}
          <SectionCard
            title="Income Details"
            subtitle="Enter your gross income before any deductions"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            {/* Monthly / Annual Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 gap-1">
              <ToggleButton
                label="Annual Income"
                active={inputs.incomeType === 'annual'}
                onClick={() => setInputs(p => ({ ...p, incomeType: 'annual' }))}
              />
              <ToggleButton
                label="Monthly Income"
                active={inputs.incomeType === 'monthly'}
                onClick={() => setInputs(p => ({ ...p, incomeType: 'monthly' }))}
              />
            </div>

            <InputField
              label={inputs.incomeType === 'monthly' ? 'Monthly Gross Income' : 'Annual Gross Income'}
              value={raw.grossIncome}
              onChange={v => setField('grossIncome', v)}
              hint={
                inputs.incomeType === 'monthly' && inputs.grossIncome > 0
                  ? `Annual equivalent: ₦${(inputs.grossIncome * 12).toLocaleString()}`
                  : inputs.incomeType === 'annual' && inputs.grossIncome > 0
                  ? `Monthly equivalent: ₦${Math.round(inputs.grossIncome / 12).toLocaleString()}`
                  : undefined
              }
            />

            {/* Exemption reminder */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Annual income up to <strong className="text-slate-700 dark:text-slate-300">₦800,000</strong> is fully exempt from income tax under the 2026 NTA.
              </p>
            </div>
          </SectionCard>

          {/* Reliefs Section */}
          <SectionCard
            title="Reliefs & Deductions"
            subtitle="Allowable deductions reduce your taxable income"
            defaultOpen={false}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Housing Relief"
                value={raw.housingRelief}
                onChange={v => setField('housingRelief', v)}
                hint="Rent or mortgage-related allowance"
              />
              <InputField
                label="Dependent Relief"
                value={raw.dependentRelief}
                onChange={v => setField('dependentRelief', v)}
                hint="Total relief for qualifying dependents"
              />
              <InputField
                label="Pension Contribution"
                value={raw.pensionContribution}
                onChange={v => setField('pensionContribution', v)}
                hint="Minimum 8% of basic salary is deductible"
              />
              <InputField
                label="Other Deductions"
                value={raw.otherDeductions}
                onChange={v => setField('otherDeductions', v)}
                hint="Life assurance, NHF, other allowable deductions"
              />
            </div>
          </SectionCard>

          {/* VAT Section */}
          <SectionCard
            title="VAT on Purchases"
            subtitle="Estimate VAT on goods or services consumed"
            defaultOpen={false}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            }
          >
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 gap-1 mb-2">
              <ToggleButton
                label="Essential (0% VAT)"
                active={inputs.vatCategory === 'essential'}
                onClick={() => setInputs(p => ({ ...p, vatCategory: 'essential' as VATCategory }))}
              />
              <ToggleButton
                label="Non-Essential (7.5%)"
                active={inputs.vatCategory === 'non-essential'}
                onClick={() => setInputs(p => ({ ...p, vatCategory: 'non-essential' as VATCategory }))}
              />
            </div>
            <InputField
              label="Value of Goods / Services"
              value={raw.vatAmount}
              onChange={v => setField('vatAmount', v)}
              hint={
                inputs.vatCategory === 'essential'
                  ? 'Essential goods (food, healthcare, education) — zero-rated VAT'
                  : 'VAT of 7.5% will be applied to this amount'
              }
            />
          </SectionCard>

          {/* Compliance Section */}
          <SectionCard
            title="Compliance Status"
            subtitle="Non-compliance attracts a 40% penalty on tax due"
            defaultOpen={false}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            }
          >
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={inputs.nonCompliant}
                  onChange={e => setInputs(p => ({ ...p, nonCompliant: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 rounded-full bg-slate-200 dark:bg-slate-600 peer-checked:bg-rose-500 transition-colors duration-200" />
                <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Non-compliant / Late filing
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Toggle to see the effect of a 40% FIRS penalty on your total obligation
                </p>
              </div>
            </label>
            {inputs.nonCompliant && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-rose-500 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  A 40% penalty has been added to your income tax obligation.
                </p>
              </div>
            )}
          </SectionCard>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Reset All Fields
          </button>

          {/* Smart Insights */}
          <SmartInsights results={results} />

          {/* Legal disclaimer */}
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center pb-4">
            This calculator provides estimates based on publicly available 2026 NTA/NTAA guidelines. It is not professional tax advice. Consult a certified tax consultant for binding assessments.
          </p>
        </div>

        {/* ── RIGHT: Results (sticky on desktop) ── */}
        <div className="lg:sticky lg:top-24">
          <ResultsPanel
            results={results}
            onDownload={handleDownload}
            onShare={handleShare}
            shareSuccess={shareSuccess}
          />
        </div>
      </div>
    </main>
  );
}
