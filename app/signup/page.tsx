import Link from "next/link";
import { redirect } from "next/navigation";
import { signup } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          <span className="brand-badge">Γ</span>
          GreekTax GR
        </Link>
        <h1 className="auth-title">Δημιούργησε λογαριασμό</h1>
        <p className="auth-sub">
          Δωρεάν. Αποθήκευσε τους υπολογισμούς σου και τα στοιχεία του προφίλ σου.
        </p>

        {error && <div className="auth-notice bad">{error}</div>}

        <form action={signup} className="auth-form">
          <div className="field">
            <label>Ονοματεπώνυμο</label>
            <input className="input" type="text" name="fullName" required autoComplete="name" placeholder="Μαρία Παπαδοπούλου" />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Κωδικός <span className="hint">τουλάχιστον 6 χαρακτήρες</span></label>
            <input className="input" type="password" name="password" minLength={6} required autoComplete="new-password" placeholder="••••••••" />
          </div>
          <div className="field">
            <label>Είσαι…</label>
            <div className="auth-types">
              <label className="auth-type">
                <input type="radio" name="profileType" value="individual" defaultChecked />
                <span>🧑</span>
                <b>Μισθωτός</b>
                <small>Μισθός, σύνταξη, ενοίκια</small>
              </label>
              <label className="auth-type">
                <input type="radio" name="profileType" value="self" />
                <span>💼</span>
                <b>Ελεύθερος επαγγελματίας</b>
                <small>Ατομική επιχείρηση</small>
              </label>
              <label className="auth-type">
                <input type="radio" name="profileType" value="business" />
                <span>🏢</span>
                <b>Επιχείρηση</b>
                <small>Α.Ε., Ι.Κ.Ε., Ο.Ε.</small>
              </label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Δημιουργία λογαριασμού</button>
        </form>

        <p className="auth-alt">
          Έχεις ήδη λογαριασμό; <a href="/login">Συνδέσου</a>
        </p>
      </div>
    </main>
  );
}