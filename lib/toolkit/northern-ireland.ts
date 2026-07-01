import type { Template, ToolDescriptor } from "./types";

/**
 * Northern Ireland, Private Tenancies Act (NI) 2022.
 * Possession runs through a Notice to Quit. The minimum notice period scales
 * with how long the tenant has lived in the property.
 */

/** NI notice-to-quit minimum periods (Private Tenancies Act (NI) 2022). */
export function noticeToQuitWeeks(tenancyLengthMonths: number): number {
  if (tenancyLengthMonths <= 12) return 4;
  if (tenancyLengthMonths <= 120) return 8; // > 1 year, up to 10 years
  return 12; // over 10 years
}

export const NI_TEMPLATES: Template[] = [
  {
    kind: "notice_to_quit",
    jurisdiction: "northern_ireland",
    version: "PTA-NI-2022.1",
    title: "Notice to Quit",
    statutoryBasis: "Private Tenancies Act (Northern Ireland) 2022",
    legislationUrl: "https://www.legislation.gov.uk/nia/2022/2/contents",
    body: `NOTICE TO QUIT

To: {{tenant_name}}
Property: {{property_address}}

The landlord gives you notice to quit and deliver up possession of the property
on or after: {{quit_date}}
(minimum notice period: {{notice_weeks}} weeks, based on your length of tenancy).

This notice must be in writing and give the required minimum period. Certain
information must be included for the notice to be valid.

Signed: {{landlord_name}}
Date served: {{served_date}}

Template-assisted, not legal advice. Verify against nidirect / Department for
Communities guidance before serving.`,
  },
];

export const NI_TOOLS: ToolDescriptor[] = [
  {
    key: "notice_to_quit",
    jurisdiction: "northern_ireland",
    slug: "notice-to-quit",
    title: "Notice to Quit calculator",
    blurb: "Work out the minimum notice period (4/8/12 weeks) and produce a Notice to Quit.",
  },
];
