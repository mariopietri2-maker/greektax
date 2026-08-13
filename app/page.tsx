"use client";

import { useState } from "react";
import { IncomeCalc } from "@/components/IncomeCalc";
import { SelfEmployedCalc } from "@/components/SelfEmployedCalc";
import { VatCalc } from "@/components/VatCalc";
import { NetSalaryCalc } from "@/components/NetSalaryCalc";
import { CorporateCalc } from "@/components/CorporateCalc";

const TOOLS = [
  { id: "income", label: "Φόρος εισοδήματος", icon: "💶" },
  { id: "salary", label: "Καθαρός μισθός", icon: "🧾" },
  { id: "self", label: "Ελεύθερος επαγγελματίας", icon: "💼" },
  { id: "corp", label: "Εταιρεία", icon: "🏢" },
  { id: "vat", label: "ΦΠΑ", icon: "🧮" },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export default function Home() {
  const [active, setActive] = useState<ToolId>("income");

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <a href="#" className="brand">
            <span className="brand-badge">Γ</span>
            GreekTax<span style={{ fontWeight: 500, color: "var(--muted)", fontSize: 14 }}>GR</span>
          </a>
          <ul className="nav-links">
            <li><a href="#tools">Υπολογιστές</a></li>
            <li><a href="#rules">Κλίμακες 2025</a></li>
            <li><a href="#faq">Συχνές ερωτήσεις</a></li>
          </ul>
        </div>
      </nav>

      <header className="hero">
        <div className="container">
          <span className="eyebrow">Φορολογικό έτος 2025 · Δωρεάν εργαλεία</span>
          <h1>
            Οι φόροι σου, <span className="text-grad">απλοί και καθαροί</span>
          </h1>
          <p>
            Υπολόγισε σε δευτερόλεπτα το φόρο εισοδήματος, τον καθαρό μισθό, το τεκμαρτό εισόδημα,
            τη φορολογία εταιρειών και το ΦΠΑ — με τη φορολογική κλίμακα του 2025.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#tools">Άρχισε τον υπολογισμό</a>
            <a className="btn btn-ghost" href="#rules">Δες τις κλίμακες</a>
          </div>
          <div className="stat-strip">
            <div className="stat-card"><b>9–44%</b><span>Κλίμακα φυσικών προσώπων</span></div>
            <div className="stat-card"><b>22%</b><span>Φόρος νομικών προσώπων</span></div>
            <div className="stat-card"><b>€12.320</b><span>Βάση τεκμαρτού εισοδήματος</span></div>
            <div className="stat-card"><b>13,87%</b><span>Εισφορές ΕΦΚΑ μισθωτού</span></div>
          </div>
        </div>
      </header>

      <main>
        <section className="section" id="tools">
          <div className="container">
            <span className="eyebrow">Υπολογιστές</span>
            <h2 className="section-title">Διάλεξε το εργαλείο σου</h2>
            <p className="section-sub" style={{ marginBottom: 26 }}>
              Πέντε υπολογιστές για μισθωτούς, ελεύθερους επαγγελματίες, επιχειρήσεις και όχι μόνο.
              Τα αποτελέσματα ενημερώνονται αυτόματα καθώς πληκτρολογείς.
            </p>
            <div className="tabs" role="tablist">
              {TOOLS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active === t.id}
                  className={active === t.id ? "active" : ""}
                  onClick={() => setActive(t.id)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            {active === "income" && <IncomeCalc />}
            {active === "salary" && <NetSalaryCalc />}
            {active === "self" && <SelfEmployedCalc />}
            {active === "corp" && <CorporateCalc />}
            {active === "vat" && <VatCalc />}
          </div>
        </section>

        <section className="section section-alt" id="rules">
          <div className="container">
            <span className="eyebrow">Κλίμακες 2025</span>
            <h2 className="section-title">Η βάση των υπολογισμών</h2>
            <div className="cols" style={{ marginTop: 26 }}>
              <div>
                <p className="result-label" style={{ fontSize: 15, marginBottom: 12 }}>Φυσικά πρόσωπα — μισθωτοί/συνταξιούχοι</p>
                <div className="rule-grid">
                  <div className="rule-card"><b>9%</b><span>Έως €10.000</span></div>
                  <div className="rule-card"><b>22%</b><span>€10.001 – €20.000</span></div>
                  <div className="rule-card"><b>28%</b><span>€20.001 – €30.000</span></div>
                  <div className="rule-card"><b>36%</b><span>€30.001 – €40.000</span></div>
                  <div className="rule-card"><b>44%</b><span>Άνω των €40.000</span></div>
                  <div className="rule-card"><b>€777</b><span>Μείωση φόρου μισθωτών</span></div>
                </div>
              </div>
              <div>
                <p className="result-label" style={{ fontSize: 15, marginBottom: 12 }}>Ενιαίοι συντελεστές</p>
                <div className="rule-grid">
                  <div className="rule-card"><b>22%</b><span>Φόρος νομικών προσώπων (Α.Ε., Ι.Κ.Ε., Ο.Ε.)</span></div>
                  <div className="rule-card"><b>5%</b><span>Παρακράτηση μερίσματος</span></div>
                  <div className="rule-card"><b>13,87%</b><span>Εισφορές ΕΦΚΑ — μισθωτός</span></div>
                  <div className="rule-card"><b>24% / 13% / 6%</b><span>Συντελεστές ΦΠΑ</span></div>
                  <div className="rule-card"><b>€12.320</b><span>Βάση τεκμαρτού εισοδήματος 2025 (880×14)</span></div>
                  <div className="rule-card"><b>100%</b><span>Προκαταβολή φόρου επιχειρήσεων</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="container">
            <span className="eyebrow">Εργαλεία</span>
            <h2 className="section-title">Ό,τι χρειάζεσαι για τη δήλωση</h2>
            <div className="tool-grid" style={{ marginTop: 26 }}>
              <div className="tool-card">
                <div className="tool-icon">🏠</div>
                <h3>Μισθωτοί & συντάξεις</h3>
                <p>Φόρος κλίμακας, μείωση φόρου ανά τέκνο, καθαρός μισθός και κόστος εργοδότη.</p>
              </div>
              <div className="tool-card">
                <div className="tool-icon">💼</div>
                <h3>Ελεύθεροι επαγγελματίες</h3>
                <p>Τεκμαρτό εισόδημα, προσαυξήσεις μισθοδοσίας/τζίρου και προκαταβολή φόρου.</p>
              </div>
              <div className="tool-card">
                <div className="tool-icon">🏢</div>
                <h3>Επιχειρήσεις</h3>
                <p>Φορολογία νομικών προσώπων 22% και καθαρό μέρισμα μετά την παρακράτηση 5%.</p>
              </div>
              <div className="tool-card">
                <div className="tool-icon">🧾</div>
                <h3>Καθαρός μισθός</h3>
                <p>Από μεικτά σε καθαρά: ΕΦΚΑ, παρακράτηση και μηνιαίο net σε μία οθόνη.</p>
              </div>
              <div className="tool-card">
                <div className="tool-icon">🧮</div>
                <h3>ΦΠΑ</h3>
                <p>Πρόσθεσε ή απόσπασε ΦΠΑ 24/13/6% από οποιοδήποτε ποσό, άμεσα.</p>
              </div>
              <div className="tool-card">
                <div className="tool-icon">🗓️</div>
                <h3>Υπενθυμίσεις (σύντομα)</h3>
                <p>Προθεσμίες δηλώσεων και πληρωμών μέσα στο εργαλείο — έρχεται σύντομα.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="faq">
          <div className="container">
            <span className="eyebrow">FAQ</span>
            <h2 className="section-title" style={{ textAlign: "center" }}>Συχνές ερωτήσεις</h2>
            <div className="faq" style={{ marginTop: 26 }}>
              <details className="faq-item">
                <summary>Μέχρι πότε υποβάλλεται η δήλωση για το έτος 2025;</summary>
                <div className="faq-body">
                  Η δήλωση Ε1 για τα εισοδήματα του 2025 υποβάλλεται ψηφιακά μέσω myAADE, συνήθως από τον Μάρτιο έως τα μέσα έτους επόμενου έτους. Ο φόρος εξοφλείται σε 8 δόσεις από τον Ιούλιο.
                </div>
              </details>
              <details className="faq-item">
                <summary>Τι σημαίνει «τεκμαρτό εισόδημα» για τους ελεύθερους επαγγελματίες;</summary>
                <div className="faq-body">
                  Είναι ένα ελάχιστο φορολογητέο εισόδημα που προσδιορίζει ο νόμος (βασικά ο ετήσιος κατώτατος μισθός ×14, με πολλαπλασιαστές ανά έτη δραστηριότητας). Αν δηλώσεις λιγότερα κέρδη, φορολογείσαι έστω και για αυτό το ελάχιστο.
                </div>
              </details>
              <details className="faq-item">
                <summary>Ο υπολογισμός είναι 100% ακριβής;</summary>
                <div className="faq-body">
                  Όχι — είναι εκτιμητικός. Εξαιρούνται ειδικές περιπτώσεις (απαλλαγές, εκπτώσεις δαπανών, εισφορά αλληλεγγύης, λοιπά τεκμήρια). Για πιστοποίηση βασίσου στο λογιστή σου ή τη δήλωση Ε1.
                </div>
              </details>
              <details className="faq-item">
                <summary>Ισχύει η κλίμακα του εργαλείου και για το 2024;</summary>
                <div className="faq-body">
                  Οι συντελεστές (9/22/28/36/44) είναι ίδιοι για τα φορολογικά έτη 2024 και 2025. Το εργαλείο δίνει δυνατότητα επιλογής έτους για τη σωστή βάση του τεκμαρτού εισοδήματος.
                </div>
              </details>
              <details className="faq-item">
                <summary>Πληρώνω προκαταβολή φόρου ως επιχείρηση;</summary>
                <div className="faq-body">
                  Ναι. Οι επιτηδευματίες πληρώνουν προκαταβολή φόρου 100% για το επόμενο έτος μαζί με τη δήλωση. Ο μισθωτός δεν επιβαρύνεται με προκαταβολή.
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="disclaimer">
              <span className="ic">⚠️</span>
              <p>
                Τα αποτελέσματα είναι ενδεικτικά και προορίζονται για ενημέρωση και προγραμματισμό. Δεν αποτελούν
                φορολογική συμβουλή. Για την υποβολή της δήλωσής σου, συμβουλεύσου επαγγελματία λογιστή ή φοροτεχνικό.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span>GreekTax GR — Υπολογιστές φόρων Ελλάδας · Έτος 2025</span>
          <span>Κλίμακες από τον ν. 4172/2013 · Δεδομένα 2025</span>
        </div>
      </footer>
    </>
  );
}