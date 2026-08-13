export type TaxYear = "2024" | "2025";

export const TAX_YEARS: TaxYear[] = ["2024", "2025"];

/** Progressive income tax scale: [bracket ceiling (Infinity for top), rate] */
export const INCOME_SCALE: Record<TaxYear, { upTo: number; rate: number }[]> = {
  "2024": [
    { upTo: 10_000, rate: 0.09 },
    { upTo: 20_000, rate: 0.22 },
    { upTo: 30_000, rate: 0.28 },
    { upTo: 40_000, rate: 0.36 },
    { upTo: Infinity, rate: 0.44 },
  ],
  "2025": [
    { upTo: 10_000, rate: 0.09 },
    { upTo: 20_000, rate: 0.22 },
    { upTo: 30_000, rate: 0.28 },
    { upTo: 40_000, rate: 0.36 },
    { upTo: Infinity, rate: 0.44 },
  ],
};

export interface BracketSlice {
  from: number;
  upTo: number;
  rate: number;
  taxable: number;
  tax: number;
}

export function progressiveTax(
  income: number,
  year: TaxYear
): { slices: BracketSlice[]; total: number } {
  const scale = INCOME_SCALE[year];
  const slices: BracketSlice[] = [];
  let remaining = Math.max(0, income);
  let from = 0;
  let total = 0;

  for (const band of scale) {
    if (remaining <= 0) break;
    const width = Math.min(remaining, band.upTo - from);
    const tax = width * band.rate;
    slices.push({ from, upTo: band.upTo, rate: band.rate, taxable: width, tax });
    remaining -= width;
    from = band.upTo;
    total += tax;
  }

  return { slices, total };
}

/**
 * Tax credit (μείωση φόρου) for salaried workers / pensioners.
 * €777 up to €10k, reduced by €20 per €1,000 above €10k (phases out at ~€48,870).
 */
export function wageTaxCredit(income: number): number {
  const base = 777;
  if (income <= 10_000) return base;
  const excessThousands = Math.floor((income - 10_000) / 1000);
  return Math.max(0, base - excessThousands * 20);
}

export interface IncomeTaxInput {
  year: TaxYear;
  income: number;
  incomeType: "wage" | "business" | "rent";
  children: number;
}

export interface IncomeTaxResult {
  grossTax: number;
  credit: number;
  effectiveRate: number;
  netTax: number;
  slices: BracketSlice[];
}

export function incomeTax(input: IncomeTaxInput): IncomeTaxResult {
  const { year, income, incomeType, children } = input;
  const { slices, total } = progressiveTax(income, year);

  let credit = 0;
  if (incomeType === "wage") {
    credit = wageTaxCredit(income) + children * 60;
  }

  const netTax = Math.max(0, total - credit);
  return {
    grossTax: total,
    credit,
    effectiveRate: income > 0 ? (netTax / income) * 100 : 0,
    netTax,
    slices,
  };
}

/** Minimum wage (gross, annualised ×14) used as the base for self-employed deemed income. */
export const MIN_WAGE_ANNUAL: Record<TaxYear, number> = {
  "2024": 11_620, // 830 × 14
  "2025": 12_320, // 880 × 14
};

/**
 * Self-employed minimum deemed income (ελάχιστο τεκμαρτό εισόδημα).
 * Returns the deemed taxable income for the business-owner given years of activity.
 */
export function deemedIncome(yearsActive: number, year: TaxYear): number {
  const base = MIN_WAGE_ANNUAL[year];
  if (yearsActive < 4) return 0; // exempt from deemed-income system
  if (yearsActive === 4) return base * (1 - 0.67);
  if (yearsActive === 5) return base * (1 - 0.33);
  if (yearsActive <= 6) return base;
  if (yearsActive <= 9) return base * 1.1;
  if (yearsActive <= 12) return base * 1.2;
  return base * 1.3;
}

export interface SelfEmployedInput {
  year: TaxYear;
  yearsActive: number;
  declaredProfit: number;
  grossRevenue: number;
  payroll: number;
}

export interface SelfEmployedResult {
  deemed: number;
  finalTaxable: number;
  deemedApplies: boolean;
  tax: number;
  advance: number;
  totalDue: number;
  effectiveRate: number;
}

/** Advance tax (προκαταβολή φόρου) for business income: 100% of the current-year tax. */
const BUSINESS_ADVANCE_RATE = 1.0;

export function selfEmployedTax(input: SelfEmployedInput): SelfEmployedResult {
  const { year, yearsActive, declaredProfit, grossRevenue, payroll } = input;

  const baseDeemed = deemedIncome(yearsActive, year);

  // Payroll surcharge: +10% of payroll, capped at €15,000.
  const payrollSurcharge = Math.min(payroll * 0.1, 15_000);

  // Turnover surcharge: +5% of revenue above the sector average is simplified here
  // as +5% above 1.5× the deemed base. Kept configurable-free for friendliness.
  const turnoverSurcharge =
    grossRevenue > baseDeemed * 1.5 ? (grossRevenue - baseDeemed * 1.5) * 0.05 : 0;

  const deemed =
    baseDeemed > 0 ? Math.min(baseDeemed + payrollSurcharge + turnoverSurcharge, 50_000) : 0;

  const finalTaxable = Math.max(deemed, declaredProfit);
  const deemedApplies = finalTaxable > declaredProfit;

  const { total: tax } = progressiveTax(finalTaxable, year);
  const advance = tax * BUSINESS_ADVANCE_RATE;
  const totalDue = tax + advance;

  return {
    deemed,
    finalTaxable,
    deemedApplies,
    tax,
    advance,
    totalDue,
    effectiveRate: finalTaxable > 0 ? (tax / finalTaxable) * 100 : 0,
  };
}

