/** Simplified ΕΝΦΙΑ (2025) — estimate only. Per-area basic tax by objective zone value. */

export interface EnfiaProperty {
  kind: "main" | "auxiliary";
  area: number; // m²
  zone: number; // object value of the zone, €/m²
  year: number; // year of construction
  floor: number; // 0 ground, 1+, or -1 basement/semi-basement
  share: number; // ownership % (0–100)
}

export interface EnfiaResult {
  basicTax: number;
  supplementaryTax: number;
  total: number;
  totalValue: number;
  rows: { kind: "Κύριοι" | "Βοηθητικοί"; tax: number; value: number }[];
}

/** Basic tax per m² by objective zone value (2025). */
export function basicRateByZone(zone: number): number {
  if (zone < 500) return 2;
  if (zone < 750) return 2.8;
  if (zone < 1000) return 2.9;
  if (zone < 1500) return 3.7;
  if (zone < 2000) return 4.5;
  if (zone < 2500) return 4.9;
  if (zone < 3000) return 5.6;
  if (zone < 3500) return 6.5;
  if (zone < 4000) return 7.5;
  return 9.5;
}

/** Age coefficient (συντελεστής παλαιότητας). */
export function ageFactor(year: number): number {
  if (year <= 1930) return 1.25;
  if (year <= 1960) return 1.15;
  if (year <= 1970) return 1.1;
  if (year <= 1980) return 1.05;
  if (year <= 1990) return 1.0;
  if (year <= 1995) return 0.95;
  if (year <= 2000) return 0.9;
  if (year <= 2005) return 0.85;
  return 0.8;
}

/** Floor coefficient (συντελεστής ορόφου). */
export function floorFactor(floor: number): number {
  if (floor < 0) return 0.98; // basement / semi-basement
  if (floor === 0) return 1.0; // ground
  if (floor === 1) return 1.01;
  if (floor === 2) return 1.02;
  if (floor === 3) return 1.03;
  if (floor === 4) return 1.04;
  return 1.05;
}

const AUX_FACTOR = 0.3; // auxiliary buildings are taxed at ~30% of the main coefficient

/** Object value (objective αντικειμενική αξία) of a property. */
export function propertyValue(p: EnfiaProperty): number {
  if (p.kind === "auxiliary") return p.area * p.zone * ageFactor(p.year) * AUX_FACTOR;
  return p.area * p.zone * ageFactor(p.year) * floorFactor(p.floor);
}

/** Progressive supplementary tax on total object value above €400k (2025). */
export function supplementaryTax(totalValue: number): number {
  const brackets: { upTo: number; rate: number }[] = [
    { upTo: 400_000, rate: 0 },
    { upTo: 500_000, rate: 0.0015 },
    { upTo: 600_000, rate: 0.002 },
    { upTo: 700_000, rate: 0.0025 },
    { upTo: 800_000, rate: 0.003 },
    { upTo: 1_000_000, rate: 0.0035 },
    { upTo: 1_200_000, rate: 0.004 },
    { upTo: Infinity, rate: 0.005 },
  ];
  let tax = 0;
  let from = 0;
  for (const b of brackets) {
    if (totalValue <= from) break;
    const width = Math.min(totalValue, b.upTo) - from;
    tax += width * b.rate;
    from = b.upTo;
  }
  return tax;
}

export function enfiaTax(properties: EnfiaProperty[], naturalPerson = true): EnfiaResult {
  const rows = properties.map((p) => {
    const value = propertyValue(p);
    const rate = basicRateByZone(p.zone) * ageFactor(p.year) * (p.kind === "auxiliary" ? AUX_FACTOR : floorFactor(p.floor));
    const tax = p.area * rate * (p.share / 100);
    return { kind: p.kind === "auxiliary" ? "Βοηθητικοί" : "Κύριοι", tax, value: (value * p.share) / 100 };
  });

  // Aggregate main / auxiliary for display.
  const byKind = new Map<string, { tax: number; value: number }>();
  for (const r of rows) {
    const cur = byKind.get(r.kind) ?? { tax: 0, value: 0 };
    cur.tax += r.tax;
    cur.value += r.value;
    byKind.set(r.kind, cur);
  }
  const aggRows = [...byKind.entries()].map(([kind, v]) => ({ kind: kind as "Κύριοι" | "Βοηθητικοί", ...v }));

  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const basicTax = rows.reduce((s, r) => s + r.tax, 0);
  const basicWithDiscount = naturalPerson ? basicTax * 0.7 : basicTax; // 30% discount for natural persons
  const sup = supplementaryTax(totalValue);

  return {
    basicTax: basicWithDiscount,
    supplementaryTax: sup,
    total: basicWithDiscount + sup,
    totalValue,
    rows: aggRows,
  };
}