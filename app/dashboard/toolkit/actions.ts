"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { JurisdictionKey } from "@/lib/jurisdictions";
import type { NoticeKind } from "@/lib/toolkit";

export interface SaveNoticeInput {
  kind: NoticeKind;
  jurisdiction: JurisdictionKey;
  propertyId?: string | null;
  tenancyId?: string | null;
  title: string;
  templateVersion: string;
  body: string;
  inputs: Record<string, string>;
  markServed?: boolean;
}

export async function saveNotice(input: SaveNoticeInput) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const { error } = await supabase.from("notices").insert({
    org_id: orgId,
    property_id: input.propertyId || null,
    tenancy_id: input.tenancyId || null,
    kind: input.kind,
    jurisdiction: input.jurisdiction,
    status: input.markServed ? "served" : "draft",
    served_at: input.markServed ? new Date().toISOString().slice(0, 10) : null,
    template_version: input.templateVersion,
    title: input.title,
    payload: { inputs: input.inputs, body: input.body },
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/toolkit");
}

export async function markNoticeServed(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const id = String(formData.get("id"));
  const { error } = await supabase
    .from("notices")
    .update({ status: "served", served_at: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/toolkit");
}
