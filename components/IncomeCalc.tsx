"use client";

import { useState } from "react";
import { eur, pct, incomeTax, TAX_YEARS, type TaxYear, type IncomeTaxResult } from "@/lib/tax";
import { NumberField, Segmented, ResultBig, Breakdown, PrintButton } from "./ui";
import { SaveButton } from "./SaveButton";

const TYPE_OPTIONS = [
  { value: "wage" as const, label: "Μισθωτός" },
  { value: "business" as const, label: "Επιχείρηση" },
  { value: "rent" as const, label: "Ενοίκια" },
];

interface Scenario {
  year: TaxYear;
  income: number;
}

const yearOptions = () => TAX_YEARS.map((y) => ({ value: y, label: y }));

export function IncomeCalc({ defaultType }: { defaultType?: "wage" | "business" | "rent" }) {
  const [type, setType] = useState<"wage" | "business" | "rent">(defaultType ?? "wage");
  const [children, setChildren] = useState(0);
  const [compare, setCompare] = useState(false);
  const [a, setA] = useState<Scenario>({ year: "2025", income: 25_000 });
  const [b, setB] = useState<Scenario>({ year: "2024", income: 25_000 });

  const resA = incomeTax({ year: a.year, income: a.income, incomeType: type, children });
  const resB = incomeTax({ year: b.year, income: b.income, incomeType: type, children });

  const note =
    type === "wage"
      ? "Η κλίμακα μισθωτών εφαρμόζεται με μείωση φόρου €777 (συν €60/τέκνο), που μειώνεται κατά €20 ανά €1.000 άνω των €10.000."
      : type === "business"
      ? "Για επιχειρηματικό εισόδημα δεν ισχύει μείωση φόρου. Προκαταβολή φόρου (100%) υπολογίζεται στο αντίστοιχο επαγγελματικό εργαλείο."
      : "Τα ενοίκια φορολογούνται με ειδική κλίμακα 15% έως €12.000, 35% έως €35.000 και 45% άνω.";

  return (
    <div className="calc">
      <div className="calc-inputs">
        <Segmented
          label="Τι είδους εισόδημα;"
          options={TYPE_OPTIONS}
          value={type}
          onChange={setType}
        />
        {type === "wage" && (
          <NumberField label="Εξαρτώμενα τέκνα" value={children} onChange={setChildren} min={0} max={5} step={1} hint="ή συντηρούμενο μέλος" />
        )}
        <Segmented
          label="Σύγκριση"
          options={[
            { value: "single" as const, label: "Ένα σενάριο" },
            { value: "compare" as const, label: "Σύγκριση 2" },
          ]}
          value={compare ? "compare" : "single"}
          onChange={(v) => setCompare(v === "compare")}
        />
        {!compare ? (
          <ScenarioInputs label="Σενάριο" value={a} onChange={setA} />
        ) : (
          <>
            <ScenarioInputs label="Σενάριο Α" value={a} onChange={setA} />
            <ScenarioInputs label="Σενάριο Β" value={b} onChange={setB} />
          </>
        )}
        <p className="note">{note}</p>
      </div>

      <div className="calc-results">
        {compare ? (
          <div className="compare-grid">
            <ComparePanel label="Σενάριο Α" scenario={a} res={resA} />
            <ComparePanel label="Σενάριο Β" scenario={b} res={resB} />
          </div>
        ) : (
          <ComparePanel label={null} scenario={a} res={resA} />
        )}
        <SaveButton
          tool="income"
          title={`Φόρος εισοδήματος — ${eur(a.income)} (${type}${compare ? ` / ${eur(b.income)}` : ""})`}
          data={{
            type, year: a.year, income: a.income, tax: resA.netTax, grossTax: resA.grossTax,
            credit: resA.credit, effectiveRate: resA.effectiveRate,
            compare: compare ? { year: b.year, income: b.income, tax: resB.netTax } : undefined,
            detail: compare
              ? `A: ${eur(a.income)} → ${eur(resA.netTax)} · B: ${eur(b.income)} → ${eur(resB.netTax)}`
              : `Εισόδημα ${eur(a.income)} · φόρος ${eur(resA.netTax)}`,
          }}
        />
        <PrintButton />
      </div>
    </div>
  );
}

function ScenarioInputs({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Scenario;
  onChange: (s: Scenario) => void;
}) {
  return (
    <div className="scenario-box">
      <span className="scenario-label">{label}</span>
      <Segmented label={`${label} · έτος`} options={yearOptions()} value={value.year} onChange={(year) => onChange({ ...value, year })} />
      <NumberField label={`${label} · ετήσιο ακαθάριστο εισόδημα (€)`} value={value.income} onChange={(income) => onChange({ ...value, income })} step={500} max={300_000} />
    </div>
  );
}

function ComparePanel({ label, scenario, res }: { label: string | null; scenario: Scenario; res: IncomeTaxResult }) {
  return (
    <div className="compare-col">
      {label && <div className="compare-title">{label}</div>}
      <ResultBig value={eur(res.netTax)} label={`Φόρος εισοδήματος · έτος ${scenario.year}`} />
      <Breakdown
        rows={[
          { k: "Ακαθάριστο εισόδημα", v: eur(scenario.income), bar: scenario.income },
          { k: "Φόρος κλίμακας", v: eur(res.grossTax) },
          { k: "Μείωση φόρου", v: `−${eur(res.credit)}` },
          { k: "Πραγματικός συντελεστής", v: pct(res.effectiveRate), accent: "teal" },
        ]}
        maxBar={scenario.income}
      />
      <TaxScaleTable res={res} />
    </div>
  );
}

function TaxScaleTable({ res }: { res: IncomeTaxResult }) {
  return (
    <div>
      <p className="result-label" style={{ marginTop: 8 }}>Αναλυτική κλίμακα</p>
      <ul className="breakdown">
        {res.slices.map((s, i) => (
          <li key={i}>
            <span className="k">
              {s.upTo === Infinity ? `${eur(s.from)}+` : `${eur(s.from)} – ${eur(s.upTo)}`}
            </span>
            <span className="v">{pct(s.rate * 100)}</span>
            <span className="v" style={{ color: "var(--muted)" }}>
              {eur(s.tax)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}