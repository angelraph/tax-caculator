import { TaxInputs, TaxResults, TaxBracket } from '@/types/tax';

const EXEMPTION_THRESHOLD = 800_000;
const VAT_RATE = 0.075;
const PENALTY_RATE = 0.40;

// Taxable income brackets (after 800k exemption is subtracted):
// These map to original income ranges: 800k–3M, 3M–10M, 10M+
const BRACKETS = [
  { limit: 2_200_000, rate: 0.10 },   // 800k–3M band
  { limit: 7_000_000, rate: 0.20 },   // 3M–10M band (7M wide)
  { limit: Infinity, rate: 0.25 },    // above 10M
];

export function calculateTax(inputs: TaxInputs): TaxResults {
  const grossAnnualIncome =
    inputs.incomeType === 'monthly' ? inputs.grossIncome * 12 : inputs.grossIncome;
  const grossMonthlyIncome = grossAnnualIncome / 12;

  const isExempt = grossAnnualIncome <= EXEMPTION_THRESHOLD;

  const totalReliefs =
    inputs.housingRelief +
    inputs.dependentRelief +
    inputs.pensionContribution +
    inputs.otherDeductions;

  const taxableIncome = isExempt
    ? 0
    : Math.max(0, grossAnnualIncome - EXEMPTION_THRESHOLD - totalReliefs);

  // Progressive tax computation with bracket breakdown
  const brackets: TaxBracket[] = [];
  let incomeTax = 0;
  let remaining = taxableIncome;
  let cumulativeFrom = 0;

  for (const bracket of BRACKETS) {
    if (remaining <= 0) break;
    const taxable = bracket.limit === Infinity ? remaining : Math.min(remaining, bracket.limit);
    const tax = taxable * bracket.rate;
    incomeTax += tax;

    brackets.push({
      from: cumulativeFrom + EXEMPTION_THRESHOLD,
      to: bracket.limit === Infinity ? Infinity : cumulativeFrom + bracket.limit + EXEMPTION_THRESHOLD,
      rate: bracket.rate,
      taxableInBracket: taxable,
      tax,
    });

    remaining -= taxable;
    cumulativeFrom += bracket.limit === Infinity ? taxable : bracket.limit;
  }

  // Marginal rate: rate of the last active bracket
  const marginalRate =
    brackets.length > 0 ? brackets[brackets.length - 1].rate : 0;

  // How much more could be saved if user maxed legal reliefs
  // We estimate: if they had ₦500k more in reliefs, what would be saved?
  const reliefSavingsRate = marginalRate;
  const potentialSavings = taxableIncome > 0 ? 500_000 * reliefSavingsRate : 0;

  const vatPayable =
    inputs.vatCategory === 'non-essential' ? inputs.vatAmount * VAT_RATE : 0;

  const penalty = inputs.nonCompliant ? incomeTax * PENALTY_RATE : 0;

  const totalObligation = incomeTax + vatPayable + penalty;
  const effectiveRate = grossAnnualIncome > 0 ? (incomeTax / grossAnnualIncome) * 100 : 0;
  const monthlyIncomeTax = incomeTax / 12;

  return {
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
    marginalRate,
    isExempt,
    potentialSavings,
  };
}

export { EXEMPTION_THRESHOLD, VAT_RATE, PENALTY_RATE };
