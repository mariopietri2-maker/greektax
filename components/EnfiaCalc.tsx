"use client";

import { useState } from "react";
import { eur } from "@/lib/tax";
import { enfiaTax, type EnfiaProperty } from "@/lib/enfia";
import { NumberField, Segmented, ResultBig, Breakdown, PrintButton } from "./ui";
import { SaveButton } from "./SaveButton";

interface PropRow {
  id: number;
  kind: "main" | "auxiliary";
  area: number;
  zone: number;
  year: number;
  floor: number;
  share: number;
}

let nextId = 1;

export function EnfiaCalc() {
  const [props, setProps] = useState<PropRow[]>([
    { id: 0, kind: "main", area: 90, zone: 1200, year: 2005, floor: 2, share: 100 },
  ]);
  const [entity, setEntity] = useState<"natural" | "legal">("natural");
  const naturalPerson = entity === "natural";

  const update = (id: number, patch: Partial<PropRow>) => {
    setProps((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: number) => setProps((rows) => rows.filter((r) => r.id !== id));

  const addMain = () =>
    setProps((rows) => [...rows, { id: nextId++, kind: "main", area: 60, zone: 1200, year: 2005, floor: 0, share: 100 }]);
  const addAux = () =>
    setProps((rows) => [...rows, { id: nextId++, kind: "auxiliary", area: 20, zone: 1200, year: 2005, floor: 0, share: 100 }]);

  const enfiaProps: EnfiaProperty[] = props.map((p) => ({
    kind: p.kind,
    area: p.area,
    zone: p.zone,
    year: p.year,
    floor: p.floor,
    share: p.share,
  }));

  const res = enfiaTax(enfiaProps, naturalPerson);

  return (
    <div className="calc">
      <div className="calc-inputs">
        <Segmented
          label="Φορολογούμενος"
          options={[
            { value: "natural" as const, label: "Φυσικό πρόσωπο (−30%)" },
            { value: "legal" as const, label: "Νομικό πρόσωπο" },
          ]}
          value={entity}
          onChange={setEntity}
        />

        <div className="prop-list">
          {props.map((p, i) => (
            <div className="prop-row" key={p.id}>
              <div className="prop-head">
                <b>{p.kind === "main" ? `Κύριος χώρος ${i + 1}` : `Βοηθητικός χώρος ${i + 1}`}</b>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(p.id)} disabled={props.length === 1}>
                  Αφαίρεση
                </button>
              </div>
              <div className="prop-grid">
                <NumberField label="Εμβαδόν (m²)" value={p.area} onChange={(v) => update(p.id, { area: v })} step={5} max={2000} />
                <NumberField label="Τιμή ζώνης (€/m²)" value={p.zone} onChange={(v) => update(p.id, { zone: v })} step={100} max={10000} />
                <NumberField label="Έτος κατασκευής" value={p.year} onChange={(v) => update(p.id, { year: v })} step={1} min={1920} max={2026} />
                {p.kind === "main" && (
                  <div style={{ display: "grid", gap: 8 }}>
                    <label htmlFor={`floor-${p.id}`}>Όροφος</label>
                    <div className="segmented">
                      {[
                        { v: -1 as const, l: "Υπόγειο" },
                        { v: 0 as const, l: "Ισόγειο" },
                        { v: 1 as const, l: "1ος" },
                        { v: 2 as const, l: "2ος" },
                        { v: 3 as const, l: "3ος" },
                      ].map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          id={`floor-${p.id}`}
                          aria-pressed={p.floor === o.v}
                          className={p.floor === o.v ? "active" : ""}
                          onClick={() => update(p.id, { floor: o.v })}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <NumberField label="Ποσοστό (%)" value={p.share} onChange={(v) => update(p.id, { share: Math.min(100, v) })} step={5} max={100} />
              </div>
            </div>
          ))}
        </div>

        <div className="prop-actions">
          <button type="button" className="btn btn-ghost" onClick={addMain}>+ Κύριος χώρος</button>
          <button type="button" className="btn btn-ghost" onClick={addAux}>+ Βοηθητικός χώρος</button>
        </div>
      </div>
      <div className="calc-results">
        <ResultBig value={eur(res.total, 2)} label="Σύνολο ΕΝΦΙΑ" />
        <Breakdown
          rows={[
            { k: "Βασικός φόρος", v: eur(res.basicTax, 2), bar: res.basicTax },
            { k: "Συμπληρωματικός φόρος", v: eur(res.supplementaryTax, 2), bar: Math.max(res.supplementaryTax, 1), accent: "teal" },
            { k: "Αντικειμενική αξία", v: eur(res.totalValue, 0), accent: "grad" },
          ]}
          maxBar={Math.max(res.basicTax, res.supplementaryTax, 1)}
        />
        <p className="note" style={{ marginTop: 10 }}>
          Εκτίμηση 2025. Ο βασικός φόρος βασίζεται σε εμβαδόν, τιμή ζώνης, παλαιότητα και όροφο· ο
          συμπληρωματικός σε κλιμάκια από €400.000. Η πραγματική εκκαθάριση γίνεται από την ΑΑΔΕ.
        </p>
        <SaveButton
          tool="enfia"
          title={`ΕΝΦΙΑ — ${eur(res.total, 2)}`}
          data={{
            properties: enfiaProps,
            naturalPerson,
            basic: res.basicTax,
            supplementary: res.supplementaryTax,
            total: res.total,
            detail: `Βασικός ${eur(res.basicTax, 2)} + Συμπληρωματικός ${eur(res.supplementaryTax, 2)} = ${eur(res.total, 2)}`,
          }}
        />
        <PrintButton />
      </div>
    </div>
  );
}