import { createClient } from "./client";

export interface SavedCalculation {
  id: string;
  tool: string;
  title: string;
  data: Record<string, unknown>;
  created_at: string;
}

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function saveCalculation(tool: string, title: string, data: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Πρέπει να συνδεθείς για να αποθηκεύσεις." };

  const { error } = await supabase.from("calculations").insert({
    user_id: user.id,
    tool,
    title,
    data,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listCalculations(): Promise<SavedCalculation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("calculations")
    .select("id, tool, title, data, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error(error.message);
    return [];
  }
  return (data ?? []) as SavedCalculation[];
}

export async function deleteCalculation(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("calculations").delete().eq("id", id);
  if (error) console.error(error.message);
}