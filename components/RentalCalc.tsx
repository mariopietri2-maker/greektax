"use client";

import { useState } from "react";
import { eur, rentalTax } from "@/lib/tax";
import { NumberField, Segmented, ResultBig, Breakdown, PrintButton } from "./ui";
import { SaveButton } from "./SaveButton";

export function RentalCalc() {
  const [monthly, setMonthly] = useState(650);
  const [kind, setKind] = useState<"residential" | "business">("residential");

  const res = rentalTax(monthly, kind);

  const monthlyBreakdown =
    kind === "residential"
      ? { k: "Μηνιαίο καθαρό", v: eur(res.monthlyNet, 2), bar: res.monthlyNet }
      : { k: "Μηνιαίο καθαρό", v: eur(res.monthlyNet, 2), bar: res.monthlyNet };

  return (
    <div className="calc">
      <div className="calc-inputs">
        <Segmented
          label="Τύπος μίσθωσης"
          options={[
            { value: "residential" as const, label: "Κατοικία (15%)" },
            { value: "business" as const, label: "Επαγγελματική (24%)" },
          ]}
          value={kind}
          onChange={setKind}
        />
        <NumberField label="Μηνιαίο ενοίκιο (€)" value={monthly} onChange={setMonthly} step={50} max={10000} />
      </div>
      <div className="calc-results">
        <ResultBig value={eur(res.annualNet, 2)} label="Καθαρό ετήσιο εισόδημα" />
        <Breakdown
          rows={[
            { k: "Ετήσια μεικτά", v: eur(res.annualGross, 2), bar: res.annualGross },
            { k: `Φόρος ${res.effectiveRate.toFixed(0)}%`, v: `− ${eur(res.tax, 2)}`, bar: res.tax, accent: "danger" },
            { k: "Καθαρά ετήσια", v: eur(res.annualNet, 2), accent: "grad" },
            monthlyBreakdown,
          ]}
          maxBar={res.annualGross}
        />
        <SaveButton
          tool="rent"
          title={`Ενοίκιο — ${eur(res.annualNet, 2)}/έτος`}
          data={{
            monthly,
            kind,
            annualGross: res.annualGross,
            tax: res.tax,
            annualNet: res.annualNet,
            detail: `${eur(monthly, 2)}/μήνα → καθαρά ${eur(res.annualNet, 2)}/έτος`,
          }}
        />
        <PrintButton />
      </div>
    </div>
  );
}