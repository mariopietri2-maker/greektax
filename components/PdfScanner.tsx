"use client";

import { useRef, useState } from "react";
import { eur } from "@/lib/tax";
import { saveDocument } from "@/lib/supabase/documents";

type Kind = "income" | "expense" | "skip";

interface Entry {
  id: number;
  label: string;
  amount: number;
  kind: Kind;
}

interface ScanResult {
  revenue: number;
  expenses: number;
}

const INCOME_RE = /έσοδ|πωλ|πιστωτ|εισπρ|τιμολ(όγιο|ο|ια).*(παρ|εξαγ)|credit|income|revenue|σύνολο εσόδων|αξία πωλήσεων|κύκλος εργασιών|καθαρά έσοδα|τζίρο|sales|total income|service invoice|received/i;
const EXPENSE_RE = /έξοδ|δαπάν|αγορ|χρεωστ|τιμολ(όγιο|ο|ια).*(αγορ|δαπαν)|debit|expense|κόστος|προμήθ|μισθοδοσ|ενοίκιο|λογαριασμ|ασφαλιστικ|φόρος|fee|purchase|cost|utility|supplier|total expense/i;
const IGNORE_RE = /^(σελ|page|\d{4}|αρ\.|αφμ|ν\.|δρ\.|τηλ|fax|email|www\.|ημερομηνία εκτύπωσης|printed)/i;

/** Normalize "1.234,56 €", "1234,56", "1,234.56" → 1234.56 */
function parseAmount(raw: string): number {
  const m = raw.match(/-?\d{1,3}(?:[.,]\d{3})*[.,]\d{2}/);
  if (!m) return 0;
  let s = m[0].replace(/\s/g, "");
  const neg = s.startsWith("-");
  if (neg) s = s.slice(1);
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  const last = Math.max(lastDot, lastComma);
  if (last === -1) return 0;
  const intPart = s.slice(0, last).replace(/[.,]/g, "");
  const decPart = s.slice(last + 1);
  const num = parseFloat(intPart + "." + decPart);
  return Number.isFinite(num) ? (neg ? -num : num) : 0;
}

function classify(line: string): Kind {
  if (IGNORE_RE.test(line)) return "skip";
  const inc = INCOME_RE.test(line);
  const exp = EXPENSE_RE.test(line);
  if (inc && !exp) return "income";
  if (exp && !inc) return "expense";
  return "skip";
}

function cleanLabel(line: string): string {
  return line.replace(/\s+/g, " ").trim().slice(0, 90);
}

