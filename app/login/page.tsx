import Link from "next/link";
import { redirect } from "next/navigation";
import { login } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; confirmed?: string }> }) {
  const { error, confirmed } = await searchParams;
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (user) redirect("/");

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          <span className="brand-badge">Γ</span>
          GreekTax GR
        </Link>
        <h1 className="auth-title">Καλώς ήρθες πίσω</h1>
        <p className="auth-sub">Συνδέσου για να δεις και να αποθηκεύσεις τους υπολογισμούς σου.</p>

        {confirmed === "1" && (
          <div className="auth-notice good">✓ Ο λογαριασμός σου δημιουργήθηκε. Προχώρησε σε σύνδεση.</div>
        )}
        {error && <div className="auth-notice bad">{error}</div>}

        <form action={login} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Κωδικός</label>
            <input className="input" type="password" name="password" required autoComplete="current-password" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Σύνδεση</button>
        </form>

        <p className="auth-alt">
          Δεν έχεις λογαριασμό; <a href="/signup">Δημιούργησέ τον εδώ</a>
        </p>
      </div>
    </main>
  );
}