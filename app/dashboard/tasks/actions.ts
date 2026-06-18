"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createTask(formData: FormData) {
  const { orgId, userId } = await requireSession();
  const supabase = createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const due_on = String(formData.get("due_on") ?? "") || null;
  const property_id = String(formData.get("property_id") ?? "") || null;
  const priority = String(formData.get("priority") ?? "normal");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const { error } = await supabase.from("tasks").insert({
    org_id: orgId, title, due_on, property_id, priority, notes, created_by: userId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function toggleTask(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const id = String(formData.get("id"));
  const done = String(formData.get("done")) === "true";
  await supabase
    .from("tasks")
    .update({ status: done ? "done" : "open", completed_at: done ? new Date().toISOString() : null })
    .eq("id", id);
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const id = String(formData.get("id"));
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}
