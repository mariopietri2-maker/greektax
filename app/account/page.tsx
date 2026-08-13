import Link from "next/link";
import { redirect } from "next/navigation";
import { logout, updateProfile } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, profile_type, email, created_at")
    .eq("id", user.id)
    .single();

  const type = (profile?.profile_type as "individual" | "self" | "business") ?? "individual";

  const typeLabels: Record<string, { icon: string; label: string; sub: string }> = {
    individual: { icon: "🧑", label: "Μισθωτός", sub: "Φυσικό πρόσωπο" },
    self: { icon: "💼", label: "Ελεύθερος επαγγελματίας", sub: "Ατομική επιχείρηση" },
    business: { icon: "🏢", label: "Επιχείρηση", sub: "Α.Ε., Ι.Κ.Ε., Ο.Ε." },
  };

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="topbar">
        <Link href="/" className="brand">
          <span className="brand-badge">Γ</span>
          GreekTax GR
        </Link>
        <div className="user-menu">
          <span className="user-chip"><span className="dot" /> {user.email}</span>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost btn-sm">Αποσύνδεση</button>
          </form>
        </div>
      </div>

      <span className="eyebrow">Ο λογαριασμός μου</span>
      <h1 className="section-title">Προφίλ</h1>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        Τα στοιχεία σου αποθηκεύονται και χρησιμοποιούνται στους υπολογισμούς.
      </p>

      {saved === "1" && <div className="auth-notice good">✓ Το προφίλ σου ενημερώθηκε.</div>}
      {error && <div className="auth-notice bad">{error}</div>}

      <div className="calc" style={{ maxWidth: 720 }}>
        <form action={updateProfile} className="calc-inputs" style={{ border: "none" }}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={user.email ?? ""} readOnly />
            <p className="note">Το email δεν μπορεί να αλλαχθεί από εδώ.</p>
          </div>
          <div className="field">
            <label>Ονοματεπώνυμο</label>
            <input
              className="input"
              type="text"
              name="fullName"
              required
              defaultValue={profile?.full_name ?? ""}
              placeholder="Μαρία Παπαδοπούλου"
            />
          </div>
          <div className="field">
            <label>Κατηγορία φορολογούμενου</label>
            <div className="auth-types">
              {Object.entries(typeLabels).map(([value, t]) => (
                <label className="auth-type" key={value}>
                  <input type="radio" name="profileType" value={value} defaultChecked={type === value} />
                  <span>{t.icon}</span>
                  <div>
                    <b>{t.label}</b>
                    <small>{t.sub}</small>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="submit" className="btn btn-primary">Αποθήκευση</button>
            <Link href="/" className="btn btn-ghost">Πίσω στους υπολογιστές</Link>
          </div>
        </form>
      </div>
    </main>
  );
}