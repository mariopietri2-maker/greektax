"use client";

import { useState } from "react";
import { eur, pct, corporateTax } from "@/lib/tax";
import { NumberField, Segmented, ResultBig, Breakdown } from "./ui";

export function CorporateCalc() {
  const [entityType, setEntityType] = useState<"double" | "single">("double");
  const [profit, setProfit] = useState(80_000);

  const res = corporateTax(profit);

  return (
    <div className="calc">
      <div className="calc-inputs">
        <Segmented
          label="Τύπος βιβλίων"
          options={[
            { value: "double" as const, label: "Διπλογραφικά (Α.Ε., Ι.Κ.Ε.)" },
            { value: "single" as const, label: "Απλογραφικά (ατομική/Ο.Ε.)" },
          ]}
          value={entityType}
          onChange={setEntityType}
        />
        <NumberField label="Καθαρά κέρδη προ φόρων (€)" value={profit} onChange={setProfit} step={1000} max={5_000_000} />
        <p className="note">
          Ο συντελεστής φόρου νομικών προσώπων είναι 22% για το 2025. Σε διανομή μερίσματος προστίθεται
          παρακράτηση 5% μετά φόρου.
        </p>
      </div>
      <div className="calc-results">
        <ResultBig value={eur(res.tax)} label="Φόρος νομικών προσώπων (22%)" />
        <Breakdown
          rows={[
            { k: "Κέρδη προ φόρων", v: eur(profit), bar: profit },
            { k: "Φόρος (22%)", v: `−${eur(res.tax)}`, bar: res.tax, accent: "danger" },
            { k: "Καθαρά κέρδη μετά φόρο", v: eur(res.distributable), bar: res.distributable, accent: "teal" },
            { k: "Φόρος μερίσματος (5%)", v: `−${eur(res.dividendTax)}` },
            { k: "Καθαρό μέρισμα", v: eur(res.dividendNet), accent: "teal" },
            { k: "Συνολικός συντελεστής", v: pct(res.effectiveRate) },
          ]}
          maxBar={profit}
        />
      </div>
    </div>
  );
}