"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { requireEntitlement } from "@/lib/entitlements";
import { saveHmrcIdentifiers } from "@/lib/mtd/hmrc/connection";
import { getMtdProvider } from "@/lib/mtd/select";
import { quarterlyPeriods, taxYearStartFor } from "@/lib/dates";

export async function saveHmrcIds(formData: FormData) {
  const { orgId } = await requireSession();
  await requireEntitlement(orgId, "core");
  const nino = String(formData.get("nino") ?? "").trim().toUpperCase();
  const businessId = String(formData.get("business_id") ?? "").trim();
  await saveHmrcIdentifiers(orgId, nino, businessId);
  revalidatePath("/dashboard/tax");
}

/**
 * Submit a quarterly update to HMRC. Hard-gated: even if invoked, the provider
 * refuses unless HMRC recognition is granted (canSubmit()). Returns void so it
 * can be used directly as a <form action>.
 */
export async function submitQuarterly(formData: FormData): Promise<void> {
  const { orgId } = await requireSession();
  await requireEntitlement(orgId, "core");

  const provider = getMtdProvider();
  if (!provider.canSubmit() || !provider.submitQuarterlyUpdate) {
    revalidatePath("/dashboard/tax");
    return;
  }

  const periodKey = String(formData.get("period_key"));
  const periods = quarterlyPeriods(taxYearStartFor());
  const period = periods.find((p) => p.key === periodKey) ?? periods[0];

  await provider.submitQuarterlyUpdate(orgId, period);
  revalidatePath("/dashboard/tax");
}
