import { createClient } from "./client";

export type DocCategory = "Τιμολόγια" | "Τράπεζα" | "MyData" | "Φορολογικά" | "Λοιπά";

export interface Document {
  id: string;
  title: string;
  category: DocCategory;
  kind: "income" | "expense" | "mixed";
  amount: number;
  items: unknown[];
  created_at: string;
}

export async function getCurrentUser() {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function listDocuments(): Promise<Document[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, category, kind, amount, items, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error(error.message);
    return [];
  }
  return (data ?? []) as Document[];
}

export async function saveDocument(input: {
  title: string;
  category: DocCategory;
  kind: "income" | "expense" | "mixed";
  amount: number;
  items: unknown[];
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: "Η βάση δεδομένων δεν είναι συνδεδεμένη ακόμα." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Πρέπει να συνδεθείς για να αποθηκεύσεις έγγραφο." };

  const { error } = await supabase.from("documents").insert({
    user_id: user.id,
    title: input.title,
    category: input.category,
    kind: input.kind,
    amount: input.amount,
    items: input.items,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteDocument(id: string) {
  const supabase = createClient();
  if (!supabase) return;
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) console.error(error.message);
}