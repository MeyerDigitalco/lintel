import type { AgreementClause, AgreementField, AgreementInput, AgreementSpec, ComposedAgreement } from "./types";

/**
 * Universal field set. Every region needs these; regions add their own on top.
 * Ordering here is the ordering shown in the form.
 */
export const CORE_FIELDS: AgreementField[] = [
  { key: "landlord_name", label: "Landlord full name", type: "text", required: true, prefill: "org.name" },
  { key: "landlord_address", label: "Landlord address for service", type: "longtext", required: true, hint: "Most regions require an address in the country where the tenant can serve documents." },
  { key: "landlord_email", label: "Landlord email", type: "text" },
  { key: "landlord_phone", label: "Landlord phone", type: "text" },
  { key: "agent_name", label: "Managing agent (if any)", type: "text" },
  { key: "tenant_name", label: "Tenant full name(s)", type: "text", required: true, prefill: "tenancy.tenant_name", hint: "Name every adult tenant. Anyone not named has no rights and no obligations under this agreement." },
  { key: "tenant_email", label: "Tenant email", type: "text", prefill: "tenancy.tenant_email" },
  { key: "tenant_phone", label: "Tenant phone", type: "text", prefill: "tenancy.tenant_phone" },
  { key: "property_address", label: "Property address", type: "longtext", required: true, prefill: "property.address" },
  { key: "property_description", label: "What is let", type: "longtext", hint: "Be precise. For a room let, name the room and the shared areas.", placeholder: "The whole of the property including garden and garage" },
  { key: "furnished", label: "Furnishing", type: "select", options: ["Unfurnished", "Part furnished", "Furnished"], required: true },
  { key: "start_date", label: "Start date", type: "date", required: true, prefill: "tenancy.start_date" },
  { key: "end_date", label: "End date", type: "date", prefill: "tenancy.end_date", hint: "Leave blank for a rolling or open ended tenancy." },
  { key: "term_type", label: "Term", type: "select", options: ["Fixed term", "Periodic (rolling)", "Fixed term then periodic"], required: true },
  { key: "rent_amount", label: "Rent", type: "money", required: true, prefill: "tenancy.rent_amount" },
  { key: "rent_period", label: "Rent period", type: "select", options: ["per month", "per week", "per calendar month", "per year"], required: true },
  { key: "rent_day", label: "Rent due on", type: "text", required: true, placeholder: "the 1st day of each month" },
  { key: "rent_method", label: "How rent is paid", type: "text", placeholder: "Bank transfer to the account notified to the tenant" },
  { key: "deposit_amount", label: "Deposit", type: "money", prefill: "tenancy.deposit_amount" },
  { key: "bills_included", label: "Bills included in the rent", type: "text", placeholder: "None. The tenant pays all utilities and council tax." },
  { key: "pets", label: "Pets", type: "select", options: ["Not permitted without consent", "Permitted", "Permitted with conditions"] },
  { key: "smoking", label: "Smoking", type: "select", options: ["Not permitted", "Permitted"] },
  { key: "sharers", label: "Permitted occupiers", type: "text", hint: "Children or others who may live there but are not tenants.", placeholder: "None" },
  { key: "special_terms", label: "Additional terms", type: "longtext", hint: "Anything agreed that is not covered above. Keep it fair and specific." },
];

/**
 * Universal clause set, written to be true in essentially every jurisdiction
 * we support. Anything region specific belongs in that region's spec, not here.
 */
