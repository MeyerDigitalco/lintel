"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string } | undefined;

export async function signInAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/home");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect(next || "/home");
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const orgName = String(formData.get("org_name") ?? "");
  const region = String(formData.get("region") ?? "england");
  const country = String(formData.get("country") ?? "GB");
  const currency = String(formData.get("currency") ?? "GBP");
  const regionCode = String(formData.get("region_code") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { org_name: orgName, region, country, currency, region_code: regionCode },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard`,
    },
  });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
