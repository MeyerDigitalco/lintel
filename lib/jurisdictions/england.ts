import type { JurisdictionRules } from "./types";
import { SHARED_COMPLIANCE } from "./shared";

/**
 * England — Renters' Rights Act 2025.
 * No-fault eviction (Section 21) abolished from 1 May 2026; Section 8 grounds
 * only. Tenancies are periodic assured. Right to Rent applies (England only).
 */
export const england: JurisdictionRules = {
  key: "england",
  name: "England",
  governingLaw: "Renters' Rights Act 2025",
  rightToRent: true,
  landlordRegistrationScheme: "PRS Database (from late 2026)",
  disputeForum: "County court",

  tenancyTypes: [
    {
      key: "periodic_assured",
      label: "Periodic assured tenancy",
      partyLabel: "tenant",
      description:
        "Open-ended periodic assured tenancy under the Renters' Rights Act 2025. Fixed terms abolished.",
    },
  ],

  complianceItems: [
    ...SHARED_COMPLIANCE,
    {
      key: "how_to_rent",
      label: "How to Rent guide served",
      cadence: "once",
      statutoryBasis: "Deregulation Act 2015 / Renters' Rights Act 2025",
      reminderDaysBefore: [],
    },
    {
      key: "rra_information_sheet",
      label: "Renters' Rights Act information sheet served",
      cadence: "once",
      statutoryBasis: "Renters' Rights Act 2025 (prescribed information)",
      reminderDaysBefore: [],
    },
  ],

  registrationFields: [
    {
      key: "prs_database_ref",
      label: "PRS Database registration reference",
      type: "text",
      required: false,
      help: "Mandatory once the PRS Database goes live (expected late 2026).",
    },
    {
      key: "ombudsman_member",
      label: "Member of the PRS Landlord Ombudsman scheme",
      type: "boolean",
      required: false,
    },
  ],

  noticeTemplates: [
    {
      key: "section_8",
      label: "Section 8 notice (grounds for possession)",
      noticePeriodDays: null,
      statutoryBasis: "Housing Act 1988 s.8, as amended by Renters' Rights Act 2025",
      description:
        "Possession on statutory grounds. Notice period depends on the ground(s) relied upon.",
    },
    {
      key: "section_13",
      label: "Section 13 rent increase notice",
      noticePeriodDays: 60,
      statutoryBasis: "Housing Act 1988 s.13",
      description: "Statutory route to increase rent on a periodic assured tenancy.",
    },
  ],

  depositRules: {
    capDescription:
      "5 weeks' rent (annual rent < £50,000) or 6 weeks' rent (annual rent ≥ £50,000)",
    protectionDeadlineDays: 30,
    protectionDeadlineBasis: "calendar",
    schemes: ["Deposit Protection Service", "MyDeposits", "Tenancy Deposit Scheme"],
  },

  documentChecklist: [
    {
      key: "tenancy_agreement",
      label: "Tenancy agreement",
      atTenancyStart: true,
    },
    {
      key: "how_to_rent",
      label: "How to Rent guide",
      atTenancyStart: true,
      statutoryBasis: "Deregulation Act 2015",
    },
    {
      key: "rra_information_sheet",
      label: "Renters' Rights Act information sheet",
      atTenancyStart: true,
      statutoryBasis: "Renters' Rights Act 2025",
    },
    {
      key: "epc",
      label: "EPC",
      atTenancyStart: true,
    },
    {
      key: "gas_safety",
      label: "Gas safety certificate",
      atTenancyStart: true,
    },
    {
      key: "right_to_rent",
      label: "Right to Rent check completed",
      atTenancyStart: true,
      statutoryBasis: "Immigration Act 2014 (England only)",
    },
  ],
};
