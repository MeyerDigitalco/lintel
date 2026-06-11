/**
 * Jurisdiction rules engine — shared type contracts.
 *
 * Each nation module implements `JurisdictionRules`. The UI and server read
 * ONLY the active module for a property, so e.g. a Welsh landlord never sees an
 * England-only field (Right to Rent) and a Scottish landlord sees council
 * registration rather than a Section 8 builder.
 *
 * The tax/MTD core is UK-wide and lives outside this module (see /lib/mtd).
 */

export type JurisdictionKey =
  | "england"
  | "wales"
  | "scotland"
  | "northern_ireland";

export type ComplianceCadence =
  | "annual"
  | "biennial" // every 2 years
  | "five_yearly"
  | "once" // one-off, then tracked by expiry where applicable
  | "ongoing"
  | "three_yearly";

export interface ComplianceItem {
  /** stable key, unique within a jurisdiction */
  key: string;
  label: string;
  /** how often it must be renewed/checked */
  cadence: ComplianceCadence;
  /** statutory basis shown in the UI for transparency */
  statutoryBasis: string;
  /** whether the item only applies in some cases (e.g. HMO) */
  conditional?: boolean;
  /** reminder offsets in days before expiry (SendGrid sweeps) */
  reminderDaysBefore: number[];
}

export interface TenancyType {
  key: string;
  label: string;
  /** what the occupier is called in this nation */
  partyLabel: "tenant" | "contract-holder";
  description: string;
}

export type RegistrationFieldType =
  | "text"
  | "date"
  | "select"
  | "boolean";

export interface RegistrationField {
  key: string;
  label: string;
  type: RegistrationFieldType;
  options?: string[];
  required: boolean;
  help?: string;
}

export interface NoticeTemplate {
  key: string;
  label: string;
  /** statutory notice period in days, where fixed; null when grounds-dependent */
  noticePeriodDays: number | null;
  statutoryBasis: string;
  description: string;
}

export interface DepositRules {
  /** human-readable cap, e.g. "5 weeks' rent (annual rent < £50k)" */
  capDescription: string;
  /** protection deadline in days after receipt */
  protectionDeadlineDays: number;
  /** working days vs calendar days for the deadline */
  protectionDeadlineBasis: "calendar" | "working";
  schemes: string[];
}

export interface ChecklistItem {
  key: string;
  label: string;
  /** must be served/provided at or before tenancy start */
  atTenancyStart: boolean;
  statutoryBasis?: string;
}

export interface JurisdictionRules {
  key: JurisdictionKey;
  /** display name */
  name: string;
  governingLaw: string;
  /** whether England-only Right to Rent checks apply */
  rightToRent: boolean;
  tenancyTypes: TenancyType[];
  complianceItems: ComplianceItem[];
  registrationFields: RegistrationField[];
  noticeTemplates: NoticeTemplate[];
  depositRules: DepositRules;
  documentChecklist: ChecklistItem[];
  /** landlord registration scheme name, where one exists */
  landlordRegistrationScheme: string | null;
  /** dispute forum */
  disputeForum: string;
}
