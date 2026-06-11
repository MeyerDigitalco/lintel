import type { JurisdictionRules } from "./types";
import { SHARED_COMPLIANCE } from "./shared";

/**
 * Northern Ireland — Private Tenancies Act (NI) 2022 (and Private Tenancies
 * (NI) Order 2006). No Section 21 / Section 8 regime; possession runs through a
 * notice-to-quit regime with statutory minimum periods. Landlords must register
 * with the Landlord Registration Scheme. No Right to Rent.
 */
export const northernIreland: JurisdictionRules = {
  key: "northern_ireland",
  name: "Northern Ireland",
  governingLaw: "Private Tenancies Act (Northern Ireland) 2022",
  rightToRent: false,
  landlordRegistrationScheme: "Landlord Registration Scheme (mandatory)",
  disputeForum: "Court / deposit scheme",

  tenancyTypes: [
    {
      key: "private_tenancy",
      label: "Private tenancy",
      partyLabel: "tenant",
      description:
        "Private tenancy governed by the Private Tenancies (NI) Order 2006 as amended by the Private Tenancies Act (NI) 2022.",
    },
  ],

  complianceItems: [
    ...SHARED_COMPLIANCE,
    {
      key: "fitness_standard_ni",
      label: "Fitness standard check",
      cadence: "ongoing",
      statutoryBasis: "Housing (Northern Ireland) Order 1981 — fitness standard",
      reminderDaysBefore: [30],
    },
    {
      key: "tenancy_terms_statement",
      label: "Written statement of tenancy terms provided",
      cadence: "once",
      statutoryBasis: "Private Tenancies Act (NI) 2022 — within 28 days",
      reminderDaysBefore: [],
    },
  ],

  registrationFields: [
    {
      key: "landlord_registration_number",
      label: "Landlord Registration Scheme number",
      type: "text",
      required: true,
      help: "All NI private landlords must register and keep details current.",
    },
  ],

  noticeTemplates: [
    {
      key: "notice_to_quit",
      label: "Notice to Quit",
      noticePeriodDays: null,
      statutoryBasis:
        "Private Tenancies Act (NI) 2022 — notice period scales with length of tenancy (up to 12 weeks)",
      description:
        "Ends a private tenancy. Minimum notice period depends on how long the tenant has lived in the property (4, 8 or 12 weeks).",
    },
  ],

  depositRules: {
    capDescription: "Set per the approved tenancy deposit scheme",
    protectionDeadlineDays: 28,
    protectionDeadlineBasis: "calendar",
    schemes: ["TDS Northern Ireland", "MyDeposits Northern Ireland"],
  },

  documentChecklist: [
    {
      key: "tenancy_terms",
      label: "Written statement of tenancy terms",
      atTenancyStart: true,
      statutoryBasis: "Private Tenancies Act (NI) 2022 (within 28 days)",
    },
    {
      key: "rent_book",
      label: "Rent book provided",
      atTenancyStart: true,
      statutoryBasis: "Private Tenancies (NI) Order 2006",
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
  ],
};
