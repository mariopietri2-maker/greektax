"use client";

import { useState } from "react";
import { eur, pct, netSalary, TAX_YEARS, EMPLOYEE_INSURANCE, type TaxYear } from "@/lib/tax";
import { NumberField, Segmented, ResultBig, Breakdown } from "./ui";

export function NetSalaryCalc() {
  const [year, setYear] = useState<TaxYear>("2025");
  const [gross, setGross] = useState(1_200);

  const res = netSalary(gross, year);

  return (
    <div className="calc">
      <div className="calc-inputs">
        <Segmented label="Φορολογικό έτος" options={TAX_YEARS.map((y) => ({ value: y, label: y }))} value={year} onChange={setYear} />
        <NumberField label="Μεικτός μηνιαίος μισθός (€)" value={gross} onChange={setGross} step={50} max={20_000} />
        <p className="note">
          Αφαιρούνται οι εισφορές εργαζομένου ΕΦΚΑ {pct(EMPLOYEE_INSURANCE * 100)} και η μηνιαία παρακράτηση φόρου
          με την κλίμακα μισθωτών (14 μισθοί/έτος).
        </p>
      </div>
      <div className="calc-results">
        <ResultBig value={eur(res.netMonthly, 2)} label="Καθαρός μηνιαίος μισθός" accent="teal" />
        <Breakdown
          rows={[
            { k: "Μεικτός μισθός (14×)", v: eur(gross) },
            { k: "Εισφορές ΕΦΚΑ", v: `−${eur(res.insurance)}`, bar: res.insurance },
            { k: "Μηνιαίος φόρος", v: `−${eur(res.monthlyTax)}`, bar: res.monthlyTax },
            { k: "Καθαρό ετήσιο", v: eur(res.netAnnual), accent: "teal" },
            { k: "Συνολικό κόστος εργοδότη", v: eur(res.employerCost) },
          ]}
          maxBar={res.grossMonthly}
        />
        <p className="note">Το κόστος εργοδότη περιλαμβάνει επιπλέον εισφορές ~22,29%.</p>
      </div>
    </div>
  );
}