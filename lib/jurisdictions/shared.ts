import type { ComplianceItem } from "./types";

/**
 * Compliance items shared across all UK nations. Individual nation modules
 * spread these in and add their own (e.g. Welsh Fitness for Human Habitation).
 *
 * NOTE: statutory bases differ subtly by nation for some items; where the
 * substance is materially different, the nation module overrides rather than
 * reuses these.
 */
export const SHARED_COMPLIANCE: ComplianceItem[] = [
  {
    key: "gas_safety",
    label: "Gas safety certificate (CP12)",
    cadence: "annual",
    statutoryBasis: "Gas Safety (Installation and Use) Regulations 1998",
    reminderDaysBefore: [60, 30, 7],
  },
  {
    key: "eicr",
    label: "Electrical installation condition report (EICR)",
    cadence: "five_yearly",
    statutoryBasis:
      "Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020 / equivalent",
    reminderDaysBefore: [60, 30, 7],
  },
  {
    key: "epc",
    label: "Energy performance certificate (EPC)",
    cadence: "once",
    statutoryBasis: "Energy Performance of Buildings Regulations 2012 (valid 10 years)",
    reminderDaysBefore: [60, 30, 7],
  },
  {
    key: "smoke_co_alarms",
    label: "Smoke & carbon monoxide alarms check",
    cadence: "ongoing",
    statutoryBasis:
      "Smoke and Carbon Monoxide Alarm (England) Regulations 2015 (as amended) / equivalent",
    reminderDaysBefore: [30],
  },
  {
    key: "legionella",
    label: "Legionella risk assessment",
    cadence: "biennial",
    statutoryBasis: "Health and Safety at Work etc. Act 1974; HSE ACOP L8",
    reminderDaysBefore: [60, 30],
  },
  {
    key: "hmo_licence",
    label: "HMO licence",
    cadence: "five_yearly",
    statutoryBasis: "Housing Act 2004 (mandatory HMO licensing) / equivalent",
    conditional: true,
    reminderDaysBefore: [90, 60, 30],
  },
];
