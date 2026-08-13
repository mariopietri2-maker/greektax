"use client";

import { useState } from "react";
import Link from "next/link";
import { IncomeCalc } from "@/components/IncomeCalc";
import { SelfEmployedCalc } from "@/components/SelfEmployedCalc";
import { VatCalc } from "@/components/VatCalc";
import { NetSalaryCalc } from "@/components/NetSalaryCalc";
import { CorporateCalc } from "@/components/CorporateCalc";
import { PdfScanner } from "@/components/PdfScanner";
import { PROFILES, TOOLS, profileById, type Profile, type ToolId } from "@/lib/tools";
import type { SavedCalculation } from "@/lib/supabase/calcs";
import type { ProfileType } from "@/app/actions/auth";

interface Scanned {
  revenue: number;
  expenses: number;
}

interface Props {
  email: string;
  fullName: string;
  profileType: ProfileType;
  recentCalcs: SavedCalculation[];
}

const TOOL_LABELS: Record<string, string> = {
  income: "Φόρος εισοδήματος",
  salary: "Καθαρός μισθός",
  self: "Ελεύθερος επαγγελματίας",
  corp: "Εταιρεία",
  vat: "ΦΠΑ",
};

export function Dashboard({ email, fullName, profileType, recentCalcs }: Props) {
  const [profile, setProfile] = useState<Profile>(profileType);
  const activeProfile = profileById(profile);
  const [active, setActive] = useState<ToolId>(activeProfile.defaultTool);
  const [scanned, setScanned] = useState<Scanned | null>(null);
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    return h < 5 ? "Καληνύχτα" : h < 12 ? "Καλημέρα" : h < 18 ? "Καλησπέρα" : "Καληνύχτα";
  });

  const firstName = fullName.split(" ")[0].trim();

  const chooseProfile = (p: Profile) => {
    const prof = profileById(p);
    setProfile(p);
    setActive(prof.defaultTool);
    setScanned(null);
  };

  const switchTool = (t: ToolId) => setActive(t);

  const applyScan = (s: Scanned) => {
    setScanned(s);
    setActive(profile === "business" ? "corp" : "self");
  };

  return (
    <div className="dash">
      <aside className="dash-side">
        <Link href="/" className="dash-brand">
          <span className="brand-badge">Γ</span>
          GreekTax<span style={{ fontWeight: 500, color: "var(--muted)", fontSize: 14 }}>GR</span>
        </Link>

        <span className="dash-label" style={{ marginTop: 4 }}>Εργαλεία</span>
        <nav className="dash-nav">
          {activeProfile.tools.map((t) => (
            <button
              key={t}
              type="button"
              className={`dash-link ${active === t ? "active" : ""}`}
              onClick={() => switchTool(t)}
            >
              <span className="dash-ic">{TOOLS[t].icon}</span>
              {TOOLS[t].label}
            </button>
          ))}
          <Link href="/deadlines" className="dash-link">
            <span className="dash-ic">🗓️</span> Προθεσμίες
          </Link>
          <Link href="/history" className="dash-link">
            <span className="dash-ic">🧾</span> Ιστορικό
          </Link>
          <Link href="/account" className="dash-link">
            <span className="dash-ic">⚙️</span> Λογαριασμός
          </Link>
        </nav>

        <div className="dash-side-foot">
          <div className="dash-user">
            <span className="dash-avatar">{(firstName || email)[0]?.toUpperCase() ?? "Γ"}</span>
            <div>
              <b>{firstName || "Χρήστης"}</b>
              <small>{email}</small>
            </div>
          </div>
          <a href="/account" className="btn btn-ghost btn-sm">Προφίλ</a>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-hero">
          <div className="container">
            <span className="eyebrow">Ο προσωπικός σου χώρος</span>
            <h1>
              {greeting}, <span className="text-grad">{firstName || "καλώς ήρθες"}</span>
            </h1>
            <p className="section-sub" style={{ marginBottom: 24 }}>
              Επέλεξε εργαλείο, γράψε τα στοιχεία σου και αποθήκευσε τους υπολογισμούς σου για να
              τους βρεις ξανά στο ιστορικό.
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
                  <b>{p.short}</b>
                  <small>{p.desc}</small>
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="container" style={{ paddingTop: 30, paddingBottom: 70 }}>
          <span className="profile-badge">→ Εργαλεία για: {activeProfile.title}</span>
          <div className="dash-tabs">
            {activeProfile.tools.map((t) => (
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

          <div className="dash-tool">
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
            {active === "scan" && <PdfScanner onApply={applyScan} />}
          </div>

          <section className="dash-recent" style={{ marginTop: 34 }}>
            <span className="eyebrow">Πρόσφατα</span>
            <h2 className="section-title" style={{ fontSize: 26 }}>Πρόσφατοι υπολογισμοί</h2>
            {recentCalcs.length === 0 ? (
              <div className="auth-notice" style={{ marginTop: 14 }}>
                Δεν έχεις αποθηκεύσει ακόμα κανέναν υπολογισμό. Χρησιμοποίησε το κουμπί «Αποθήκευση»
                σε οποιοδήποτε εργαλείο για να τον δεις εδώ.
              </div>
            ) : (
              <div className="recent-list" style={{ marginTop: 16 }}>
                {recentCalcs.map((c) => (
                  <a key={c.id} href="/history" className="recent-item">
                    <span className="recent-ic">{TOOLS[c.tool as ToolId]?.icon ?? "📝"}</span>
                    <div>
                      <b>{c.title}</b>
                      <small>{TOOL_LABELS[c.tool as string] ?? c.tool} · {new Date(c.created_at).toLocaleDateString("el-GR")}</small>
                    </div>
                    <span className="recent-arrow">→</span>
                  </a>
                ))}
              </div>
            )}
            <Link href="/history" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>
              Όλο το ιστορικό →
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}