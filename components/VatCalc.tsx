"use client";

import { useState } from "react";
import { eur, vatCalc, pct, type VatRate } from "@/lib/tax";
import { NumberField, Segmented, ResultBig, Breakdown, PrintButton } from "./ui";
import { SaveButton } from "./SaveButton";

const RATES = [
  { value: 0.24 as VatRate, label: "24% — Κανονικός" },
  { value: 0.13 as VatRate, label: "13% — Τρόφιμα" },
  { value: 0.06 as VatRate, label: "6% — Βιβλία/φάρμακα" },
];

export function VatCalc() {
  const [rate, setRate] = useState<VatRate>(0.24);
  const [mode, setMode] = useState<"net" | "gross">("net");
  const [amount, setAmount] = useState(1_000);

  const res = vatCalc(amount, rate, mode);

  return (
    <div className="calc">
      <div className="calc-inputs">
        <Segmented
          label="Γνωρίζεις το…"
          options={[
            { value: "net" as const, label: "Ποσό χωρίς ΦΠΑ" },
            { value: "gross" as const, label: "Ποσό με ΦΠΑ" },
          ]}
          value={mode}
          onChange={setMode}
        />
        <Segmented label="Συντελεστής ΦΠΑ" options={RATES} value={rate} onChange={setRate} />
        <NumberField label={mode === "net" ? "Καθαρή αξία (€)" : "Τελική τιμή (€)"} value={amount} onChange={setAmount} step={100} max={1_000_000} />
      </div>
      <div className="calc-results">
        <ResultBig value={eur(res.gross, 2)} label="Τελικό ποσό με ΦΠΑ" />
        <Breakdown
          rows={[
            { k: "Καθαρή αξία", v: eur(res.net, 2), bar: res.net },
            { k: `ΦΠΑ ${pct(rate * 100)}`, v: eur(res.vat, 2), bar: res.vat, accent: "teal" },
            { k: "Σύνολο", v: eur(res.gross, 2), accent: "grad" },
          ]}
          maxBar={res.gross}
        />
        <SaveButton
          tool="vat"
          title={`ΦΠΑ ${pct(rate * 100)} — ${eur(res.gross, 2)}`}
          data={{ mode, rate, net: res.net, vat: res.vat, gross: res.gross, detail: `${eur(res.net, 2)} + ΦΠΑ ${eur(res.vat, 2)} = ${eur(res.gross, 2)}` }}
        />
        <PrintButton />
      </div>
    </div>
  );
}