'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { TaxInputs, VATCategory, UserType } from '@/types/tax';
import { calculateTax } from '@/lib/taxCalculations';
import { parseNairaInput, encodeShareable, decodeShareable } from '@/lib/formatters';
import { ResultsPanel } from './ResultsPanel';
import { InputField } from './InputField';
import { StepWizard } from './StepWizard';
import { StepMeta } from './StepIndicator';
import { UserTypeSelector } from './UserTypeSelector';

// ─── Wizard step definitions ────────────────────────────────────────────────
const STEPS: StepMeta[] = [
  { id: 1, emoji: '👤', label: 'Profile',  title: 'Tell us about yourself',              subtitle: 'This helps us personalise your tax results' },
  { id: 2, emoji: '💼', label: 'Income',   title: 'How much do you earn?',               subtitle: 'Don\'t worry — this stays on your device and is never sent anywhere' },
  { id: 3, emoji: '🧾', label: 'Reliefs',  title: 'Do you have any allowances?',         subtitle: 'These are legal amounts that reduce how much tax you pay' },
  { id: 4, emoji: '🛒', label: 'Shopping', title: 'Did you buy anything major?',          subtitle: 'We\'ll calculate the sales tax (VAT) for you' },
  { id: 5, emoji: '📋', label: 'Filing',   title: 'Have you been filing your taxes?',     subtitle: 'Late filers pay an extra 40% penalty on their tax bill' },
  { id: 6, emoji: '🎯', label: 'Results',  title: 'Here is your tax picture',             subtitle: 'See exactly what you owe and personalised tips to reduce it' },
];

const DEFAULT_INPUTS: TaxInputs = {
  incomeType: 'monthly',
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

// ─── Reusable toggle button ─────────────────────────────────────────────────
function ToggleButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
        active
          ? 'bg-emerald-700 text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Step heading ───────────────────────────────────────────────────────────
function StepHeading({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 ml-9">{subtitle}</p>
    </div>
  );
}

// ─── Info box ───────────────────────────────────────────────────────────────
function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
      <p className="text-xs text-slate-500 dark:text-slate-400">{children}</p>
    </div>
  );
}

