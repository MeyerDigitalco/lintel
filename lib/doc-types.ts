import { daysUntil } from "@/lib/dates";

export type DocCategory = "Compliance" | "Tenancy" | "Licensing" | "Insurance" | "Financial" | "Other";

export interface DocType {
  key: string;
  label: string;
  category: DocCategory;
  dated?: boolean; // expiry/renewal is meaningful
}

export const DOC_TYPES: DocType[] = [
  // Compliance & safety
  { key: "gas_safety", label: "Gas safety certificate", category: "Compliance", dated: true },
  { key: "eicr", label: "EICR (electrical)", category: "Compliance", dated: true },
  { key: "epc", label: "EPC", category: "Compliance", dated: true },
  { key: "pat", label: "Portable appliance test (PAT)", category: "Compliance", dated: true },
  { key: "fire_risk_assessment", label: "Fire risk assessment", category: "Compliance", dated: true },
  { key: "fire_safety_cert", label: "Fire safety certificate", category: "Compliance", dated: true },
  { key: "fire_alarm_cert", label: "Fire alarm certificate", category: "Compliance", dated: true },
  { key: "smoke_alarm_cert", label: "Smoke alarm certificate", category: "Compliance", dated: true },
  { key: "legionella", label: "Legionella risk assessment", category: "Compliance", dated: true },
  { key: "floor_plan", label: "Floor plan", category: "Compliance" },
  // Tenancy
  { key: "tenancy_agreement", label: "Tenancy agreement", category: "Tenancy" },
  { key: "occupation_contract", label: "Occupation contract (Wales)", category: "Tenancy" },
  { key: "deposit_cert", label: "Deposit protection certificate", category: "Tenancy", dated: true },
  { key: "deposit_prescribed", label: "Deposit prescribed information", category: "Tenancy" },
  { key: "inventory", label: "Inventory", category: "Tenancy" },
  { key: "inspection_report", label: "Inspection report", category: "Tenancy" },
  { key: "right_to_rent", label: "Right to Rent check", category: "Tenancy", dated: true },
  { key: "tenant_reference", label: "Tenant reference", category: "Tenancy" },
  { key: "tenant_welcome_pack", label: "Tenant welcome pack", category: "Tenancy" },
  { key: "sanctions_check", label: "Sanctions check", category: "Tenancy" },
  { key: "gdpr_notice", label: "GDPR notice", category: "Tenancy" },
  // Licensing & registration
  { key: "hmo_license", label: "HMO licence", category: "Licensing", dated: true },
  { key: "hmo_manager", label: "HMO manager contact details", category: "Licensing" },
  { key: "rsw_licence", label: "Rent Smart Wales licence", category: "Licensing", dated: true },
  { key: "rsw_registration", label: "Rent Smart Wales registration", category: "Licensing", dated: true },
  // Insurance
  { key: "landlord_insurance", label: "Landlord insurance", category: "Insurance", dated: true },
  { key: "building_insurance", label: "Building insurance", category: "Insurance", dated: true },
  { key: "contents_insurance", label: "Contents insurance", category: "Insurance", dated: true },
  { key: "leasehold_flat_insurance", label: "Leasehold flat insurance", category: "Insurance", dated: true },
  { key: "legal_expenses_insurance", label: "Legal expenses insurance", category: "Insurance", dated: true },
  { key: "rent_guarantee_insurance", label: "Rent guarantee insurance", category: "Insurance", dated: true },
  // Financial
  { key: "mortgage_agreement", label: "Mortgage agreement", category: "Financial" },
  { key: "invoice", label: "Invoice", category: "Financial" },
  { key: "receipt", label: "Receipt", category: "Financial" },
  { key: "tax_investigation", label: "Tax investigation", category: "Financial" },
  // Other
  { key: "photos", label: "Photos", category: "Other" },
  { key: "correspondence", label: "Correspondence", category: "Other" },
  { key: "e_signature", label: "E-signature", category: "Other" },
  { key: "other", label: "Other", category: "Other" },
];

export const DOC_CATEGORIES: DocCategory[] = ["Compliance", "Tenancy", "Licensing", "Insurance", "Financial", "Other"];

export function docLabel(key?: string | null): string {
  if (!key) return "Document";
  return DOC_TYPES.find((d) => d.key === key)?.label ?? key.replace(/_/g, " ");
}

export type DocStatusKey = "valid" | "expiring" | "expired" | "filed";

export function docStatus(expires_at?: string | null): { key: DocStatusKey; label: string } {
  if (!expires_at) return { key: "filed", label: "Filed" };
  const d = daysUntil(expires_at);
  if (d === null) return { key: "filed", label: "Filed" };
  if (d < 0) return { key: "expired", label: "Expired" };
  if (d <= 60) return { key: "expiring", label: `Expiring · ${d}d` };
  return { key: "valid", label: "Valid" };
}