export function PdfScanner({
  onApply,
}: {
  onApply: (result: ScanResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "working" | "review">("idle");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [fileName, setFileName] = useState("");

  const revenue = entries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
  const expenses = entries.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);

  const onFile = async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Επίλεξε αρχείο PDF.");
      return;
    }
    setState("working");
    setError("");
    setSaved(false);
    setFileName(file.name);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      let text = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const items = content.items.map((it) => ("str" in it ? it.str : ""));
        text += items.join("\n") + "\n";
      }
      doc.cleanup();

      const raw = text.split("\n");
      let id = 0;
      const found: Entry[] = [];
      for (const line of raw) {
        const amount = parseAmount(line);
        if (amount === 0) continue;
        const kind = classify(line);
        if (kind === "skip" && Math.abs(amount) < 5) continue;
        found.push({ id: id++, label: cleanLabel(line), amount: Math.abs(amount), kind });
      }

      if (found.length === 0) {
        setError("Δεν βρέθηκαν ποσά στο PDF. Μπορεί να είναι σκαναρισμένο (εικόνα) — δοκίμασε αρχείο κειμένου.");
        setState("idle");
        return;
      }

      // Collapse near-duplicate "total" lines
      setEntries(found);
      setState("review");
    } catch {
      setError("Αποτυχία ανάγνωσης PDF. Το αρχείο μπορεί να είναι κατεστραμμένο ή κρυπτογραφημένο.");
      setState("idle");
    }
  };

  const toggleKind = (id: number, kind: Kind) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, kind } : e)));

  const setAmount = (id: number, raw: string) => {
    const n = parseFloat(raw.replace(/\./g, "").replace(",", "."));
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, amount: Number.isFinite(n) ? Math.max(0, n) : 0 } : e))
    );
  };

  const reset = () => {
    setEntries([]);
    setFileName("");
    setError("");
    setSaved(false);
    setState("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSave = async () => {
    const kind = revenue > 0 && expenses > 0 ? "mixed" : revenue > 0 ? "income" : "expense";
    const res = await saveDocument({
      title: fileName || `Σάρωση — ${new Date().toLocaleDateString("el-GR")}`,
      category: "Φορολογικά",
      kind,
      amount: kind === "income" ? revenue : expenses,
      items: entries.map((e) => ({ label: e.label, amount: e.amount, kind: e.kind })),
    });
    if (res.ok) {
      setSaved(true);
      setError("");
    } else {
      setError(res.error ?? "Δεν ήταν δυνατή η αποθήκευση.");
    }
  };

  const counts = { income: 0, expense: 0, skip: 0 };
  for (const e of entries) counts[e.kind]++;

  return (
    <div className="calc">
      <div className="calc-inputs">
        <div>
          <span className="eyebrow">Σάρωση PDF</span>
          <h3 style={{ margin: "6px 0 4px" }}>Έσοδα & έξοδα από αρχείο</h3>
          <p className="note" style={{ marginBottom: 16 }}>
            Ανεβάστε ένα ψηφιακό PDF (τιμολόγια, τραπεζικό λογαριασμό, εκκαθάριση myData ή Excel-σε-PDF).
            Τα ποσά εξάγονται στο πρόγραμμα περιήγησής σας — δεν αποστέλλονται σε διακομιστή.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />
        <button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={state === "working"} style={{ padding: "12px 20px" }}>
          {state === "working" ? "Ανάγνωση PDF…" : "📄 Επίλεξε αρχείο PDF"}
        </button>
        {fileName && <p className="note">Αρχείο: <b>{fileName}</b></p>}
        {error && <div className="auth-notice bad">{error}</div>}

        {state === "review" && (
          <div className="scan-summary">
            <div className="scan-stat"><span>Έσοδα</span><b className="t-income">{eur(revenue)}</b></div>
            <div className="scan-stat"><span>Έξοδα</span><b className="t-expense">{eur(expenses)}</b></div>
            <div className="scan-stat"><span>Καθαρά κέρδη</span><b>{eur(revenue - expenses)}</b></div>
            <div className="scan-stat"><span>Αναγνωρισμένα</span><b>{counts.income + counts.expense} / {entries.length}</b></div>
          </div>
        )}
      </div>

      <div className="calc-results">
        {state !== "review" ? (
          <div style={{ color: "var(--faint)", fontSize: 14, lineHeight: 1.7 }}>
            <p>Πώς δουλεύει:</p>
            <ol style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Επιλέξτε το PDF σας.</li>
              <li>Ελέγξτε τις προτάσεις — χαρακτηρίστε κάθε γραμμή ως <b>Έσοδο</b>, <b>Έξοδο</b> ή <b>Παράλειψη</b>.</li>
              <li>Πατήστε «Χρήση στους υπολογισμούς» για να γεμίσουν τα εργαλεία.</li>
            </ol>
            <p style={{ marginTop: 12 }}>Η αυτόματη ταξινόμηση είναι βοηθητική — ελέγξτε την πάντα. Η τελική ευθύνη των αριθμών είναι δική σας.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {entries.length === 0 ? (
              <p className="note">Δεν βρέθηκαν γραμμές με ποσά.</p>
            ) : (
              <ul className="scan-list">
                {entries.map((e) => (
                  <li key={e.id} className={`scan-row ${e.kind === "skip" ? "off" : ""}`}>
                    <div className="scan-row-main">
                      <span className="scan-label" title={e.label}>{e.label}</span>
                      <input
                        className="input scan-amount"
                        inputMode="decimal"
                        value={eur(e.amount, 2).replace("€", "").replace(/\s/g, "")}
                        onChange={(ev) => setAmount(e.id, ev.target.value)}
                      />
                    </div>
                    <div className="scan-btns" role="group" aria-label="Κατηγορία">
                      <button type="button" className={e.kind === "income" ? "on inc" : ""} onClick={() => toggleKind(e.id, "income")}>Έσοδο</button>
                      <button type="button" className={e.kind === "expense" ? "on exp" : ""} onClick={() => toggleKind(e.id, "expense")}>Έξοδο</button>
                      <button type="button" className={e.kind === "skip" ? "on skp" : ""} onClick={() => toggleKind(e.id, "skip")}>✕</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={counts.income + counts.expense === 0}
                onClick={() => onApply({ revenue, expenses })}
              >
                → Χρήση στους υπολογισμούς
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={counts.income + counts.expense === 0 || saved}
                onClick={() => void handleSave()}
              >
                {saved ? "✓ Αποθηκεύτηκε στα Έγγραφα" : "📁 Αποθήκευση στα Έγγραφα"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={reset}>🔄 Νέο αρχείο</button>
            </div>
            {saved && (
              <p className="note" style={{ color: "var(--success)" }}>
                ✓ Το έγγραφο αποθηκεύτηκε — βρες το στη σελίδα <b>Έγγραφα</b>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
