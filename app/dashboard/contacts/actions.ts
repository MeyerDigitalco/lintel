"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createContact(formData: FormData) {
  const { orgId } = await requireWriter();
  const supabase = createClient();
  const { error } = await supabase.from("contacts").insert({
    org_id: orgId,
    kind: String(formData.get("kind") ?? "other"),
    name: String(formData.get("name") ?? "").trim(),
    company: String(formData.get("company") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/contacts");
}

export async function archiveContact(formData: FormData) {
  await requireWriter();
  const supabase = createClient();
  await supabase.from("contacts").update({ archived: true }).eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/contacts");
}
