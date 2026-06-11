import type { PossessionGround, Template, ToolDescriptor } from "./types";

/**
 * Scotland — Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3.
 * Possession of a Private Residential Tenancy runs through a Notice to Leave on
 * one of 18 grounds, then an application to the First-tier Tribunal. Notice
 * period is 28 days (tenant resident < 6 months) or 84 days (>= 6 months),
 * regardless of ground. The Tribunal must consider reasonableness for most
 * grounds following recent reforms.
 */

// noticeDays is set dynamically from residence length; stored 0 here as a marker.
export const NOTICE_TO_LEAVE_GROUNDS: PossessionGround[] = [
  { ref: "1", label: "Landlord intends to sell", type: "discretionary", noticeDays: 0, summary: "The landlord intends to sell the property within 3 months of the tenant leaving." },
  { ref: "2", label: "Lender intends to sell", type: "discretionary", noticeDays: 0, summary: "A lender is entitled to sell the let property (e.g. repossession)." },
  { ref: "3", label: "Landlord intends to refurbish", type: "discretionary", noticeDays: 0, summary: "The landlord intends to carry out significant refurbishment." },
  { ref: "4", label: "Landlord intends to live in the property", type: "discretionary", noticeDays: 0, summary: "The landlord intends to occupy the property as their only or principal home." },
  { ref: "5", label: "Family member intends to live in the property", type: "discretionary", noticeDays: 0, summary: "A member of the landlord's family intends to live in the property." },
  { ref: "6", label: "Landlord intends non-residential use", type: "discretionary", noticeDays: 0, summary: "The landlord intends to use the property for a non-residential purpose." },
  { ref: "7", label: "Property required for religious purpose", type: "discretionary", noticeDays: 0, summary: "The property is held for a person engaged in religious work." },
  { ref: "8", label: "No longer needs supported accommodation", type: "discretionary", noticeDays: 0, summary: "The tenant no longer needs community/supported accommodation." },
  { ref: "9", label: "Tenant no longer an employee", type: "discretionary", noticeDays: 0, summary: "The tenancy was linked to employment that has ended." },
  { ref: "10", label: "Tenant not occupying as their home", type: "discretionary", noticeDays: 0, summary: "The property is not the tenant's only or principal home." },
  { ref: "11", label: "Breach of tenancy agreement", type: "discretionary", noticeDays: 0, summary: "The tenant has broken a term of the tenancy (other than rent arrears)." },
  { ref: "12", label: "Rent arrears", type: "discretionary", noticeDays: 0, summary: "The tenant has been in rent arrears, typically over three or more consecutive months." },
  { ref: "13", label: "Criminal behaviour", type: "discretionary", noticeDays: 0, summary: "The tenant has a relevant criminal conviction." },
  { ref: "14", label: "Anti-social behaviour", type: "discretionary", noticeDays: 0, summary: "The tenant has behaved in an anti-social manner." },
  { ref: "15", label: "Association with a relevant person", type: "discretionary", noticeDays: 0, summary: "The tenant associates with someone with a relevant conviction or anti-social behaviour." },
  { ref: "16", label: "Landlord registration refused/revoked", type: "discretionary", noticeDays: 0, summary: "The landlord is no longer registered with the local authority." },
  { ref: "17", label: "HMO licence revoked", type: "discretionary", noticeDays: 0, summary: "The HMO licence for the property has been revoked." },
  { ref: "18", label: "Overcrowding statutory notice", type: "discretionary", noticeDays: 0, summary: "An overcrowding statutory notice has been served on the landlord." },
];

export const SCOTLAND_TEMPLATES: Template[] = [
  {
    kind: "notice_to_leave",
    jurisdiction: "scotland",
    version: "PHT-2016.1",
    title: "Notice to Leave (Private Residential Tenancy)",
    prescribedForm: "Notice to Leave",
    statutoryBasis: "Private Housing (Tenancies) (Scotland) Act 2016 s.50–52, Sch 3",
    legislationUrl: "https://www.legislation.gov.uk/asp/2016/19/contents",
    body: `NOTICE TO LEAVE
(Private Housing (Tenancies) (Scotland) Act 2016)

To: {{tenant_name}}
Property: {{property_address}}

The landlord is giving you notice that they intend to apply to the First-tier
Tribunal for an eviction order on the following ground(s):
{{grounds}}

You are expected to leave the property by: {{leave_date}}
(notice period: {{notice_days}} days, based on your length of occupation).

If you do not leave, the landlord may apply to the Tribunal on or after that
date. The Tribunal will decide whether it is reasonable to grant eviction.

Signed: {{landlord_name}}
Date served: {{served_date}}

Template-assisted, not legal advice. Verify against the current Notice to Leave
form on mygov.scot before serving.`,
  },
  {
    kind: "prt_agreement",
    jurisdiction: "scotland",
    version: "PHT-2016.1",
    title: "Private Residential Tenancy agreement",
    prescribedForm: "Scottish Government Model Tenancy Agreement",
    statutoryBasis: "Private Housing (Tenancies) (Scotland) Act 2016",
    legislationUrl: "https://www.gov.scot/publications/model-private-residential-tenancy-agreement/",
    body: `PRIVATE RESIDENTIAL TENANCY AGREEMENT

Landlord: {{landlord_name}}  (Registration no: {{registration_number}})
Tenant: {{tenant_name}}
Property: {{property_address}}
Start date: {{start_date}}
Rent: {{rent}} per month
Deposit: {{deposit}} (protected with an approved Scottish scheme)

This is an open-ended Private Residential Tenancy. It has no end date and
continues until the tenant gives notice or the Tribunal grants an eviction
order on a statutory ground.

Template-assisted, not legal advice. Use alongside the Scottish Government model
agreement and the statutory terms.`,
  },
];

export const SCOTLAND_TOOLS: ToolDescriptor[] = [
  {
    key: "notice_to_leave",
    jurisdiction: "scotland",
    slug: "notice-to-leave",
    title: "Notice to Leave (18 grounds)",
    blurb: "Choose grounds and produce a Notice to Leave with the right 28- or 84-day period.",
  },
  {
    key: "prt_agreement",
    jurisdiction: "scotland",
    slug: "prt-agreement",
    title: "PRT agreement",
    blurb: "Draft an open-ended Private Residential Tenancy agreement.",
  },
];
