"use client";

import { useState } from "react";
import { eur, pct, incomeTax, TAX_YEARS, type TaxYear, type IncomeTaxResult } from "@/lib/tax";
import { NumberField, Segmented, ResultBig, Breakdown } from "./ui";
import { SaveButton } from "./SaveButton";

const TYPE_OPTIONS = [
  { value: "wage" as const, label: "Μισθωτός" },
  { value: "business" as const, label: "Επιχείρηση" },
  { value: "rent" as const, label: "Ενοίκια" },
];

export function IncomeCalc({ defaultType }: { defaultType?: "wage" | "business" | "rent" }) {
  const [year, setYear] = useState<TaxYear>("2025");
  const [income, setIncome] = useState(25_000);
  const [type, setType] = useState<"wage" | "business" | "rent">(defaultType ?? "wage");
  const [children, setChildren] = useState(0);

  const res = incomeTax({ year, income, incomeType: type, children });

  return (
    <div className="calc">
      <div className="calc-inputs">
        <Segmented
          label="Φορολογικό έτος"
          options={TAX_YEARS.map((y) => ({ value: y, label: y }))}
          value={year}
          onChange={setYear}
        />
        <Segmented
          label="Τι είδους εισόδημα;"
          options={TYPE_OPTIONS}
          value={type}
          onChange={setType}
        />
        <NumberField label="Ετήσιο ακαθάριστο εισόδημα (€)" value={income} onChange={setIncome} step={500} max={300_000} />
        {type === "wage" && (
          <NumberField label="Εξαρτώμενα τέκνα" value={children} onChange={setChildren} min={0} max={5} step={1} hint="ή συντηρούμενο μέλος" />
        )}
        <p className="note">
          {type === "wage"
            ? "Η κλίμακα μισθωτών 2025 εφαρμόζεται με μείωση φόρου €777 (συν €60/τέκνο), που μειώνεται κατά €20 ανά €1.000 άνω των €10.000."
            : type === "business"
            ? "Για επιχειρηματικό εισόδημα δεν ισχύει μείωση φόρου. Προκαταβολή φόρου (100%) υπολογίζεται στο αντίστοιχο επαγγελματικό εργαλείο."
            : "Τα ενοίκια φορολογούνται με ειδική κλίμακα 15% έως €12.000, 35% έως €35.000 και 45% άνω."}
        </p>
      </div>
      <div className="calc-results">
        <ResultBig value={eur(res.netTax)} label={`Φόρος εισοδήματος · έτος ${year}`} />
        <Breakdown
          rows={[
            { k: "Ακαθάριστο εισόδημα", v: eur(income), bar: income },
            { k: "Φόρος κλίμακας", v: eur(res.grossTax) },
            { k: "Μείωση φόρου", v: `−${eur(res.credit)}` },
            { k: "Πραγματικός συντελεστής", v: pct(res.effectiveRate), accent: "teal" },
          ]}
          maxBar={income}
        />
        <TaxScaleTable res={res} />
        <SaveButton
          tool="income"
          title={`Φόρος εισοδήματος — ${eur(income)} (${type})`}
          data={{ income, type, year, tax: res.netTax, grossTax: res.grossTax, credit: res.credit, effectiveRate: res.effectiveRate, detail: `Εισόδημα ${eur(income)} · φόρος ${eur(res.netTax)}` }}
        />
      </div>
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