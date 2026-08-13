"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileType = "individual" | "self" | "business";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const profileType = String(formData.get("profileType") ?? "individual") as ProfileType;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, profile_type: profileType },
    },
  });

  if (error) {
    console.error("signup error", error.message);
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    // Create the profile row (upsert to be safe)
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      profile_type: profileType,
    });
    if (profileError) console.error("profile upsert error", profileError.message);
  }

  revalidatePath("/", "layout");
  redirect("/login?confirmed=1");
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("login error", error.message);
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const profileType = String(formData.get("profileType") ?? "individual") as ProfileType;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, profile_type: profileType })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile error", error.message);
    redirect(`/account?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/account");
  redirect("/account?saved=1");
}