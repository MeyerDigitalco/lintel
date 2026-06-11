import type { JurisdictionKey } from "@/lib/jurisdictions";
import type { NoticeKind, Template, ToolDescriptor } from "./types";
import { ENGLAND_TEMPLATES, ENGLAND_TOOLS, SECTION_8_GROUNDS } from "./england";
import { WALES_TEMPLATES, WALES_TOOLS } from "./wales";
import { SCOTLAND_TEMPLATES, SCOTLAND_TOOLS, NOTICE_TO_LEAVE_GROUNDS } from "./scotland";
import { NI_TEMPLATES, NI_TOOLS } from "./northern-ireland";

export * from "./types";
export { SECTION_8_GROUNDS } from "./england";
export { NOTICE_TO_LEAVE_GROUNDS } from "./scotland";
export { noticeToQuitWeeks, NI_TEMPLATES } from "./northern-ireland";
export {
  WALES_S173_MIN_NOTICE_DAYS,
  WALES_WRITTEN_STATEMENT_DEADLINE_DAYS,
  FFHH_CHECKLIST,
} from "./wales";

const TEMPLATES: Template[] = [
  ...ENGLAND_TEMPLATES,
  ...WALES_TEMPLATES,
  ...SCOTLAND_TEMPLATES,
  ...NI_TEMPLATES,
];

const TOOLS: Record<JurisdictionKey, ToolDescriptor[]> = {
  england: ENGLAND_TOOLS,
  wales: WALES_TOOLS,
  scotland: SCOTLAND_TOOLS,
  northern_ireland: NI_TOOLS,
};

export function toolsForJurisdiction(j: JurisdictionKey): ToolDescriptor[] {
  return TOOLS[j] ?? [];
}

export function getTemplate(
  jurisdiction: JurisdictionKey,
  kind: NoticeKind
): Template | undefined {
  return TEMPLATES.find((t) => t.jurisdiction === jurisdiction && t.kind === kind);
}

/** Fill {{placeholders}} in a template body; missing values become a blank line. */
export function fillTemplate(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    values[key]?.trim() ? values[key] : "____________"
  );
}

/** Add N days to a date and return an ISO yyyy-mm-dd string. */
export function addDays(from: Date, days: number): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Scotland Notice to Leave period: 28 days if the tenant has lived in the
 * property for less than 6 months, otherwise 84 days.
 */
export function scotlandNoticeDays(residenceMonths: number): number {
  return residenceMonths < 6 ? 28 : 84;
}

/** Earliest possession date for an England Section 8 = max notice across grounds. */
export function section8EarliestDate(from: Date, groundRefs: string[]): { days: number; date: string } {
  const days = Math.max(
    0,
    ...groundRefs.map((r) => SECTION_8_GROUNDS.find((g) => g.ref === r)?.noticeDays ?? 0)
  );
  return { days, date: addDays(from, days) };
}
