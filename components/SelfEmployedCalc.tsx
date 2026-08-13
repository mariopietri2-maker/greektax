"use client";

import { useState } from "react";
import { eur, pct, selfEmployedTax, efkaForCategory, EFKA_CATEGORIES, TAX_YEARS, type TaxYear } from "@/lib/tax";
import { NumberField, Segmented, ResultBig, Breakdown, PrintButton } from "./ui";
import { SaveButton } from "./SaveButton";

interface SelfEmployedCalcProps {
  initialProfit?: number;
  initialRevenue?: number;
}

export function SelfEmployedCalc({ initialProfit, initialRevenue }: SelfEmployedCalcProps = {}) {
  const [year, setYear] = useState<TaxYear>("2025");
  const [years, setYears] = useState(8);
  const [profit, setProfit] = useState(initialProfit ?? 14_000);
  const [revenue, setRevenue] = useState(initialRevenue ?? 48_000);
  const [payroll, setPayroll] = useState(0);
  const [category, setCategory] = useState(2);

  const res = selfEmployedTax({ year, yearsActive: years, declaredProfit: profit, grossRevenue: revenue, payroll });
  const efka = efkaForCategory(category);

  return (
    <div className="calc">
      <div className="calc-inputs">
        <Segmented label="Φορολογικό έτος" options={TAX_YEARS.map((y) => ({ value: y, label: y }))} value={year} onChange={setYear} />
        <NumberField label="Έτη άσκησης δραστηριότητας" value={years} onChange={setYears} min={0} max={30} step={1} hint="από 2026: 4 ετών και άνω" />
        <NumberField label="Δηλωθέν καθαρό κέρδος (€)" value={profit} onChange={setProfit} step={500} max={300_000} />
        <NumberField label="Ετήσιος κύκλος εργασιών (€)" value={revenue} onChange={setRevenue} step={500} max={500_000} />
        <NumberField label="Ετήσιο κόστος μισθοδοσίας (€)" value={payroll} onChange={setPayroll} step={500} max={200_000} hint="προαιρετικό" />
        <div className="field">
          <label>Κατηγορία ΕΦΚΑ</label>
          <select className="input" value={category} onChange={(e) => setCategory(Number(e.target.value))} aria-label="Κατηγορία ΕΦΚΑ">
            {EFKA_CATEGORIES.map((c, i) => (
              <option key={c.label} value={i}>
                {c.label} — {eur(c.monthly, 2)}/μήνα · {c.desc}
              </option>
            ))}
          </select>
        </div>
        <p className="note">
          Υπολογίζεται το ελάχιστο τεκμαρτό εισόδημα (βάση {year === "2025" ? "€12.320" : "€11.620"} · κατώτατος μισθός ×14),
          με προσαυξήσεις 10% για προσωπικό και έως 5% για τζίρο άνω του κλαδικού μέσου, με ανώτατο όριο €50.000.
        </p>
      </div>
      <div className="calc-results">
        <ResultBig
          value={eur(res.finalTaxable)}
          label={`Φορολογητέο εισόδημα${res.deemedApplies ? " · βάσει ελάχιστου τεκμαρτού" : ""}`}
          accent={res.deemedApplies ? "teal" : undefined}
        />
        {res.deemedApplies ? (
          <div>
            <span className="pill pill-good">Εφαρμόζεται τεκμαρτό εισόδημα</span>{" "}
            <span className="pill pill-bad">Δηλωθέν: {eur(profit)}</span>
          </div>
        ) : (
          <span className="pill pill-bad">Δεν εφαρμόζεται ελάχιστο τεκμαρτό (καθαρά κέρδη &gt; τεκμήριο)</span>
        )}
        <Breakdown
          rows={[
            { k: "Ελάχιστο τεκμαρτό εισόδημα", v: eur(res.deemed) },
            { k: "Φόρος κλίμακας", v: eur(res.tax) },
            { k: "Προκαταβολή φόρου (100%)", v: eur(res.advance) },
            { k: `ΕΦΚΑ (${EFKA_CATEGORIES[category].label})`, v: eur(efka.annual), accent: "danger" },
            { k: "Συνολικό πληρωτέο (φόρος+ΕΦΚΑ)", v: eur(res.totalDue + efka.annual), accent: "danger" },
            { k: "Φόρος / φορολογητέο", v: pct(res.effectiveRate), accent: "teal" },
          ]}
        />
        <p className="note">
          Το ΕΦΚΑ υπολογίζεται με τη σταθερή μηνιαία εισφορά της κατηγορίας που διάλεξες, όχι ως ποσοστό των κερδών σου.
        </p>
        <SaveButton
          tool="self"
          title={`Ελεύθερος επαγγελματίας ${year} — κέρδη ${eur(profit)}`}
          data={{ year, years, profit, revenue, payroll, efkaCategory: category, efkaAnnual: efka.annual, deemed: res.deemed, finalTaxable: res.finalTaxable, tax: res.tax, advance: res.advance, totalDue: res.totalDue, detail: `Φορολογητέο ${eur(res.finalTaxable)} · φόρος+ΕΦΚΑ ${eur(res.totalDue + efka.annual)}` }}
        />
        <PrintButton />
      </div>
    </div>
  );
}