export type VatRate = 0.24 | 0.13 | 0.06;

export interface VatResult {
  net: number;
  vat: number;
  gross: number;
}

/** Given a net amount, add VAT. Given a gross amount, split it. */
export function vatCalc(amount: number, rate: VatRate, mode: "net" | "gross"): VatResult {
  if (mode === "net") {
    const vat = amount * rate;
    return { net: amount, vat, gross: amount + vat };
  }
  const net = amount / (1 + rate);
  return { net, vat: amount - net, gross: amount };
}

export const CORPORATE_RATE = 0.22;

export interface CorporateResult {
  tax: number;
  distributable: number;
  dividendTax: number;
  dividendNet: number;
  totalTax: number;
  effectiveRate: number;
}

export function corporateTax(profit: number): CorporateResult {
  const tax = Math.max(0, profit) * CORPORATE_RATE;
  const distributable = profit - tax;
  const dividendTax = Math.max(0, distributable) * 0.05;
  const dividendNet = distributable - dividendTax;
  const totalTax = tax + dividendTax;
  return {
    tax,
    distributable,
    dividendTax,
    dividendNet,
    totalTax,
    effectiveRate: profit > 0 ? (totalTax / profit) * 100 : 0,
  };
}

/** Employee social-security contributions (ΕΦΚΑ): 13.87% of gross wage. */
export const EMPLOYEE_INSURANCE = 0.1387;

export interface NetSalaryResult {
  grossMonthly: number;
  insurance: number;
  monthlyTaxable: number;
  annualTaxable: number;
  annualTax: number;
  monthlyTax: number;
  netMonthly: number;
  netAnnual: number;
  employerCost: number;
}

export function netSalary(grossMonthly: number, year: TaxYear): NetSalaryResult {
  const insurance = grossMonthly * EMPLOYEE_INSURANCE;
  const monthlyTaxable = grossMonthly - insurance;
  const annualTaxable = monthlyTaxable * 14;

  const { netTax } = incomeTax({ year, income: annualTaxable, incomeType: "wage", children: 0 });
  const annualTax = netTax;
  const monthlyTax = annualTax / 14;
  const netMonthly = monthlyTaxable - monthlyTax;
  const employerCost = grossMonthly * (1 + 0.2229); // employer contributions ~22.29%

  return {
    grossMonthly,
    insurance,
    monthlyTaxable,
    annualTaxable,
    annualTax,
    monthlyTax,
    netMonthly,
    netAnnual: netMonthly * 14,
    employerCost,
  };
}

export const eur = (n: number, digits = 0): string =>
  new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR", maximumFractionDigits: digits }).format(
    Math.round(n * 100) / 100
  );

export const pct = (n: number): string => `${n.toFixed(1)}%`;

/**
 * Reverse net salary: given a target net monthly wage, find the gross monthly
 * wage that yields it (binary search over gross). Returns the same shape as netSalary.
 */
export function reverseNetSalary(netMonthlyTarget: number, year: TaxYear): NetSalaryResult {
  const target = Math.max(0, netMonthlyTarget);
  let lo = 0;
  let hi = 100_000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const res = netSalary(mid, year);
    if (res.netMonthly < target) lo = mid;
    else hi = mid;
  }
  return netSalary(lo, year);
}

/**
 * Self-employed EΦKA (2025) — flat insurance categories indexed to the minimum wage.
 * Returns the monthly and annual contribution for a chosen category.
 */
export interface EfkaCategory {
  label: string;
  monthly: number;
  desc: string;
}

export const EFKA_CATEGORIES: EfkaCategory[] = [
  { label: "Κατηγορία 1", monthly: 238.48, desc: "Βάση: κατώτατος μισθός" },
  { label: "Κατηγορία 2", monthly: 272.55, desc: "1η αυξημένη" },
  { label: "Κατηγορία 3", monthly: 306.62, desc: "2η αυξημένη (σύνηθες)" },
  { label: "Κατηγορία 4", monthly: 340.69, desc: "3η αυξημένη" },
  { label: "Κατηγορία 5", monthly: 374.76, desc: "4η αυξημένη" },
  { label: "Κατηγορία 6", monthly: 440.85, desc: "Μέγιστη (άνω των €100.000)" },
  { label: "Επιλογή μετά από νόμο", monthly: 0, desc: "Έναρξη κατωτέρων κατηγοριών" },
];

export function efkaForCategory(category: number): { monthly: number; annual: number } {
  const c = EFKA_CATEGORIES[category] ?? EFKA_CATEGORIES[2];
  return { monthly: c.monthly, annual: c.monthly * 12 };
}
