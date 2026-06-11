import type { PossessionGround, Template, ToolDescriptor } from "./types";

/**
 * England — Renters' Rights Act 2025.
 * Section 21 (no-fault) abolished from 1 May 2026; possession is via Section 8
 * grounds only, served on the new prescribed Form 3A. Notice periods below
 * reflect the post-RRA position and are indicative — always confirm against the
 * current prescribed form before serving.
 */

export const SECTION_8_GROUNDS: PossessionGround[] = [
  {
    ref: "1",
    label: "Landlord or family needs to move in",
    type: "mandatory",
    noticeDays: 122, // ~4 months
    summary: "The landlord or a close family member wants to occupy the property as their only or principal home.",
    conditions: "Cannot be used in the first 12 months of the tenancy.",
  },
  {
    ref: "1A",
    label: "Sale of the property",
    type: "mandatory",
    noticeDays: 122, // ~4 months
    summary: "The landlord intends to sell the property.",
    conditions: "Cannot be used in the first 12 months. Re-letting/marketing is restricted for 12 months after.",
  },
  {
    ref: "8",
    label: "Serious rent arrears",
    type: "mandatory",
    noticeDays: 28, // 4 weeks
    summary: "At least 3 months' (or 13 weeks') rent unpaid, both when the notice is served and at the hearing.",
  },
  {
    ref: "10",
    label: "Some rent arrears",
    type: "discretionary",
    noticeDays: 28,
    summary: "Some rent is lawfully due and unpaid when the notice is served.",
  },
  {
    ref: "11",
    label: "Persistent delay in paying rent",
    type: "discretionary",
    noticeDays: 28,
    summary: "The tenant has persistently delayed paying rent that is lawfully due.",
  },
  {
    ref: "12",
    label: "Breach of tenancy obligation",
    type: "discretionary",
    noticeDays: 14,
    summary: "An obligation of the tenancy (other than paying rent) has been broken.",
  },
  {
    ref: "13",
    label: "Deterioration of the property",
    type: "discretionary",
    noticeDays: 14,
    summary: "The condition of the property has deteriorated due to the tenant's behaviour.",
  },
  {
    ref: "14",
    label: "Anti-social behaviour",
    type: "discretionary",
    noticeDays: 0, // can be started immediately
    summary: "The tenant or a visitor is engaging in anti-social behaviour or using the property for illegal purposes.",
  },
];

export const ENGLAND_TEMPLATES: Template[] = [
  {
    kind: "section_8",
    jurisdiction: "england",
    version: "RRA-2025.1",
    title: "Section 8 notice seeking possession",
    prescribedForm: "Form 3A (from 1 May 2026)",
    statutoryBasis: "Housing Act 1988 s.8, as amended by the Renters' Rights Act 2025",
    legislationUrl: "https://www.legislation.gov.uk/ukpga/2025/renters-rights",
    body: `NOTICE SEEKING POSSESSION OF A PROPERTY LET ON AN ASSURED TENANCY
(Section 8, Housing Act 1988 — prescribed Form 3A)

To: {{tenant_name}}
Address of property: {{property_address}}

1. The landlord intends to seek possession on ground(s): {{grounds}}.

2. The reasons for seeking possession are set out for each ground above.

3. Court proceedings will not begin until after: {{earliest_date}}
   (no earlier than the minimum notice period for the ground(s) relied upon).

Signed: {{landlord_name}}
Date served: {{served_date}}

This notice is template-assisted and is not legal advice. Confirm the wording
against the current prescribed Form 3A and consider taking legal advice before
serving.`,
  },
  {
    kind: "section_13",
    jurisdiction: "england",
    version: "RRA-2025.1",
    title: "Section 13 rent increase notice",
    prescribedForm: "Form 4",
    statutoryBasis: "Housing Act 1988 s.13",
    legislationUrl: "https://www.legislation.gov.uk/ukpga/1988/50/section/13",
    body: `LANDLORD'S NOTICE PROPOSING A NEW RENT
(Section 13, Housing Act 1988)

To: {{tenant_name}}
Property: {{property_address}}

Your current rent is {{current_rent}} per month.
The proposed new rent is {{new_rent}} per month.
The new rent will take effect from: {{effective_date}}
(at least one month after this notice, and not before any minimum term).

Signed: {{landlord_name}}
Date served: {{served_date}}

Template-assisted, not legal advice. A tenant may refer a proposed increase to
the First-tier Tribunal. Verify against the current prescribed form.`,
  },
  {
    kind: "pet_request",
    jurisdiction: "england",
    version: "RRA-2025.1",
    title: "Response to a tenant's request to keep a pet",
    statutoryBasis: "Renters' Rights Act 2025 — implied term not to unreasonably refuse pets",
    legislationUrl: "https://www.legislation.gov.uk/ukpga/2025/renters-rights",
    body: `RESPONSE TO REQUEST TO KEEP A PET

To: {{tenant_name}}
Property: {{property_address}}
Pet requested: {{pet_description}}

Decision: {{decision}}
{{reason}}

Under the Renters' Rights Act 2025 a landlord must not unreasonably refuse
consent and must respond within the statutory time limit. You may require pet
insurance as a condition.

Signed: {{landlord_name}}
Date: {{served_date}}`,
  },
];

export const ENGLAND_TOOLS: ToolDescriptor[] = [
  {
    key: "section_8",
    jurisdiction: "england",
    slug: "section-8",
    title: "Section 8 grounds builder",
    blurb: "Select your grounds and build a Section 8 possession notice (Form 3A) with the correct notice period.",
  },
  {
    key: "section_13",
    jurisdiction: "england",
    slug: "section-13",
    title: "Section 13 rent increase",
    blurb: "Generate a statutory rent-increase notice for a periodic assured tenancy.",
  },
  {
    key: "pet_request",
    jurisdiction: "england",
    slug: "pet-request",
    title: "Pet request decision",
    blurb: "Record and respond to a tenant's request to keep a pet within the statutory rules.",
  },
];
