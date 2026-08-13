"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import {
  deleteDocument,
  listDocuments,
  saveDocument,
  type DocCategory,
  type Document,
} from "@/lib/supabase/documents";
import { eur } from "@/lib/tax";

const CATEGORIES: DocCategory[] = ["Τιμολόγια", "Τράπεζα", "MyData", "Φορολογικά", "Λοιπά"];

export function DocumentsManager() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<DocCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocCategory>("Τιμολόγια");
  const [amount, setAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "good" | "bad"; msg: string } | null>(null);

  const load = useCallback(async () => {
    const list = await listDocuments();
    setDocs(list);
    setLoaded(true);
  }, []);

  useEffect(() => {
    let active = true;
    void listDocuments().then((list) => {
      if (active) {
        setDocs(list);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setTitle("");
    setAmount(0);
    setCategory("Τιμολόγια");
    setFormOpen(false);
  };

  const add = async () => {
    if (!title.trim()) {
      setNotice({ kind: "bad", msg: "Δώσε έναν τίτλο για το έγγραφο." });
      return;
    }
    setSaving(true);
    const res = await saveDocument({
      title: title.trim(),
      category,
      kind: amount < 0 ? "expense" : "income",
      amount: Math.abs(amount),
      items: [],
    });
    setSaving(false);
    if (res.ok) {
      setNotice({ kind: "good", msg: "✓ Το έγγραφο προστέθηκε." });
      resetForm();
      void load();
    } else {
      setNotice({ kind: "bad", msg: res.error ?? "Σφάλμα αποθήκευσης." });
    }
  };

  const remove = async (id: string) => {
    await deleteDocument(id);
    void load();
  };

  const visible = docs.filter((d) => {
    if (filter !== "all" && d.category !== filter) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalIncome = visible.filter((d) => d.kind !== "expense").reduce((s, d) => s + (d.amount > 0 ? d.amount : 0), 0);
  const totalExpense = visible.filter((d) => d.kind !== "income").reduce((s, d) => s + (d.amount < 0 ? Math.abs(d.amount) : 0), 0);

  return (
    <div>
      <div className="topbar">
        <Link href="/" className="brand">
          <span className="brand-badge">Γ</span>
          GreekTax GR
        </Link>
        <div className="user-menu">
          <a href="/account" className="btn btn-ghost btn-sm">Προφίλ</a>
          <FormLogout />
        </div>
      </div>

      <span className="eyebrow">Η βιβλιοθήκη εγγράφων μου</span>
      <h1 className="section-title">Έγγραφα</h1>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        Όλα τα αρχεία που αποθηκεύεις (CRM PDF scans, τιμολόγια, τράπεζες) σε ένα σημείο — οργανωμένα
        και πάντα προσβάσιμα.
      </p>

      {notice && <div className={`auth-notice ${notice.kind}`}>{notice.msg}</div>}

      <div className="doc-toolbar">
        <div className="doc-stats">
          <div className="scan-stat"><span>Έσοδα</span><b className="t-income">{eur(totalIncome)}</b></div>
          <div className="scan-stat"><span>Έξοδα</span><b className="t-expense">{eur(totalExpense)}</b></div>
          <div className="scan-stat"><span>Σύνολο</span><b>{visible.length}</b></div>
        </div>
        <div className="doc-actions">
          <input
            className="input"
            style={{ maxWidth: 260 }}
            placeholder="🔍 Αναζήτηση…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Αναζήτηση εγγράφων"
          />
          <div className="doc-filters" role="tablist" aria-label="Κατηγορία">
            <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Όλα</button>
            {CATEGORIES.map((c) => (
              <button key={c} type="button" className={filter === c ? "on" : ""} onClick={() => setFilter(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {formOpen ? (
        <div className="calc" style={{ maxWidth: 640, marginBottom: 24 }}>
          <div className="calc-inputs">
            <div className="field">
              <label>Τίτλος εγγράφου</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="π.χ. Τιμολόγιο ΜΑΡ 2026" />
            </div>
            <div className="field">
              <label>Κατηγορία</label>
              <div className="doc-filters">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" className={category === c ? "on" : ""} onClick={() => setCategory(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>
                <span>Ποσό (€)</span>
                <span className="hint">Αρνητικό = έξοδο</span>
              </label>
              <input
                className="input"
                inputMode="decimal"
                value={amount === 0 ? "" : String(amount)}
                onChange={(e) => setAmount(parseFloat(e.target.value.replace(",", ".")) || 0)}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void add()}>
                {saving ? "Αποθήκευση…" : "Πρόσθεσε έγγραφο"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>Ακύρωση</button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)} style={{ marginBottom: 24 }}>
          + Πρόσθεσε έγγραφο
        </button>
      )}

      {!loaded ? (
        <p className="note">Φόρτωση…</p>
      ) : docs.length === 0 ? (
        <div className="auth-notice" style={{ maxWidth: 640 }}>
          Δεν έχεις αποθηκεύσει ακόμα κανένα έγγραφο. Χρησιμοποίησε το κουμπί «Αποθήκευση στα Έγγραφα»
          στη Σάρωση PDF ή πρόσθεσε ένα χειροκίνητα.
        </div>
      ) : visible.length === 0 ? (
        <div className="auth-notice" style={{ maxWidth: 640 }}>
          Δεν βρέθηκαν έγγραφα για αυτό το φίλτρο.
        </div>
      ) : (
        <div className="doc-grid">
          {visible.map((d) => {
            const items = (d.items ?? []) as { label: string; amount: number; kind: string }[];
            return (
              <div className="doc-card" key={d.id}>
                <div className="doc-card-head">
                  <span className="doc-kind">{d.kind === "income" ? "⬆" : d.kind === "expense" ? "⬇" : "⇅"}</span>
                  <span className="deadline-tag">{d.category}</span>
                  <span className="doc-date">{new Date(d.created_at).toLocaleDateString("el-GR")}</span>
                  <button type="button" className="doc-del" onClick={() => void remove(d.id)} aria-label="Διαγραφή">✕</button>
                </div>
                <h3 className="doc-title">{d.title}</h3>
                <p
                  className={`doc-amount ${d.kind === "income" ? "t-income" : d.kind === "expense" ? "t-expense" : ""}`}
                  style={{ color: "var(--text)", fontWeight: 800, fontSize: 20 }}
                >
                  {eur(d.amount)}
                </p>
                {items.length > 0 && (
                  <details className="doc-details">
                    <summary>{items.length} γραμμές</summary>
                    <ul className="doc-items">
                      {items.map((it, i) => (
                        <li key={i}>
                          <span>{it.label}</span>
                          <b>{eur(it.amount)}</b>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormLogout() {
  return (
    <form action={logout}>
      <button type="submit" className="btn btn-ghost btn-sm">Αποσύνδεση</button>
    </form>
  );
}