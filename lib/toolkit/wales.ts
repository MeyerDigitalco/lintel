import type { Template, ToolDescriptor } from "./types";

/**
 * Wales, Renting Homes (Wales) Act 2016.
 * Occupiers are "contract-holders". A written statement of the occupation
 * contract must be provided within 14 days of occupation. The landlord's
 * no-fault notice is under section 173: minimum 6 months' notice, and it cannot
 * be served in the first 6 months of occupation.
 */

export const WALES_S173_MIN_NOTICE_DAYS = 182; // 6 months
export const WALES_WRITTEN_STATEMENT_DEADLINE_DAYS = 14;

export const FFHH_CHECKLIST: { key: string; label: string }[] = [
  { key: "smoke_alarms", label: "Working smoke alarms on each storey (mains-wired)" },
  { key: "co_alarms", label: "Carbon monoxide alarm in rooms with a gas/solid-fuel appliance" },
  { key: "eicr", label: "Electrical safety inspection (EICR) in date" },
  { key: "free_from_damp", label: "Free from serious damp and mould" },
  { key: "structurally_stable", label: "Structurally stable and weather-tight" },
  { key: "safe_water", label: "Safe supply of water, drainage and sanitation" },
  { key: "heating", label: "Adequate heating and ventilation" },
];

export const WALES_TEMPLATES: Template[] = [
  {
    kind: "s173",
    jurisdiction: "wales",
    version: "RHW-2016.1",
    title: "Section 173 notice (landlord's no-fault notice)",
    statutoryBasis: "Renting Homes (Wales) Act 2016 s.173",
    legislationUrl: "https://www.legislation.gov.uk/anaw/2016/1/section/173",
    body: `LANDLORD'S NOTICE TO END A STANDARD OCCUPATION CONTRACT
(Section 173, Renting Homes (Wales) Act 2016)

To: {{contract_holder_name}}
Property: {{property_address}}

The landlord is giving notice to end your standard occupation contract.
You are required to give up possession on or after: {{end_date}}
(at least 6 months from the date of this notice).

This notice cannot be given in the first 6 months of occupation, and certain
conditions (e.g. registration and deposit compliance) must be met for it to be
valid.

Signed: {{landlord_name}}
Date served: {{served_date}}

Template-assisted, not legal advice. Verify against current Welsh Government
guidance before serving.`,
  },
  {
    kind: "written_statement",
    jurisdiction: "wales",
    version: "RHW-2016.1",
    title: "Written statement of the occupation contract",
    statutoryBasis: "Renting Homes (Wales) Act 2016, provide within 14 days",
    legislationUrl: "https://www.legislation.gov.uk/anaw/2016/1/contents",
    body: `WRITTEN STATEMENT OF OCCUPATION CONTRACT

Landlord: {{landlord_name}}  (Rent Smart Wales no: {{rsw_number}})
Contract-holder: {{contract_holder_name}}
Property: {{property_address}}
Occupation date: {{occupation_date}}
Rent: {{rent}} per month
Deposit: {{deposit}}

This written statement sets out the terms of your standard occupation contract,
including the key matters, fundamental terms, supplementary terms and any
additional terms agreed. It must be provided within 14 days of the occupation
date.

Template-assisted, not legal advice. Use alongside the Welsh Government model
written statement.`,
  },
];

export const WALES_TOOLS: ToolDescriptor[] = [
  {
    key: "written_statement",
    jurisdiction: "wales",
    slug: "written-statement",
    title: "Written statement (14-day tracker)",
    blurb: "Generate the occupation-contract written statement and track the 14-day deadline.",
  },
  {
    key: "s173",
    jurisdiction: "wales",
    slug: "s173",
    title: "Section 173 notice",
    blurb: "Produce a no-fault notice with the correct 6-month period and validity checks.",
  },
  {
    key: "ffhh",
    jurisdiction: "wales",
    slug: "fitness",
    title: "Fitness for Human Habitation checklist",
    blurb: "Work through the Welsh fitness requirements for the property.",
  },
];
