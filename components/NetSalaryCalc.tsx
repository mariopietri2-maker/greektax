"use client";

import { useState } from "react";
import { eur, pct, netSalary, reverseNetSalary, TAX_YEARS, EMPLOYEE_INSURANCE, type TaxYear } from "@/lib/tax";
import { NumberField, Segmented, ResultBig, Breakdown, PrintButton } from "./ui";
import { SaveButton } from "./SaveButton";

type Mode = "forward" | "reverse";

export function NetSalaryCalc() {
  const [year, setYear] = useState<TaxYear>("2025");
  const [mode, setMode] = useState<Mode>("forward");
  const [gross, setGross] = useState(1_200);
  const [net, setNet] = useState(1_000);

  const res = mode === "forward" ? netSalary(gross, year) : reverseNetSalary(net, year);
  const shownGross = mode === "forward" ? gross : res.grossMonthly;

  return (
    <div className="calc">
      <div className="calc-inputs">
        <Segmented label="Φορολογικό έτος" options={TAX_YEARS.map((y) => ({ value: y, label: y }))} value={year} onChange={setYear} />
        <Segmented
          label="Τρόπος υπολογισμού"
          options={[
            { value: "forward" as const, label: "Μεικτά → Καθαρά" },
            { value: "reverse" as const, label: "Καθαρά → Μεικτά" },
          ]}
          value={mode}
          onChange={setMode}
        />
        {mode === "forward" ? (
          <NumberField label="Μεικτός μηνιαίος μισθός (€)" value={gross} onChange={setGross} step={50} max={20_000} />
        ) : (
          <NumberField label="Επιθυμητός καθαρός μηνιαίος μισθός (€)" value={net} onChange={setNet} step={50} max={20_000} />
        )}
        <p className="note">
          {mode === "forward"
            ? `Αφαιρούνται οι εισφορές εργαζομένου ΕΦΚΑ ${pct(EMPLOYEE_INSURANCE * 100)} και η μηνιαία παρακράτηση φόρου με την κλίμακα μισθωτών (14 μισθοί/έτος).`
            : "Δες ποιος μεικτός μισθός δίνει το καθαρό που στοχεύεις, μαζί με εισφορές, φόρο και κόστος εργοδότη."}
        </p>
      </div>
      <div className="calc-results">
        <ResultBig
          value={eur(mode === "forward" ? res.netMonthly : res.grossMonthly, 2)}
          label={mode === "forward" ? "Καθαρός μηνιαίος μισθός" : "Απαιτούμενος μεικτός μηνιαίος μισθός"}
          accent="teal"
        />
        <Breakdown
          rows={[
            { k: "Μεικτός μισθός (14×)", v: eur(shownGross) },
            { k: "Εισφορές ΕΦΚΑ", v: `−${eur(res.insurance)}`, bar: res.insurance },
            { k: "Μηνιαίος φόρος", v: `−${eur(res.monthlyTax)}`, bar: res.monthlyTax },
            { k: "Καθαρό ετήσιο", v: eur(res.netAnnual), accent: "teal" },
            { k: "Συνολικό κόστος εργοδότη", v: eur(res.employerCost) },
          ]}
          maxBar={res.grossMonthly}
        />
        <p className="note">Το κόστος εργοδότη περιλαμβάνει επιπλέον εισφορές ~22,29%.</p>
        <SaveButton
          tool="salary"
          title={`Καθαρός μισθός ${year} — ${mode === "forward" ? `μεικτά ${eur(gross)}` : `καθαρά ${eur(net)}`}`}
          data={{ year, mode, gross: shownGross, netMonthly: res.netMonthly, insurance: res.insurance, monthlyTax: res.monthlyTax, employerCost: res.employerCost, detail: `${mode === "forward" ? `Μεικτά ${eur(gross)} → καθαρά ${eur(res.netMonthly, 2)}` : `Καθαρά ${eur(net)} → μεικτά ${eur(res.grossMonthly, 2)}`}` }}
        />
        <PrintButton />
      </div>
    </div>
  );
}