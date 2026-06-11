import type { Field, NoticeMode } from "@/components/app/toolkit/NoticeBuilder";
import type { JurisdictionKey } from "@/lib/jurisdictions";
import type { NoticeKind, PossessionGround } from "./types";
import { SECTION_8_GROUNDS } from "./england";
import { NOTICE_TO_LEAVE_GROUNDS } from "./scotland";

export interface ToolForm {
  slug: string;
  jurisdiction: JurisdictionKey;
  kind: NoticeKind;
  /** 'notice' uses NoticeBuilder; 'checklist' uses the FFHH-style component */
  ui: "notice" | "checklist";
  fields: Field[];
  grounds?: PossessionGround[];
  noticeMode?: NoticeMode;
  dateField?: string;
}

const tenantField: Field = { name: "tenant_name", label: "Tenant name" };
const propAddrField: Field = { name: "property_address", label: "Property address" };
const landlordField: Field = { name: "landlord_name", label: "Landlord name" };

export const TOOL_FORMS: Record<string, ToolForm> = {
  "section-8": {
    slug: "section-8",
    jurisdiction: "england",
    kind: "section_8",
    ui: "notice",
    fields: [tenantField, propAddrField, landlordField],
    grounds: SECTION_8_GROUNDS,
    noticeMode: { kind: "max_ground_days" },
    dateField: "earliest_date",
  },
  "section-13": {
    slug: "section-13",
    jurisdiction: "england",
    kind: "section_13",
    ui: "notice",
    fields: [
      tenantField,
      propAddrField,
      landlordField,
      { name: "current_rent", label: "Current rent (per month)", placeholder: "£" },
      { name: "new_rent", label: "Proposed new rent (per month)", placeholder: "£" },
      { name: "effective_date", label: "New rent effective from", type: "date" },
    ],
    noticeMode: { kind: "none" },
  },
  "pet-request": {
    slug: "pet-request",
    jurisdiction: "england",
    kind: "pet_request",
    ui: "notice",
    fields: [
      tenantField,
      propAddrField,
      landlordField,
      { name: "pet_description", label: "Pet requested" },
      { name: "decision", label: "Decision (consent / refuse)" },
      { name: "reason", label: "Reason / conditions" },
    ],
    noticeMode: { kind: "none" },
  },
  "written-statement": {
    slug: "written-statement",
    jurisdiction: "wales",
    kind: "written_statement",
    ui: "notice",
    fields: [
      { name: "contract_holder_name", label: "Contract-holder name" },
      propAddrField,
      landlordField,
      { name: "rsw_number", label: "Rent Smart Wales number" },
      { name: "occupation_date", label: "Occupation date", type: "date" },
      { name: "rent", label: "Rent (per month)", placeholder: "£" },
      { name: "deposit", label: "Deposit", placeholder: "£" },
    ],
    noticeMode: { kind: "none" },
  },
  s173: {
    slug: "s173",
    jurisdiction: "wales",
    kind: "s173",
    ui: "notice",
    fields: [
      { name: "contract_holder_name", label: "Contract-holder name" },
      propAddrField,
      landlordField,
    ],
    noticeMode: { kind: "fixed_days", days: 182 },
    dateField: "end_date",
  },
  fitness: {
    slug: "fitness",
    jurisdiction: "wales",
    kind: "written_statement",
    ui: "checklist",
    fields: [],
  },
  "notice-to-leave": {
    slug: "notice-to-leave",
    jurisdiction: "scotland",
    kind: "notice_to_leave",
    ui: "notice",
    fields: [
      tenantField,
      propAddrField,
      landlordField,
      {
        name: "residence_months",
        label: "Months the tenant has lived in the property",
        type: "number",
        placeholder: "e.g. 8",
      },
    ],
    grounds: NOTICE_TO_LEAVE_GROUNDS,
    noticeMode: { kind: "scotland_residence" },
    dateField: "leave_date",
  },
  "prt-agreement": {
    slug: "prt-agreement",
    jurisdiction: "scotland",
    kind: "prt_agreement",
    ui: "notice",
    fields: [
      tenantField,
      propAddrField,
      landlordField,
      { name: "registration_number", label: "Landlord registration number" },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "rent", label: "Rent (per month)", placeholder: "£" },
      { name: "deposit", label: "Deposit", placeholder: "£" },
    ],
    noticeMode: { kind: "none" },
  },
  "notice-to-quit": {
    slug: "notice-to-quit",
    jurisdiction: "northern_ireland",
    kind: "notice_to_quit",
    ui: "notice",
    fields: [
      tenantField,
      propAddrField,
      landlordField,
      {
        name: "tenancy_months",
        label: "Length of tenancy (months)",
        type: "number",
        placeholder: "e.g. 18",
      },
    ],
    noticeMode: { kind: "ni_tenancy_length" },
    dateField: "quit_date",
  },
};

export function toolForm(slug: string): ToolForm | undefined {
  return TOOL_FORMS[slug];
}
