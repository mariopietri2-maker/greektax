"use client";

import { useState } from "react";
import Link from "next/link";

interface Deadline {
  id: string;
  month: string;
  day: string;
  title: string;
  desc: string;
  type: "Φόρος" | "Εισφορές" | "ΦΠΑ" | "Δήλωση" | "Άλλο";
}

const DEADLINES: Deadline[] = [
  { id: "e1-filing-recurring", month: "Απρ–Μάι", day: "—", title: "Υποβολή δήλωσης Ε1 (φυσικά πρόσωπα)", desc: "Ψηφιακά μέσω myAADE. Η ακριβής ημερομηνία ανακοινώνεται κάθε χρόνο.", type: "Δήλωση" },
  { id: "e1-first-installment", month: "Ιούλ", day: "31", title: "Α' δόση φόρου εισοδήματος", desc: "Πρώτη δόση της εξόφλησης της δήλωσης (έως 8 δόσεις).", type: "Φόρος" },
  { id: "vat-q2", month: "Ιούλ", day: "20", title: "ΦΠΑ Β' τριμήνου", desc: "Υποβολή & πληρωμή της περιοδικής δήλωσης ΦΠΑ (τελευταία ημέρα εργάσιμη του επόμενου μήνα).", type: "ΦΠΑ" },
  { id: "efka-q3", month: "Ιούλ–Σεπ", day: "—", title: "Εισφορές ΕΦΚΑ γ' τριμήνου", desc: "Μηνιαίες εισφορές ελεύθερων επαγγελματιών — πληρώνονται έως το τέλος κάθε μήνα.", type: "Εισφορές" },
  { id: "vat-q3", month: "Οκτ", day: "20", title: "ΦΠΑ Γ' τριμήνου", desc: "Περιοδική δήλωση ΦΠΑ για Ιούλιο–Σεπτέμβριο.", type: "ΦΠΑ" },
  { id: "enfia", month: "Σεπ–Νοέ", day: "—", title: "ΕΝΦΙΑ", desc: "Ετήσιος φόρος ακίνητης περιουσίας — εξόφληση σε δόσεις, συνήθως από τέλος Σεπτεμβρίου.", type: "Φόρος" },
  { id: "cf-account", month: "Δεκ", day: "31", title: "Τήρηση βιβλίων & e-τιμολόγηση", desc: "Ετήσια ευθύνη: τα έσοδα/έξοδα μέσω myDATA να είναι καταχωρημένα σωστά όλο τον χρόνο.", type: "Άλλο" },
  { id: "advance-second", month: "Δεκ", day: "—", title: "Β' δόση προκαταβολής φόρου", desc: "Δεύτερη δόση της προκαταβολής 100% για επιτηδευματίες/επιχειρήσεις.", type: "Φόρος" },
];

const TYPE_COLORS: Record<Deadline["type"], string> = {
  Φόρος: "var(--danger)",
  ΦΠΑ: "var(--accent)",
  Δήλωση: "var(--success)",
  Εισφορές: "var(--warning, #d97706)",
  Άλλο: "var(--muted)",
};

const STORAGE_KEY = "greektax-reminders-v1";

export default function DeadlinesPage() {
  const [done, setDone] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [filter, setFilter] = useState<Deadline["type"] | "all">("all");

  const toggle = (id: string) => {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDone(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };

  const types: (Deadline["type"] | "all")[] = ["all", "Δήλωση", "Φόρος", "ΦΠΑ", "Εισφορές", "Άλλο"];
  const visible = DEADLINES.filter((d) => filter === "all" || d.type === filter);
  const doneCount = done.size;

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="topbar">
        <Link href="/" className="brand">
          <span className="brand-badge">Γ</span>
          GreekTax GR
        </Link>
        <div className="user-menu">
          <Link href="/" className="btn btn-ghost btn-sm">← Υπολογιστές</Link>
        </div>
      </div>

      <span className="eyebrow">Φορολογικές ημερομηνίες 2025</span>
      <h1 className="section-title">Προθεσμίες</h1>
      <p className="section-sub" style={{ marginBottom: 12 }}>
        Οι σημαντικές προθεσμίες της χρονιάς. Σημείωσε ό,τι ολοκληρώνεις — οι επιλογές σου σώζονται σε αυτόν τον browser.
      </p>
      {doneCount > 0 && (
        <div className="auth-notice good">✓ Έχεις ολοκληρώσει {doneCount} από {DEADLINES.length} υποχρεώσεις.</div>
      )}

      <div className="tabs" role="tablist" aria-label="Φίλτρο κατηγορίας">
        {types.map((t) => (
          <button
            key={t as string}
            type="button"
            role="tab"
            aria-selected={filter === t}
            className={filter === t ? "active" : ""}
            onClick={() => setFilter(t)}
          >
            {t === "all" ? `Όλα (${DEADLINES.length})` : t}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map((d) => (
          <div key={d.id} className={`deadline-card ${done.has(d.id) ? "done" : ""}`}>
            <label className="deadline-check">
              <input
                type="checkbox"
                checked={done.has(d.id)}
                onChange={() => toggle(d.id)}
                aria-label={`Σημείωσε: ${d.title}`}
              />
              <span />
            </label>
            <div className="deadline-body">
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span className="deadline-month">{d.month}{d.day !== "—" ? ` ${d.day}` : ""}</span>
                <span className="deadline-tag" style={{ color: TYPE_COLORS[d.type] }}>{d.type}</span>
              </div>
              <b>{d.title}</b>
              <p>{d.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="note" style={{ marginTop: 22 }}>
        Οι προθεσμίες είναι ενδεικτικές και ενδέχεται να αλλάξουν από την ΑΑΔΕ. Στηρίξου στην επίσημη ενημέρωση (AADE) για προγραμματισμό.
      </p>
    </main>
  );
}