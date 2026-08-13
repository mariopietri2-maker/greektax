import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentsManager } from "@/components/DocumentsManager";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!user || !supabase) redirect("/login");

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <DocumentsManager />
    </main>
  );
}