"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { isLintelAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

const STATUSES = ["new", "contacted", "closed"] as const;
type Status = (typeof STATUSES)[number];

/** Move a lead through new -> contacted -> closed. Owner only. */
export async function setLeadStatus(formData: FormData) {
  const { email } = await requireSession();
  if (!isLintelAdmin(email)) throw new Error("Not permitted.");

  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as Status;
  if (!STATUSES.includes(status)) throw new Error("Invalid status.");

  const patch: Record<string, unknown> = { status };
  patch.contacted_at = status === "new" ? null : new Date().toISOString();

  const supabase = createServiceClient();
  const { error } = await supabase.from("leads").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/leads");
}