export const CORE_CLAUSES: AgreementClause[] = [
  {
    id: "parties",
    heading: "The parties",
    statutory: true,
    body:
      "This agreement is made between {{landlord_name}} of {{landlord_address}} (the Landlord) and {{tenant_name}} (the Tenant).\n\n" +
      "Where more than one person is named as Tenant, their obligations are joint and several. That means each tenant is responsible for the whole of the rent and for any breach of this agreement, not merely a share of it.\n\n" +
      "The Landlord's address above is the address at which the Tenant may serve notices and other documents on the Landlord.",
  },
  {
    id: "property",
    heading: "The property",
    statutory: true,
    body:
      "The Landlord lets to the Tenant the property known as {{property_address}} (the Property).\n\n" +
      "What is let: {{property_description}}\n\n" +
      "The Property is let {{furnished}}. Where the Property is let furnished or part furnished, an inventory and schedule of condition forms part of this agreement.\n\n" +
      "The following people may also live at the Property without being tenants: {{sharers}}",
  },
  {
    id: "term",
    heading: "Length of the tenancy",
    statutory: true,
    body:
      "The tenancy is a {{term_type}} tenancy beginning on {{start_date}} and, where a fixed term applies, ending on {{end_date}}.\n\n" +
      "Neither party may end a fixed term early except as this agreement or the law allows.",
  },
  {
    id: "rent",
    heading: "Rent",
    statutory: true,
    body:
      "The rent is {{rent_amount}} {{rent_period}}, payable in advance on {{rent_day}}.\n\n" +
      "Payment method: {{rent_method}}\n\n" +
      "Bills included in the rent: {{bills_included}}\n\n" +
      "The Tenant must pay the rent in full on the due date without deduction or set off, except where the law expressly permits a deduction.",
  },
  {
    id: "deposit",
    heading: "Deposit",
    body:
      "The Tenant has paid or will pay a deposit of {{deposit_amount}} before the start of the tenancy.\n\n" +
      "The deposit is security against unpaid rent, damage beyond fair wear and tear, unpaid bills for which the Tenant is liable, and any breach of this agreement. It is not rent and may not be treated by the Tenant as payment of the final period's rent.\n\n" +
      "The deposit will be returned to the Tenant at the end of the tenancy, less any sums properly deducted, within the period the law requires. The Landlord will give the Tenant a written breakdown of any deduction.",
  },
  {
    id: "tenant_obligations",
    heading: "The Tenant's obligations",
    body:
      "The Tenant agrees to:\n\n" +
      "(a) pay the rent on time;\n" +
      "(b) use the Property as a private home only, and not to run a business from it without the Landlord's written consent;\n" +
      "(c) keep the interior of the Property in good and clean condition, fair wear and tear excepted;\n" +
      "(d) not make alterations, redecorate or install fixtures without the Landlord's written consent;\n" +
      "(e) not do anything that causes a nuisance or annoyance to neighbours or other occupiers;\n" +
      "(f) not sublet the Property or any part of it, and not part with possession of it, without the Landlord's written consent;\n" +
      "(g) report any disrepair, damage or defect to the Landlord promptly;\n" +
      "(h) test smoke and heat alarms regularly and replace batteries where the alarms are battery operated;\n" +
      "(i) not keep pets at the Property except as stated: {{pets}};\n" +
      "(j) observe the smoking policy: smoking is {{smoking}} at the Property;\n" +
      "(k) allow the Landlord access in accordance with this agreement;\n" +
      "(l) return the Property and all keys at the end of the tenancy in the condition required by this agreement.",
  },
  {
    id: "landlord_obligations",
    heading: "The Landlord's obligations",
    body:
      "The Landlord agrees to:\n\n" +
      "(a) give the Tenant quiet enjoyment of the Property, meaning the Landlord will not interfere with the Tenant's lawful occupation;\n" +
      "(b) keep the structure and exterior of the Property in repair;\n" +
      "(c) keep the installations for the supply of water, gas, electricity, sanitation, space heating and water heating in repair and proper working order;\n" +
      "(d) keep the Property fit for human habitation to the standard required by law in the place where the Property is situated;\n" +
      "(e) insure the structure of the Property;\n" +
      "(f) carry out repairs within a reasonable time of being told about them, and urgent repairs promptly;\n" +
      "(g) hold and return the deposit as required by law;\n" +
      "(h) provide the Tenant with the documents and information the law requires, before or at the start of the tenancy.\n\n" +
      "The Landlord may not require the Tenant to give up any right the law gives the Tenant. Any term of this agreement that tries to do so has no effect.",
  },
  {
    id: "access",
    heading: "Access to the Property",
    body:
      "The Landlord and anyone authorised by the Landlord may enter the Property to inspect it, carry out repairs, or carry out a legal obligation, provided the Landlord gives the Tenant at least the notice the law requires and comes at a reasonable time of day.\n\n" +
      "The Tenant may not unreasonably refuse access. The Landlord may enter without notice only in a genuine emergency, such as fire, flood or a suspected gas leak, where waiting would risk injury or serious damage.\n\n" +
      "The Landlord may not use a key to enter the Property while the Tenant is in occupation except as set out above.",
  },
  {
    id: "utilities",
    heading: "Utilities, council tax and other charges",
    body:
      "Except for any bills stated above as included in the rent, the Tenant is responsible for the accounts and charges for the Property during the tenancy, including electricity, gas, water, sewerage, any local property or occupancy tax payable by an occupier, broadband, television licensing where applicable, and any similar charge.\n\n" +
      "The Tenant must give meter readings at the start and end of the tenancy and must not change the utility supplier without telling the Landlord.",
  },
  {
    id: "ending",
    heading: "Ending the tenancy",
    body:
      "This tenancy may be ended in the ways the law of the place where the Property is situated allows, and in no other way.\n\n" +
      "The Landlord must use the correct statutory notice and must give the Tenant the full notice period the law requires. The Landlord may not evict the Tenant without a court or tribunal order where the law requires one.\n\n" +
      "The Tenant must give the Landlord the notice the law requires, or the notice stated in this agreement where that is longer and the law permits it.\n\n" +
      "At the end of the tenancy the Tenant must remove all belongings and rubbish, return every key, and give the Landlord a forwarding address.",
  },
  {
    id: "deposit_return",
    heading: "Condition and inventory",
    body:
      "An inventory and schedule of condition will be prepared at the start of the tenancy and signed by both parties. The Tenant should check it carefully and raise any disagreement in writing within the period stated in it.\n\n" +
      "The Property will be inspected at the end of the tenancy against that inventory. The Tenant is not responsible for fair wear and tear, meaning the deterioration that happens through ordinary use over time.",
  },
  {
    id: "data",
    heading: "Personal data",
    defaultOn: true,
    body:
      "The Landlord processes the Tenant's personal data to manage the tenancy, comply with legal obligations, and where necessary to protect the Landlord's legitimate interests. Data may be shared with the managing agent, contractors attending the Property, a deposit scheme, a local authority or tax authority where required, and professional advisers.\n\n" +
      "The Tenant may ask for a copy of the personal data held about them and may ask for inaccurate data to be corrected.",
  },
  {
    id: "notices_clause",
    heading: "Serving notices",
    body:
      "Notices under this agreement must be in writing. A notice to the Tenant may be delivered by hand to the Property, sent by post to the Property, or, where the Tenant has agreed in writing to accept service by email, sent to {{tenant_email}}.\n\n" +
      "A notice to the Landlord must be sent to the Landlord's address for service given above.\n\n" +
      "Nothing in this clause overrides a statutory rule about how a particular notice must be served. Where the law prescribes a method or a form, that method or form must be used.",
  },
  {
    id: "special",
    heading: "Additional agreed terms",
    defaultOn: true,
    body: "{{special_terms}}",
  },
  {
    id: "whole",
    heading: "General",
    body:
      "If any term of this agreement is found to be unenforceable, the rest of the agreement continues to apply.\n\n" +
      "A failure by the Landlord to enforce a term on one occasion does not prevent the Landlord enforcing it later.\n\n" +
      "This agreement does not remove or reduce any right the Tenant has under the law of the place where the Property is situated. Where a term of this agreement conflicts with that law, the law applies.",
  },
];

