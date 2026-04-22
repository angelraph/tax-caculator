'use client';

export interface StepMeta {
  id: number;
  emoji: string;
  label: string;
  title: string;
  subtitle: string;
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: StepMeta[];
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  const progressPct = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const current = steps.find(s => s.id === currentStep);

  return (
    <div className="mb-6">
      {/* Mobile: bar + step label only */}
      <div className="sm:hidden mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {current?.emoji} {current?.title}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Desktop: chips row */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {Math.round(progressPct)}% complete
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {/* Chips */}
        <div className="flex items-center">
          {steps.map((step, i) => {
            const isDone = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isUpcoming = step.id > currentStep;
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-10 h-10 bg-emerald-700 ring-2 ring-emerald-300 dark:ring-emerald-600 ring-offset-2 dark:ring-offset-slate-800'
                        : isDone
                        ? 'w-8 h-8 bg-emerald-600'
                        : 'w-8 h-8 bg-slate-100 dark:bg-slate-700'
                    }`}
                  >
                    {isDone ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <span className={`text-base leading-none ${isUpcoming ? 'opacity-40' : ''}`}>
                        {step.emoji}
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-1 text-[10px] font-medium text-center leading-tight max-w-[56px] ${
                      isActive
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : isDone
                        ? 'text-emerald-600 dark:text-emerald-500'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 mb-4 transition-colors duration-500 ${
                      step.id < currentStep
                        ? 'bg-emerald-400 dark:bg-emerald-600'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
