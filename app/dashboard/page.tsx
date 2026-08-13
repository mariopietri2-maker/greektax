import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/Dashboard";
import type { SavedCalculation } from "@/lib/supabase/calcs";
import type { ProfileType } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!user || !supabase) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, profile_type")
    .eq("id", user.id)
    .single();

  const { data: calcs } = await supabase
    .from("calculations")
    .select("id, tool, title, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <Dashboard
      email={user.email ?? ""}
      fullName={profile?.full_name ?? ""}
      profileType={(profile?.profile_type as ProfileType) ?? "individual"}
      recentCalcs={(calcs ?? []) as SavedCalculation[]}
    />
  );
}
