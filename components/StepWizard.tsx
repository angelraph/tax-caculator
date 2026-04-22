'use client';

import { StepIndicator, StepMeta } from './StepIndicator';
import { MiniPreview } from './MiniPreview';
import { TaxResults } from '@/types/tax';

interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
  steps: StepMeta[];
  onNext: () => void;
  onBack: () => void;
  onSkipReliefs: () => void;
  canProceed: boolean;
  isResultsStep: boolean;
  results: TaxResults;
  children: React.ReactNode;
}

export function StepWizard({
  currentStep,
  totalSteps,
  steps,
  onNext,
  onBack,
  onSkipReliefs,
  canProceed,
  isResultsStep,
  results,
  children,
}: StepWizardProps) {
  const isFirstStep = currentStep === 1;
  const isLastInputStep = currentStep === 4;
  const isReliefsStep = currentStep === 2;
  const nextLabel = isLastInputStep ? 'See My Results →' : 'Next Step →';

  return (
    <div className="space-y-4">
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} steps={steps} />

      {/* Step content card */}
      <div className={`rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-200 ${isResultsStep ? '' : ''}`}>
        <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
          {children}
        </div>

        {/* Mini preview strip — only on input steps */}
        {!isResultsStep && (
          <MiniPreview step={currentStep} results={results} />
        )}
      </div>

      {/* Navigation buttons — hidden on results step */}
      {!isResultsStep && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Back button */}
            {!isFirstStep ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div className="flex-shrink-0 w-[88px]" /> /* spacer keeps Next right-aligned */
            )}

            {/* Reliefs skip button */}
            {isReliefsStep && (
              <button
                onClick={onSkipReliefs}
                className="flex-1 text-center text-sm text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2 transition-colors py-3"
              >
                I have none — skip this step
              </button>
            )}

            {/* Spacer on non-reliefs steps to push Next right */}
            {!isReliefsStep && <div className="flex-1" />}

            {/* Next button */}
            <button
              onClick={canProceed ? onNext : undefined}
              aria-disabled={!canProceed}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                canProceed
                  ? 'bg-emerald-700 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-900/20'
                  : 'bg-emerald-700/40 text-white/60 cursor-not-allowed'
              }`}
            >
              {nextLabel}
            </button>
          </div>

          {/* Validation hint */}
          {!canProceed && (
            <p className="text-xs text-rose-500 dark:text-rose-400 text-right">
              Please enter your income amount to continue.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
