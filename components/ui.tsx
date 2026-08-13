"use client";

import { eur } from "@/lib/tax";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  prefix?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  step = 500,
  min = 0,
  max = 200_000,
  hint,
}: NumberFieldProps) {
  const setSmart = (raw: string) => {
    const n = parseFloat(raw.replace(/\./g, "").replace(",", "."));
    onChange(Number.isFinite(n) ? Math.max(0, n) : 0);
  };
  return (
    <div className="field">
      <label>
        <span>{label}</span>
        <span className="hint">{hint}</span>
      </label>
      <input
        className="input"
        type="text"
        inputMode="decimal"
        value={eur(value, 0).replace("€", "").replace(/\s/g, "")}
        onChange={(e) => setSmart(e.target.value)}
        aria-label={label}
      />
      <input
        className="range-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(Math.max(value, min), max)}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} (ρυθμιστής)`}
      />
    </div>
  );
}

interface SegmentedProps<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}

export function Segmented<T extends string | number>({ options, value, onChange, label }: SegmentedProps<T>) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="segmented" role="tablist" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={value === o.value}
            className={value === o.value ? "active" : ""}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface BreakdownRow {
  k: string;
  v: string;
  bar?: number;
  accent?: "grad" | "teal" | "danger";
}

export function Breakdown({ rows, maxBar }: { rows: BreakdownRow[]; maxBar?: number }) {
  const values = rows.filter((r): r is BreakdownRow & { bar: number } => r.bar != null).map((r) => r.bar);
  const max = maxBar ?? Math.max(...values, 1);
  return (
    <ul className="breakdown">
      {rows.map((r) =>
        r.bar != null ? (
          <li key={r.k}>
            <span className="k">{r.k}</span>
            <div style={{ flex: 1, margin: "0 10px" }}>
              <div className="bar">
                <span style={{ width: `${Math.max(2, (r.bar / max) * 100)}%` }} />
              </div>
            </div>
            <span className={`v ${r.accent ?? ""}`}>{r.v}</span>
          </li>
        ) : (
          <li key={r.k}>
            <span className="k">{r.k}</span>
            <span className={`v ${r.accent ?? ""}`}>{r.v}</span>
          </li>
        )
      )}
    </ul>
  );
}

export function ResultBig({ value, label, accent }: { value: string; label: string; accent?: string }) {
  return (
    <div>
      <div className={`result-big ${accent ?? "grad"}`} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      <div className="result-label">{label}</div>
    </div>
  );
}