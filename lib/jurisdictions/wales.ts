import type { JurisdictionRules } from "./types";
import { SHARED_COMPLIANCE } from "./shared";

/**
 * Wales — Renting Homes (Wales) Act 2016.
 * Occupiers are "contract-holders" under an "occupation contract". A written
 * statement must be provided within 14 days. No Right to Rent. Landlords and
 * agents must register/licence with Rent Smart Wales.
 */
export const wales: JurisdictionRules = {
  key: "wales",
  name: "Wales",
  governingLaw: "Renting Homes (Wales) Act 2016",
  rightToRent: false,
  landlordRegistrationScheme: "Rent Smart Wales (mandatory)",
  disputeForum: "Court",

  tenancyTypes: [
    {
      key: "standard_occupation_contract",
      label: "Standard occupation contract",
      partyLabel: "contract-holder",
      description:
        "The default occupation contract for private landlords under the Renting Homes (Wales) Act 2016.",
    },
  ],

  complianceItems: [
    ...SHARED_COMPLIANCE,
    {
      key: "ffhh_wales",
      label: "Fitness for Human Habitation check",
      cadence: "ongoing",
      statutoryBasis:
        "Renting Homes (Fitness for Human Habitation) (Wales) Regulations 2022",
      reminderDaysBefore: [30],
    },
    {
      key: "written_statement",
      label: "Written statement of the occupation contract provided",
      cadence: "once",
      statutoryBasis:
        "Renting Homes (Wales) Act 2016 — within 14 days of occupation",
      reminderDaysBefore: [],
    },
  ],

  registrationFields: [
    {
      key: "rsw_registration_number",
      label: "Rent Smart Wales registration number",
      type: "text",
      required: true,
      help: "All Welsh landlords must register with Rent Smart Wales.",
    },
    {
      key: "rsw_licence_number",
      label: "Rent Smart Wales licence number",
      type: "text",
      required: false,
      help: "Required if you (or your agent) manage the property yourself.",
    },
  ],

  noticeTemplates: [
    {
      key: "section_173",
      label: "Section 173 notice (no-fault, landlord's notice)",
      noticePeriodDays: 182, // 6 months
      statutoryBasis: "Renting Homes (Wales) Act 2016 s.173",
      description:
        "Landlord's notice to end a periodic standard contract. Minimum 6 months' notice; cannot be served in the first 6 months of occupation.",
    },
  ],

  depositRules: {
    capDescription: "Set per the occupation contract terms",
    protectionDeadlineDays: 30,
    protectionDeadlineBasis: "calendar",
    schemes: ["Deposit Protection Service", "MyDeposits", "Tenancy Deposit Scheme"],
  },

  documentChecklist: [
    {
      key: "written_statement",
      label: "Written statement of the occupation contract",
      atTenancyStart: true,
      statutoryBasis: "Renting Homes (Wales) Act 2016 (within 14 days)",
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
      key: "eicr",
      label: "Electrical condition report",
      atTenancyStart: true,
    },
  ],
};
