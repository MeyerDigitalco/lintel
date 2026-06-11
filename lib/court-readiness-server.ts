import "server-only";
import { createClient } from "@/lib/supabase/server";
import { resolveJurisdiction, type JurisdictionKey } from "@/lib/jurisdictions";
import { scoreReadiness, type ReadinessResult } from "@/lib/court-readiness";
import { daysUntil } from "@/lib/dates";

/**
 * Gather the data for a tenancy and compute its court-readiness score.
 * Pulls from the property's jurisdiction rules, deposit fields, compliance
 * items, property documents and registrations.
 */
export async function tenancyReadiness(
  orgId: string,
  tenancyId: string
): Promise<ReadinessResult | null> {
  const supabase = createClient();

  const { data: tenancy } = await supabase
    .from("tenancies")
    .select("id, property_id, start_date, deposit_amount, deposit_protected_at, properties(jurisdiction)")
    .eq("org_id", orgId)
    .eq("id", tenancyId)
    .maybeSingle();
  if (!tenancy) return null;

  const jurisdiction = ((tenancy as any).properties?.jurisdiction ?? "england") as JurisdictionKey;
  const rules = resolveJurisdiction(jurisdiction);

  const [{ data: compliance }, { data: docs }, { data: regs }] = await Promise.all([
    supabase.from("compliance_items").select("item_key, expires_at").eq("property_id", tenancy.property_id),
    supabase.from("property_documents").select("doc_type").eq("property_id", tenancy.property_id),
    supabase.from("registrations").select("renews_at, issued_at").eq("property_id", tenancy.property_id),
  ]);

  const inDate = (key: string): boolean | null => {
    const item = (compliance ?? []).find((c) => c.item_key === key);
    if (!item) return null;
    if (!item.expires_at) return true;
    return (daysUntil(item.expires_at) ?? -1) >= 0;
  };

  // Documents we have evidence for: from compliance items, the document vault,
  // and the jurisdiction checklist mapped by key.
  const servedDocKeys = new Set<string>();
  for (const c of compliance ?? []) servedDocKeys.add(c.item_key);
  for (const d of docs ?? []) if (d.doc_type) servedDocKeys.add(d.doc_type);

  const registrationValid =
    (regs ?? []).some((r) => !r.renews_at || (daysUntil(r.renews_at) ?? -1) >= 0) &&
    (regs ?? []).length > 0;

  const prescribedDocs = rules.documentChecklist
    .filter((d) => d.atTenancyStart)
    .map((d) => ({ key: d.key, label: d.label }));

  return scoreReadiness({
    protectionDeadlineDays: rules.depositRules.protectionDeadlineDays,
    requiresRegistration: Boolean(rules.landlordRegistrationScheme),
    rightToRentApplies: rules.rightToRent,
    prescribedDocs,
    startDate: tenancy.start_date,
    depositAmount: tenancy.deposit_amount,
    depositProtectedAt: tenancy.deposit_protected_at,
    servedDocKeys: Array.from(servedDocKeys),
    gasInDate: inDate("gas_safety"),
    eicrInDate: inDate("eicr"),
    epcInDate: inDate("epc"),
    registrationValid,
    rightToRentDone: servedDocKeys.has("right_to_rent"),
  });
}