/** Substitute {{placeholders}}; unresolved values become a visible blank. */
export function fill(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k: string) => {
    const v = values[k];
    return v && v.trim() ? v.trim() : "________________";
  });
}

/** True when a clause survives the user's toggles. Statutory clauses always do. */
function clauseEnabled(c: AgreementClause, disabled: string[]): boolean {
  if (c.statutory) return true;
  return !disabled.includes(c.id);
}

/**
 * Drop clauses whose entire body resolves to nothing useful, so an agreement
 * with no additional terms does not carry an empty "Additional agreed terms"
 * heading followed by a blank line.
 */
function isEmptyAfterFill(c: AgreementClause, values: Record<string, string>): boolean {
  const onlyPlaceholder = /^\s*\{\{(\w+)\}\}\s*$/.exec(c.body);
  if (!onlyPlaceholder) return false;
  const v = values[onlyPlaceholder[1]];
  return !v || !v.trim();
}

/**
 * Check a region's declarative constraints against the entered values.
 * Errors block generation; warnings are shown but do not block.
 */
export function checkConstraints(
  spec: AgreementSpec,
  values: Record<string, string>
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const c of spec.constraints ?? []) {
    const v = (values[c.field] ?? "").trim();
    const broken =
      c.rule === "empty" ? v !== "" : c.rule === "notEqual" ? v === (c.value ?? "") : false;
    if (broken) (c.severity === "error" ? errors : warnings).push(c.message);
  }
  return { errors, warnings };
}

