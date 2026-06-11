"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function addAccountantNote(formData: FormData) {
  const { orgId, userId } = await requireSession();
  const supabase = createClient();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const { error } = await supabase.from("accountant_notes").insert({
    org_id: orgId,
    author_id: userId,
    author_role: "landlord",
    body,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/accountant");
}

export async function resolveAccountantNote(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const id = String(formData.get("id"));
  await supabase.from("accountant_notes").update({ resolved: true }).eq("id", id);
  revalidatePath("/dashboard/accountant");
}
