export type IncomeType = 'monthly' | 'annual';
export type VATCategory = 'essential' | 'non-essential';
export type UserType = 'salary' | 'freelancer' | 'business';

export interface TaxInputs {
  incomeType: IncomeType;
  grossIncome: number;
  housingRelief: number;
  dependentRelief: number;
  pensionContribution: number;
  otherDeductions: number;
  vatAmount: number;
  vatCategory: VATCategory;
  nonCompliant: boolean;
}

export interface TaxBracket {
  from: number;
  to: number;
  rate: number;
  tax: number;
  taxableInBracket: number;
}

export interface TaxResults {
  grossAnnualIncome: number;
  grossMonthlyIncome: number;
  totalReliefs: number;
  taxableIncome: number;
  incomeTax: number;
  monthlyIncomeTax: number;
  brackets: TaxBracket[];
  vatPayable: number;
  penalty: number;
  totalObligation: number;
  effectiveRate: number;
  marginalRate: number;
  isExempt: boolean;
  potentialSavings: number;
}
