/**
 * Region-aware tenancy agreement generator, shared types.
 *
 * IMPORTANT, read before adding a region.
 *
 * These are drafting aids, not certified legal instruments. Several regions
 * mandate a prescribed form or prescribed statutory content (Scotland's model
 * PRT, a Welsh occupation contract written statement, Ireland's RTB rules). For
 * those regions we point the user at the official form rather than pretending a
 * generated document replaces it. Every generated document carries a provenance
 * block naming the statute it was drafted against and the template version, so
 * a solicitor reviewing it can see exactly what basis it was built on.
 *
 * Never describe output as "legally compliant" in UI copy. The honest claim is
 * "drafted against <statute>, review before use".
 */

/** What kind of input a required detail needs. */
export type FieldType = "text" | "longtext" | "number" | "money" | "date" | "select" | "checkbox";

export interface AgreementField {
  key: string;
  label: string;
  type: FieldType;
  /** Blocks generation when missing. */
  required?: boolean;
  /** Options for `select`. */
  options?: string[];
  /** Shown under the input. Use it to explain the legal reason the field exists. */
  hint?: string;
  /** Prefill path from the property/tenancy record, e.g. "property.address". */
  prefill?: string;
  placeholder?: string;
}

export interface AgreementClause {
  /** Stable id so clause edits are traceable across template versions. */
  id: string;
  heading: string;
  /** Body with {{placeholders}} resolved from field values. */
  body: string;
  /**
   * Statutory clauses are required by law in the region and cannot be removed
   * by the user. Optional clauses can be toggled off.
   */
  statutory?: boolean;
  /** Default toggle state for non-statutory clauses. */
  defaultOn?: boolean;
  /** The provision this clause implements, shown in the provenance block. */
  basis?: string;
}

/**
 * A declarative rule about the values, checked before we will generate.
 *
 * Deliberately data, not a predicate function: specs cross the server/client
 * boundary into the form component, and functions are not serialisable.
 *
 * severity "error" blocks generation. Use it only where producing the document
 * would be actively wrong, such as a Scottish PRT carrying an end date (the
 * summary would contradict the statutory clause) or letting an EPC G property
 * in France (unlawful). Use "warning" where the landlord may have a legitimate
 * reason, such as an English EPC F/G with a registered exemption.
 */
export interface AgreementConstraint {
  field: string;
  rule: "empty" | "notEqual";
  /** Compared against for "notEqual". */
  value?: string;
  severity: "error" | "warning";
  message: string;
}

export interface AgreementSpec {
  /** ISO country code, or a UK nation key such as "GB-SCT". */
  key: string;
  countryName: string;
  /** Region label shown in the UI, e.g. "Scotland", "New South Wales". */
  regionName?: string;
  /** What the agreement is actually called locally. */
  documentTitle: string;
  /** Template version, bump when the legislative basis changes. */
  version: string;
  statutoryBasis: string;
  legislationUrl: string;
  /**
   * Set when the region mandates an official form. We still generate a draft,
   * but the UI must lead with this warning and link to the official source.
   */
  prescribedForm?: { name: string; url: string; note: string };
  /** Region-specific details on top of the universal field set. */
  fields: AgreementField[];
  /** Region-specific clauses appended to the universal clause set. */
  clauses: AgreementClause[];
  /** Documents that must be served with or before the agreement. */
  attachments: { label: string; note: string }[];
  /** Hard warnings surfaced prominently in the UI before download. */
  warnings: string[];
  /** Value-level rules checked before generation. */
  constraints?: AgreementConstraint[];
}

export interface AgreementInput {
  spec: AgreementSpec;
  values: Record<string, string>;
  /** Clause ids the user switched off. Statutory ids are ignored. */
  disabledClauseIds?: string[];
}

/** A fully composed, render ready document. */
export interface ComposedAgreement {
  title: string;
  subtitle: string;
  /** Ordered sections; renderers walk this and stay format agnostic. */
  sections: { heading: string; paragraphs: string[] }[];
  /** Key/value summary table rendered near the top. */
  summary: { label: string; value: string }[];
  signatureBlocks: { role: string; name: string }[];
  provenance: string[];
  warnings: string[];
}