// ─── Main calculator ─────────────────────────────────────────────────────────
export function TaxCalculator() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userType, setUserType] = useState<UserType | null>(null);
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

  // ── Restore from URL param or localStorage on mount ──
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
        setCurrentStep(2); // Start at income step when loading a shared link
        return;
      }
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          inputs: TaxInputs;
          raw: Record<string, string>;
          step?: number;
          userType?: UserType | null;
        };
        setInputs(parsed.inputs);
        setRaw(parsed.raw);
        if (parsed.userType) setUserType(parsed.userType);
        // Never auto-restore to results step
        setCurrentStep(Math.min(parsed.step ?? 1, STEPS.length - 1));
      } catch {
        // ignore corrupt storage
      }
    }
  }, []);

  // ── Persist to localStorage on change ──
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs, raw, step: currentStep, userType }));
  }, [inputs, raw, currentStep, userType]);

  // ── Field setter ──
  const setField = useCallback((field: keyof TaxInputs, rawVal: string) => {
    setRaw(prev => ({ ...prev, [field]: rawVal }));
    setInputs(prev => ({ ...prev, [field]: parseNairaInput(rawVal) }));
  }, []);

  // ── Results (always live) ──
  const results = useMemo(() => calculateTax(inputs), [inputs]);

  // ── Navigation ──
  const goNext = () => setCurrentStep(s => Math.min(s + 1, STEPS.length));
  const goBack = () => setCurrentStep(s => Math.max(s - 1, 1));
  const skipReliefs = () => {
    setInputs(p => ({ ...p, housingRelief: 0, dependentRelief: 0, pensionContribution: 0, otherDeductions: 0 }));
    setRaw(p => ({ ...p, housingRelief: '', dependentRelief: '', pensionContribution: '', otherDeductions: '' }));
    setCurrentStep(4); // Skip to Shopping step
  };

  // ── Actions ──
  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setUserType(null);
    setRaw({ grossIncome: '', housingRelief: '', dependentRelief: '', pensionContribution: '', otherDeductions: '', vatAmount: '' });
    setCurrentStep(1);
    localStorage.removeItem(STORAGE_KEY);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleDownload = () => window.print();

  const handleCopyLink = async () => {
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

  // ── canProceed per step ──
  const canProceed =
    currentStep === 1 ? userType !== null :
    currentStep === 2 ? inputs.grossIncome > 0 :
    true;

  const canProceedHint =
    currentStep === 1 ? 'Please select your profile type to continue.' :
    currentStep === 2 ? 'Please enter your income amount to continue.' :
    undefined;

  // ── Step content ──────────────────────────────────────────────────────────

  const step1 = (
    <>
      <StepHeading emoji="👤" title="Tell us about yourself" subtitle="Select the option that best describes how you earn money. This personalises your results." />
      <UserTypeSelector selected={userType} onSelect={setUserType} />
    </>
  );

  const step2 = (
    <>
      <StepHeading emoji="💼" title="How much do you earn?" subtitle="Don't worry — this stays on your device and is never sent anywhere." />

      <div className="space-y-4">
        {/* Monthly / Annual toggle */}
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {userType === 'business' ? 'How do you receive your revenue?' : 'How do you receive your pay?'}
          </p>
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 gap-1">
            <ToggleButton
              label={userType === 'business' ? 'Monthly revenue' : 'Monthly salary'}
              active={inputs.incomeType === 'monthly'}
              onClick={() => setInputs(p => ({ ...p, incomeType: 'monthly' }))}
            />
            <ToggleButton
              label={userType === 'business' ? 'Yearly revenue' : 'Yearly salary'}
              active={inputs.incomeType === 'annual'}
              onClick={() => setInputs(p => ({ ...p, incomeType: 'annual' }))}
            />
          </div>
        </div>

        <InputField
          label={inputs.incomeType === 'monthly'
            ? (userType === 'business' ? 'Enter your monthly revenue' : 'Enter your monthly salary')
            : (userType === 'business' ? 'Enter your yearly revenue' : 'Enter your yearly salary')
          }
          value={raw.grossIncome}
          onChange={v => setField('grossIncome', v)}
          placeholder={inputs.incomeType === 'monthly' ? 'e.g. 150000' : 'e.g. 1800000'}
          helpText="This is the total amount your employer pays you before any deductions. Look at your payslip — it's usually the biggest number at the top."
          hint={
            inputs.incomeType === 'monthly' && inputs.grossIncome > 0
              ? `Yearly equivalent: ₦${(inputs.grossIncome * 12).toLocaleString()}`
              : inputs.incomeType === 'annual' && inputs.grossIncome > 0
              ? `Monthly equivalent: ₦${Math.round(inputs.grossIncome / 12).toLocaleString()}`
              : inputs.incomeType === 'monthly' ? 'e.g. ₦150,000 per month' : 'e.g. ₦1,800,000 per year'
          }
        />

        <InfoBox>
          <strong className="text-slate-700 dark:text-slate-300">Good news!</strong> If your yearly income is ₦800,000 or less, you pay <strong className="text-slate-700 dark:text-slate-300">zero income tax</strong> under Nigeria's 2026 Tax Act.
        </InfoBox>
      </div>
    </>
  );

  const step3 = (
    <>
      <StepHeading emoji="🧾" title="Do you have any allowances?" subtitle="Allowances are official amounts that reduce how much tax you pay. If you have none, skip this step." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="House rent or housing allowance"
          value={raw.housingRelief}
          onChange={v => setField('housingRelief', v)}
          placeholder="e.g. 300000"
          helpText="If your employer pays you a housing allowance, or you pay rent yourself, enter the total amount per year here."
          hint="Per year"
        />
        <InputField
          label="Money spent on dependants"
          value={raw.dependentRelief}
          onChange={v => setField('dependentRelief', v)}
          placeholder="e.g. 100000"
          helpText="A dependant is someone who relies on you financially — like a child, parent, or sibling. Enter the total amount you spend on them per year."
          hint="Per year"
        />
        <InputField
          label="Pension savings (RSA deductions)"
          value={raw.pensionContribution}
          onChange={v => setField('pensionContribution', v)}
          placeholder="e.g. 144000"
          helpText="This is the amount your employer deducts from your salary and puts into your pension account every month. It's usually 8% or more of your basic salary. Check your payslip."
          hint="Per year — usually 8% of basic salary"
        />
        <InputField
          label="Other official deductions"
          value={raw.otherDeductions}
          onChange={v => setField('otherDeductions', v)}
          placeholder="e.g. 50000"
          helpText="This covers things like life insurance premiums or National Housing Fund (NHF) contributions. If you don't have any, leave it empty."
          hint="e.g. life insurance, NHF"
        />
      </div>
    </>
  );

  const step4 = (
    <>
      <StepHeading emoji="🛒" title="Did you buy anything major?" subtitle="VAT is a small extra charge the government adds to the price of most things you buy. We'll calculate it for you." />

      <div className="space-y-4">
        {/* VAT category toggle */}
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">What type of purchase was it?</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Basic necessities have 0% VAT. Everything else has 7.5% VAT added by the government.</p>
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 gap-1">
            <ToggleButton
              label="Basic necessity 🥦"
              active={inputs.vatCategory === 'essential'}
              onClick={() => setInputs(p => ({ ...p, vatCategory: 'essential' as VATCategory }))}
            />
            <ToggleButton
              label="Regular purchase 📱"
              active={inputs.vatCategory === 'non-essential'}
              onClick={() => setInputs(p => ({ ...p, vatCategory: 'non-essential' as VATCategory }))}
            />
          </div>
          {inputs.vatCategory === 'essential' && (
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ✅ Food, medicine, school fees — zero VAT applies.
            </p>
          )}
          {inputs.vatCategory === 'non-essential' && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
              7.5% VAT will be added to the amount you enter.
            </p>
          )}
        </div>

        <InputField
          label="How much did you spend? (before VAT)"
          value={raw.vatAmount}
          onChange={v => setField('vatAmount', v)}
          placeholder="e.g. 50000"
          helpText="Enter the price of the item or service before any extra charges. For example, if you bought a phone for ₦50,000, enter 50000."
          hint="Leave empty if you didn't buy anything"
        />

        <InfoBox>
          If you didn't buy anything recently, just leave the amount empty and tap <strong className="text-slate-700 dark:text-slate-300">Next Step</strong> to continue.
        </InfoBox>
      </div>
    </>
  );

  const step5 = (
    <>
      <StepHeading emoji="📋" title="Have you been filing your taxes?" subtitle="Tax filing means submitting your income report to FIRS (the tax office) every year." />

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 flex-shrink-0">
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
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                I am late or have not filed my taxes
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle this on to see how a 40% penalty would affect your total tax bill
              </p>
            </div>
          </label>
        </div>

        {inputs.nonCompliant ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-xs text-rose-700 dark:text-rose-300">
              A <strong>40% penalty</strong> has been added to your income tax. Filing your taxes on time with FIRS saves you this extra charge. The deadline is usually <strong>March 31</strong> each year.
            </p>
          </div>
        ) : (
          <InfoBox>
            Most employed Nigerians have their taxes filed automatically by their employer through <strong className="text-slate-700 dark:text-slate-300">PAYE</strong>. If you're self-employed, you must file yourself before March 31 each year.
          </InfoBox>
        )}
      </div>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero tagline */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Let's calculate your 2026 tax
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          Answer 5 simple questions and we'll tell you exactly what you owe — in plain language.
        </p>
      </div>

      <StepWizard
        currentStep={currentStep}
        totalSteps={STEPS.length}
        steps={STEPS}
        onNext={goNext}
        onBack={goBack}
        onSkipReliefs={skipReliefs}
        canProceed={canProceed}
        canProceedHint={canProceedHint}
        isResultsStep={currentStep === STEPS.length}
        results={results}
      >
        {currentStep === 1 && step1}
        {currentStep === 2 && step2}
        {currentStep === 3 && step3}
        {currentStep === 4 && step4}
        {currentStep === 5 && step5}
        {currentStep === 6 && (
          <ResultsPanel
            results={results}
            inputs={inputs}
            userType={userType}
            onDownload={handleDownload}
            onCopyLink={handleCopyLink}
            onReset={handleReset}
            shareSuccess={shareSuccess}
            friendlyMode
          />
        )}
      </StepWizard>
    </main>
  );
}
