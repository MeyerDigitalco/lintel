/**
 * Tenancy/compliance toolkit — shared types.
 *
 * Everything here is template-assisted and informational. The UI must always
 * show a prominent "not legal advice — verify or consult a solicitor"
 * disclaimer and link to the underlying legislation. Templates are versioned so
 * we can track which legislative text a generated notice was based on.
 */

import type { JurisdictionKey } from "@/lib/jurisdictions";

export type NoticeKind =
  | "section_8" // England — grounds for possession
  | "section_13" // England — rent increase
  | "pet_request" // England — pet request decision
  | "info_sheet" // England — RRA information sheet / How to Rent served
  | "s173" // Wales — landlord's no-fault notice
  | "written_statement" // Wales — occupation contract written statement
  | "notice_to_leave" // Scotland — PRT possession
  | "prt_agreement" // Scotland — tenancy agreement
  | "notice_to_quit"; // Northern Ireland

export interface PossessionGround {
  /** ground reference, e.g. "1A", "8", "14" */
  ref: string;
  label: string;
  /** mandatory grounds oblige the court to grant possession if proven */
  type: "mandatory" | "discretionary";
  /** minimum notice period in days for this ground (post-reform) */
  noticeDays: number;
  /** plain-English summary */
  summary: string;
  /** extra conditions, e.g. "only after the first 12 months" */
  conditions?: string;
}

export interface Template {
  kind: NoticeKind;
  jurisdiction: JurisdictionKey;
  /** semantic version of this template's legislative basis */
  version: string;
  title: string;
  /** the prescribed form name, where one exists */
  prescribedForm?: string;
  statutoryBasis: string;
  legislationUrl: string;
  /** body with {{placeholders}} filled at generation time */
  body: string;
}

export interface ToolDescriptor {
  key: string;
  jurisdiction: JurisdictionKey;
  /** route segment under /dashboard/toolkit */
  slug: string;
  title: string;
  blurb: string;
}
