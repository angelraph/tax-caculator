'use client';

import { UserType, TaxResults } from '@/types/tax';

interface Step {
  icon: string;
  action: string;
  detail: string;
}

function getSteps(userType: UserType | null, results: TaxResults): Step[] {
  const steps: Step[] = [];

  // Universal steps based on tax situation
  if (results.isExempt) {
    steps.push({
      icon: '📁',
      action: 'Keep your payslips and income records',
      detail: 'Even though you owe no tax, always keep at least 3 years of income records in case FIRS requests them.',
    });
  }

  if (results.penalty > 0) {
    steps.push({
      icon: '🚨',
      action: 'File your tax return immediately',
      detail: 'Visit the FIRS self-service portal (taxpromax.firs.gov.ng) or your nearest FIRS office to file and pay as soon as possible.',
    });
  }

  if (!results.isExempt && results.penalty === 0) {
    steps.push({
      icon: '📅',
      action: 'Note the filing deadline: March 31, 2027',
      detail: 'For the 2026 tax year, all returns must be filed before March 31, 2027 to avoid the 40% late-filing penalty.',
    });
  }

  if (results.totalReliefs === 0 && !results.isExempt) {
    steps.push({
      icon: '💰',
      action: 'Claim your allowable reliefs to reduce tax',
      detail: 'You haven\'t claimed any reliefs. Housing allowance, pension contributions, and dependent relief are all legally deductible.',
    });
  }

  if (results.grossAnnualIncome > 5_000_000) {
    steps.push({
      icon: '🤝',
      action: 'Consult a certified tax consultant',
      detail: 'At your income level, professional tax planning can save you significantly more than the consultant\'s fee.',
    });
  }

  // User-type specific steps
  if (userType === 'salary') {
    steps.push({
      icon: '🏢',
      action: 'Confirm PAYE deductions with your HR/payroll team',
      detail: 'Ask your HR department for a copy of your P60 or tax deduction schedule to verify the right amount is being remitted to FIRS.',
    });
    steps.push({
      icon: '📄',
      action: 'Request a Tax Clearance Certificate (TCC)',
      detail: 'A TCC is required for major contracts, visa applications, and government dealings. Apply through your employer or FIRS directly.',
    });
  } else if (userType === 'freelancer') {
    steps.push({
      icon: '🔖',
      action: 'Register for a Tax Identification Number (TIN)',
      detail: 'Every self-employed person must have a TIN. Register for free at taxpromax.firs.gov.ng or any FIRS office.',
    });
    steps.push({
      icon: '🧾',
      action: 'Keep receipts for all business expenses',
      detail: 'Internet bills, equipment, software subscriptions, and professional development costs may all be deductible from your income.',
    });
    steps.push({
      icon: '📊',
      action: 'File a self-assessment return before March 31',
      detail: 'Unlike salaried employees, freelancers must file their own annual returns. Use FIRS TaxPro-Max or hire an accountant.',
    });
  } else if (userType === 'business') {
    steps.push({
      icon: '🏢',
      action: 'Separate personal and business income',
      detail: 'Open a dedicated business account and pay yourself a defined salary. This makes tax filing cleaner and reduces audit risk.',
    });
    steps.push({
      icon: '📋',
      action: 'File Company Income Tax (CIT) separately',
      detail: 'If your business is incorporated, it pays CIT (20–30% on profits) separately from your personal income tax.',
    });
    steps.push({
      icon: '🤝',
      action: 'Register with CAC and get your RC number',
      detail: 'Ensure your business is properly registered with the Corporate Affairs Commission. This is required for formal tax filing.',
    });
  }

  return steps.slice(0, 5); // Show max 5 steps
}

export function NextSteps({ userType, results }: { userType: UserType | null; results: TaxResults }) {
  const steps = getSteps(userType, results);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🚀</span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">What Should You Do Next?</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Personalised action steps for your situation</p>
        </div>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
            <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.action}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
