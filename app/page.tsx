"use client";

import { useState } from "react";
import { IncomeCalc } from "@/components/IncomeCalc";
import { SelfEmployedCalc } from "@/components/SelfEmployedCalc";
import { VatCalc } from "@/components/VatCalc";
import { NetSalaryCalc } from "@/components/NetSalaryCalc";
import { CorporateCalc } from "@/components/CorporateCalc";
import { PdfScanner } from "@/components/PdfScanner";
import { EnfiaCalc } from "@/components/EnfiaCalc";
import { RentalCalc } from "@/components/RentalCalc";
import { DividendCalc } from "@/components/DividendCalc";
import { PROFILES, TOOLS, GROUPS, groupedTools, profileById, type Profile, type ToolId } from "@/lib/tools";

interface Scanned {
  revenue: number;
  expenses: number;
}

export default function Home() {
  const [profile, setProfile] = useState<Profile>("individual");
  const activeProfile = profileById(profile);
  const [active, setActive] = useState<ToolId>(activeProfile.defaultTool);
  const [scanned, setScanned] = useState<Scanned | null>(null);

  const chooseProfile = (p: Profile) => {
    const prof = profileById(p);
    setProfile(p);
    setActive(prof.defaultTool);
    setScanned(null);
  };

  const switchTool = (t: ToolId) => {
    // only allow tools for current profile
    if (activeProfile.tools.includes(t)) setActive(t);
  };

  const applyScan = (s: Scanned) => {
    setScanned(s);
    setActive(profile === "business" ? "corp" : "self");
  };

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <a href="#" className="brand">
            <span className="brand-badge">Γ</span>
            GreekTax<span style={{ fontWeight: 500, color: "var(--muted)", fontSize: 14 }}>GR</span>
          </a>
          <ul className="nav-links">
            <li><a href="#tools">Ποιος είσαι</a></li>
            <li><a href="#rules">Κλίμακες 2025</a></li>
            <li><a href="/deadlines">Προθεσμίες</a></li>
            <li><a href="/documents">Έγγραφα</a></li>
            <li><a href="#faq">Συχνές ερωτήσεις</a></li>
            <li><a href="/history">Ιστορικό</a></li>
            <li><a href="/account">Λογαριασμός</a></li>
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
            Υπολόγισε σε δευτερόλεπτα το φόρο που σε αφορά — διαφορετικοί υπολογισμοί για
            μισθωτούς, ελεύθερους επαγγελματίες και επιχειρήσεις, με την κλίμακα του 2025.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#tools">Διάλεξε ποιος είσαι</a>
            <a className="btn btn-ghost" href="#rules">Δες τις κλίμακες</a>
          </div>
          <div className="stat-strip">
            <div className="stat-card"><b>9–44%</b><span>Κλίμακα φυσικών προσώπων</span></div>
            <div className="stat-card"><b>€12.320</b><span>Ελάχιστο τεκμαρτό εισόδημα</span></div>
            <div className="stat-card"><b>22%</b><span>Φόρος νομικών προσώπων</span></div>
            <div className="stat-card"><b>13,87%</b><span>Εισφορές ΕΦΚΑ μισθωτού</span></div>
          </div>
        </div>
      </header>

      <main>
        <section className="section" id="tools">
          <div className="container">
            <span className="eyebrow">Βήμα 1 — Ποιος φορολογούμενος είσαι;</span>
            <h2 className="section-title">Διάλεξε την κατηγορία σου</h2>
            <p className="section-sub" style={{ marginBottom: 26 }}>
              Κάθε κατηγορία φορολογείται διαφορετικά. Επέλεξε το προφίλ σου και θα δεις
              μόνο τα εργαλεία που σε αφορούν.
            </p>
            <div className="profile-grid" role="tablist" aria-label="Κατηγορία φορολογούμενου">
              {PROFILES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={profile === p.id}
                  className={`profile-card ${profile === p.id ? "active" : ""}`}
                  onClick={() => chooseProfile(p.id)}
                >
                  <span className="pic">{p.icon}</span>
                  <b>{p.title}</b>
                  <small>{p.desc}</small>
                </button>
              ))}
            </div>

            <span className="profile-badge">
              → Εργαλεία για: {activeProfile.title}
            </span>
            {groupedTools(profile).map(({ group, tools }) => (
              <div key={group} className="tool-group">
                <span className="tool-group-label">{GROUPS.find((g) => g.id === group)!.label}</span>
                <div className="tabs" role="tablist" aria-label={GROUPS.find((g) => g.id === group)!.label}>
                  {tools.map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="tab"
                      aria-selected={active === t}
                      className={active === t ? "active" : ""}
                      onClick={() => switchTool(t)}
                    >
                      {TOOLS[t].icon} {TOOLS[t].label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {active === "income" && <IncomeCalc key={profile} defaultType={activeProfile.defaultIncomeType} />}
            {active === "salary" && <NetSalaryCalc />}
            {active === "self" && (
              <SelfEmployedCalc
                key={profile}
                initialProfit={scanned ? Math.max(0, scanned.revenue - scanned.expenses) : undefined}
                initialRevenue={scanned ? scanned.revenue : undefined}
              />
            )}
            {active === "corp" && (
              <CorporateCalc
                key={profile}
                initialProfit={scanned ? Math.max(0, scanned.revenue - scanned.expenses) : undefined}
              />
            )}
            {active === "vat" && <VatCalc />}
            {active === "enfia" && <EnfiaCalc />}
            {active === "rent" && <RentalCalc />}
            {active === "dividend" && <DividendCalc />}
            {active === "scan" && <PdfScanner onApply={applyScan} />}
          </div>
        </section>

        <section className="section section-alt" id="rules">
          <div className="container">
            <span className="eyebrow">Κλίμακες 2025</span>
            <h2 className="section-title">Η βάση των υπολογισμών</h2>
            <div className="cols" style={{ marginTop: 26 }}>
              <div>
                <p className="result-label" style={{ fontSize: 15, marginBottom: 12 }}>Μισθωτοί / Φυσικά πρόσωπα</p>
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
                <p className="result-label" style={{ fontSize: 15, marginBottom: 12 }}>Ελεύθεροι επαγγελματίες</p>
                <div className="rule-grid">
                  <div className="rule-card"><b>€12.320</b><span>Βάση τεκμαρτού εισοδήματος 2025 (880×14)</span></div>
                  <div className="rule-card"><b>−67% / −33%</b><span>4ο & 5ο έτος δραστηριότητας</span></div>
                  <div className="rule-card"><b>+10% / +20% / +30%</b><span>7–9 / 10–12 / 12+ έτη</span></div>
                  <div className="rule-card"><b>100%</b><span>Προκαταβολή φόρου</span></div>
                  <div className="rule-card"><b>€50.000</b><span>Ανώτατο όριο τεκμαρτού</span></div>
                  <div className="rule-card"><b>&lt; 4 έτη</b><span>Απαλλαγή από τεκμήρια</span></div>
                </div>
                <p className="result-label" style={{ fontSize: 15, marginTop: 20, marginBottom: 12 }}>Επιχειρήσεις</p>
                <div className="rule-grid">
                  <div className="rule-card"><b>22%</b><span>Φόρος νομικών προσώπων (Α.Ε., Ι.Κ.Ε., Ο.Ε.)</span></div>
                  <div className="rule-card"><b>5%</b><span>Παρακράτηση μερίσματος</span></div>
                  <div className="rule-card"><b>24% / 13% / 6%</b><span>Συντελεστές ΦΠΑ</span></div>
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
                <div className="tool-icon">🧑</div>
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
                <div className="tool-icon">🏠</div>
                <h3>ΕΝΦΙΑ</h3>
                <p>Εκτίμησε τον φόρο ακίνητης περιουσίας από εμβαδόν, τιμή ζώνης και παλαιότητα.</p>
              </div>
              <div className="tool-card">
                <div className="tool-icon">🔑</div>
                <h3>Καθαρό ενοίκιο</h3>
                <p>Από μεικτό ενοίκιο σε καθαρό εισόδημα — 15% κατοικία, 24% επαγγελματικά.</p>
              </div>
              <div className="tool-card">
                <div className="tool-icon">💸</div>
                <h3>Μέρισμα & τόκοι</h3>
                <p>Μερίσματα 5% και τόκοι καταθέσεων 15% — από μικτό σε καθαρό ποσό.</p>
              </div>
              <div className="tool-card">
                <div className="tool-icon">📄</div>
                <h3>Σάρωση PDF εσόδων/εξόδων</h3>
                <p>Ανέβασε ψηφιακό PDF (τιμολόγια, τράπεζα, myData) και βγάλε έσοδα – έξοδα για επαγγελματίες & επιχειρήσεις.</p>
              </div>
              <div className="tool-card">
                <div className="tool-icon">📁</div>
                <h3>Έγγραφα</h3>
                <p>Μια οργανωμένη βιβλιοθήκη για όλα τα αρχεία σου — κατηγοριοποίησε, αναζήτησε και βρες ό,τι χρειάζεσαι.</p>
              </div>
              <div className="tool-card">
                <div className="tool-icon">🗓️</div>
                <h3>Προθεσμίες 2025</h3>
                <p>Ε1, ΦΠΑ, ΕΝΦΙΑ, δόσεις και ΕΦΚΑ σε ένα ημερολόγιο — σημείωσε ό,τι ολοκληρώνεις.</p>
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
                <summary>Γιατί χωρίζετε τους φορολογούμενους σε κατηγορίες;</summary>
                <div className="faq-body">
                  Μισθωτοί, ελεύθεροι επαγγελματίες και επιχειρήσεις έχουν εντελώς διαφορετικούς υπολογισμούς: κλίμακα με μείωση φόρου για τους μισθωτούς, ελάχιστο τεκμαρτό εισόδημα για τους επαγγελματίες και σταθερό συντελεστή 22% για τις επιχειρήσεις.
                </div>
              </details>
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