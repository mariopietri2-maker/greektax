import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: calcs } = await supabase
    .from("calculations")
    .select("id, tool, title, data, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const toolLabels: Record<string, { icon: string; label: string }> = {
    income: { icon: "💶", label: "Φόρος εισοδήματος" },
    salary: { icon: "🧾", label: "Καθαρός μισθός" },
    self: { icon: "💼", label: "Ελεύθερος επαγγελματίας" },
    corp: { icon: "🏢", label: "Εταιρεία" },
    vat: { icon: "🧮", label: "ΦΠΑ" },
  };

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="topbar">
        <Link href="/" className="brand">
          <span className="brand-badge">Γ</span>
          GreekTax GR
        </Link>
        <div className="user-menu">
          <a href="/account" className="btn btn-ghost btn-sm">Προφίλ</a>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost btn-sm">Αποσύνδεση</button>
          </form>
        </div>
      </div>

      <span className="eyebrow">Το ιστορικό μου</span>
      <h1 className="section-title">Αποθηκευμένοι υπολογισμοί</h1>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        Οι υπολογισμοί που αποθήκευσες από τα εργαλεία.
      </p>

      <div style={{ maxWidth: 860 }}>
        {!calcs || calcs.length === 0 ? (
          <div className="auth-notice">Δεν έχεις αποθηκεύσει ακόμα κανέναν υπολογισμό. Χρησιμοποίησε το κουμπί «Αποθήκευση» σε κάθε εργαλείο και θα εμφανιστεί εδώ.</div>
        ) : (
          <table className="tao-table">
            <thead>
              <tr>
                <th>Εργαλείο</th>
                <th>Τίτλος</th>
                <th>Στοιχεία</th>
                <th>Ημερομηνία</th>
              </tr>
            </thead>
            <tbody>
              {calcs.map((c) => {
                const t = toolLabels[c.tool as string] ?? { icon: "📝", label: c.tool };
                const data = (c.data ?? {}) as Record<string, unknown>;
                const detail = data.detail ? String(data.detail) : JSON.stringify(data).slice(0, 120);
                return (
                  <tr key={c.id}>
                    <td>
                      {t.icon} {t.label}
                    </td>
                    <td>{c.title}</td>
                    <td style={{ color: "var(--muted)", fontSize: 13 }}>{detail}</td>
                    <td style={{ whiteSpace: "nowrap", color: "var(--muted)", fontSize: 13 }}>
                      {new Date(c.created_at).toLocaleDateString("el-GR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}