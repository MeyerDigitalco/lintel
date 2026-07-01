import type { QuarterlyPeriod } from "@/lib/mtd";

export const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const today = () => new Date();

export function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  const ms = d.getTime() - today().setHours(0, 0, 0, 0);
  return Math.ceil(ms / 86400000);
}

/**
 * MTD quarterly periods for a given tax year (6 Apr - 5 Apr).
 * Periods end 5 Jul, 5 Oct, 5 Jan, 5 Apr.
 */
export function quarterlyPeriods(taxYearStart: number): QuarterlyPeriod[] {
  const y = taxYearStart;
  return [
    { key: `${y}-Q1`, startDate: `${y}-04-06`, endDate: `${y}-07-05` },
    { key: `${y}-Q2`, startDate: `${y}-07-06`, endDate: `${y}-10-05` },
    { key: `${y}-Q3`, startDate: `${y}-10-06`, endDate: `${y + 1}-01-05` },
    { key: `${y}-Q4`, startDate: `${y + 1}-01-06`, endDate: `${y + 1}-04-05` },
  ];
}

/** The tax year start (calendar year) that a date falls into. */
export function taxYearStartFor(date = today()): number {
  const year = date.getFullYear();
  // Tax year starts 6 April.
  const aprBoundary = new Date(year, 3, 6);
  return date >= aprBoundary ? year : year - 1;
}
