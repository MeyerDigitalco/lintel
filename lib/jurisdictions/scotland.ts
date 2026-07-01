import type { JurisdictionRules } from "./types";
import { SHARED_COMPLIANCE } from "./shared";

/**
 * Scotland, Private Housing (Tenancies) (Scotland) Act 2016.
 * The Private Residential Tenancy (PRT) is open-ended. No no-fault eviction;
 * possession only on one of 18 grounds via the First-tier Tribunal (Housing &
 * Property Chamber). Landlords must register with their local council
 * (renewable every 3 years; operating unregistered is a criminal offence).
 */
export const scotland: JurisdictionRules = {
  key: "scotland",
  name: "Scotland",
  governingLaw: "Private Housing (Tenancies) (Scotland) Act 2016",
  rightToRent: false,
  landlordRegistrationScheme: "Scottish Landlord Register (council; renew every 3 years)",
  disputeForum: "First-tier Tribunal for Scotland (Housing & Property Chamber)",

  tenancyTypes: [
    {
      key: "private_residential_tenancy",
      label: "Private Residential Tenancy (PRT)",
      partyLabel: "tenant",
      description:
        "Open-ended tenancy under the 2016 Act. No fixed term; ends only by tenant's notice or a tribunal order on statutory grounds.",
    },
  ],

  complianceItems: [
    ...SHARED_COMPLIANCE,
    {
      key: "repairing_standard",
      label: "Repairing Standard check",
      cadence: "ongoing",
      statutoryBasis: "Housing (Scotland) Act 2006, Repairing Standard",
      reminderDaysBefore: [30],
    },
    {
      key: "tolerable_standard",
      label: "Tolerable Standard check",
      cadence: "ongoing",
      statutoryBasis: "Housing (Scotland) Act 1987, Tolerable Standard",
      reminderDaysBefore: [30],
    },
  ],

  registrationFields: [
    {
      key: "landlord_registration_number",
      label: "Scottish Landlord Registration number",
      type: "text",
      required: true,
      help: "Register with the local council where the property sits. Renew every 3 years.",
    },
    {
      key: "registration_council",
      label: "Registering local authority",
      type: "text",
      required: true,
    },
    {
      key: "registration_renews_at",
      label: "Registration renewal date",
      type: "date",
      required: false,
    },
  ],

  noticeTemplates: [
    {
      key: "notice_to_leave",
      label: "Notice to Leave (PRT)",
      noticePeriodDays: null,
      statutoryBasis: "Private Housing (Tenancies) (Scotland) Act 2016, 18 grounds",
      description:
        "Served to begin possession on one of the 18 grounds. Notice period (28 or 84 days) depends on the ground and length of tenancy. Application is then made to the First-tier Tribunal.",
    },
  ],

  depositRules: {
    capDescription: "Maximum 2 months' rent",
    protectionDeadlineDays: 30,
    protectionDeadlineBasis: "working",
    schemes: ["SafeDeposits Scotland", "Letting Protection Service Scotland", "mydeposits Scotland"],
  },

  documentChecklist: [
    {
      key: "prt_agreement",
      label: "Private Residential Tenancy agreement",
      atTenancyStart: true,
      statutoryBasis: "Private Housing (Tenancies) (Scotland) Act 2016",
    },
    {
      key: "easy_read_notes",
      label: "Scottish Government PRT 'easy read notes'",
      atTenancyStart: true,
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
