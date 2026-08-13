"use client";

import { useState } from "react";
import { eur, dividendTax, interestTax } from "@/lib/tax";
import { NumberField, Segmented, ResultBig, Breakdown, PrintButton } from "./ui";
import { SaveButton } from "./SaveButton";

export function DividendCalc() {
  const [kind, setKind] = useState<"dividend" | "interest">("dividend");
  const [gross, setGross] = useState(2_000);

  const res = kind === "dividend" ? dividendTax(gross) : interestTax(gross);
  const rateLabel = kind === "dividend" ? "5%" : "15%";

  return (
    <div className="calc">
      <div className="calc-inputs">
        <Segmented
          label="Είδος εισοδήματος"
          options={[
            { value: "dividend" as const, label: "Μερίσματα (5%)" },
            { value: "interest" as const, label: "Τόκοι καταθέσεων (15%)" },
          ]}
          value={kind}
          onChange={setKind}
        />
        <NumberField label={`Μεικτό ποσό (€)`} value={gross} onChange={setGross} step={100} max={1_000_000} />
      </div>
      <div className="calc-results">
        <ResultBig value={eur(res.net, 2)} label="Καθαρό ποσό μετά τη φορολογία" />
        <Breakdown
          rows={[
            { k: "Μεικτό", v: eur(res.gross, 2), bar: res.gross },
            { k: `Παρακράτηση ${rateLabel}`, v: `− ${eur(res.tax, 2)}`, bar: res.tax, accent: "danger" },
            { k: "Καθαρό", v: eur(res.net, 2), accent: "grad" },
          ]}
          maxBar={res.gross}
        />
        {kind === "interest" && (
          <p className="note" style={{ marginTop: 10 }}>
            Οι τόκοι καταθέσεων φορολογούνται με παρακράτηση 15% στην πηγή. Τα μερίσματα με 5%
            (τελικός φόρος, δεν συμψηφίζεται με την κλίμακα).
          </p>
        )}
        <SaveButton
          tool="dividend"
          title={`${kind === "dividend" ? "Μερίσματα" : "Τόκοι"} — ${eur(res.net, 2)}`}
          data={{
            kind,
            gross,
            rate: rateLabel,
            tax: res.tax,
            net: res.net,
            detail: `${eur(gross, 2)} μεικτά → ${eur(res.net, 2)} καθαρά (${rateLabel})`,
          }}
        />
        <PrintButton />
      </div>
    </div>
  );
}