export function missingRequired(fields: AgreementField[], values: Record<string, string>): string[] {
  return fields.filter((f) => f.required && !values[f.key]?.trim()).map((f) => f.label);
}

/** Compose a region's spec plus the user's values into a render ready document. */
export function composeAgreement(input: AgreementInput): ComposedAgreement {
  const { spec, values } = input;
  const disabled = input.disabledClauseIds ?? [];
  // A region clause may supersede a core clause; drop the core one so the
  // document never states a general rule its own region clause contradicts.
  const superseded = new Set(spec.clauses.map((c) => c.replaces).filter(Boolean) as string[]);
  const all = [...CORE_CLAUSES.filter((c) => !superseded.has(c.id)), ...spec.clauses];

  const sections = all
    .filter((c) => clauseEnabled(c, disabled) && !isEmptyAfterFill(c, values))
    .map((c) => ({
      heading: c.heading,
      paragraphs: fill(c.body, values)
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean),
    }));

  const term =
    values.term_type === "Fixed term" && values.end_date
      ? `${values.start_date} to ${values.end_date}`
      : values.start_date
      ? `From ${values.start_date}`
      : "";

  const summary = [
    { label: "Property", value: values.property_address ?? "" },
    { label: "Landlord", value: values.landlord_name ?? "" },
    { label: "Tenant", value: values.tenant_name ?? "" },
    { label: "Term", value: term },
    { label: "Rent", value: [values.rent_amount, values.rent_period].filter(Boolean).join(" ") },
    { label: "Deposit", value: values.deposit_amount ?? "Not applicable" },
    { label: "Governing law", value: spec.statutoryBasis },
  ].filter((r) => r.value);

  const signatureBlocks = [
    { role: "Landlord", name: values.landlord_name ?? "" },
    { role: "Tenant", name: values.tenant_name ?? "" },
  ];

  const provenance = [
    `Drafted against: ${spec.statutoryBasis}`,
    `Template version: ${spec.version}`,
    `Generated: ${new Date().toISOString().slice(0, 10)} by Lintel Squared`,
    `Source: ${spec.legislationUrl}`,
  ];

  const warnings = [
    "This document is template assisted and is not legal advice. Have it reviewed by a qualified lawyer in the relevant jurisdiction before you rely on it.",
    ...spec.warnings,
  ];
  if (spec.prescribedForm) {
    warnings.unshift(
      `${spec.regionName ?? spec.countryName} requires the prescribed form "${spec.prescribedForm.name}". ${spec.prescribedForm.note} Official source: ${spec.prescribedForm.url}`
    );
  }

  return {
    title: spec.documentTitle,
    subtitle: [spec.regionName, spec.countryName].filter(Boolean).join(", "),
    sections,
    summary,
    signatureBlocks,
    provenance,
    warnings,
  };
}
