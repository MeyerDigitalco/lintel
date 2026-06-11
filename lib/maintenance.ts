import type { JurisdictionKey } from "@/lib/jurisdictions";

/**
 * Maintenance domain helpers — SLA / hazard-response timers and status flow.
 *
 * Hazard-response reflects Awaab's-Law-style duties: where a property has a
 * serious hazard, the landlord must act on a tight statutory-style clock. We
 * apply the shortest timer in England (where Awaab's Law applies) and a strict
 * default elsewhere. These are indicative defaults, not legal timeframes.
 */

export type Priority = "emergency" | "urgent" | "routine";
export type RequestStatus =
  | "raised"
  | "triaged"
  | "assigned"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "closed";

export const PRIORITY_HOURS: Record<Priority, number> = {
  emergency: 24,
  urgent: 24 * 7,
  routine: 24 * 28,
};

/** Compute the SLA deadline (hours from now) for a new request. */
export function slaHours(
  priority: Priority,
  isHazard: boolean,
  jurisdiction: JurisdictionKey
): number {
  if (isHazard) {
    // Awaab's-Law-style: investigate/act fast. England gets the tightest clock.
    return jurisdiction === "england" ? 24 : 48;
  }
  return PRIORITY_HOURS[priority] ?? PRIORITY_HOURS.routine;
}

export function slaDueAt(
  priority: Priority,
  isHazard: boolean,
  jurisdiction: JurisdictionKey,
  from: Date = new Date()
): string {
  const due = new Date(from);
  due.setHours(due.getHours() + slaHours(priority, isHazard, jurisdiction));
  return due.toISOString();
}

/** Hours of age for a request. */
export function ageHours(createdAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 3.6e6));
}

export function slaState(
  dueAt: string | null,
  status: RequestStatus
): "ok" | "due_soon" | "breached" | "done" {
  if (status === "completed" || status === "closed") return "done";
  if (!dueAt) return "ok";
  const ms = new Date(dueAt).getTime() - Date.now();
  if (ms < 0) return "breached";
  if (ms < 24 * 3.6e6) return "due_soon";
  return "ok";
}

/** Allowed next statuses for a given role. */
export const STATUS_FLOW: RequestStatus[] = [
  "raised",
  "triaged",
  "assigned",
  "scheduled",
  "in_progress",
  "completed",
  "closed",
];

export function humanStatus(s: string): string {
  return s.replace(/_/g, " ");
}

export function humanAge(createdAt: string): string {
  const h = ageHours(createdAt);
  if (h < 24) return `${h}h old`;
  return `${Math.floor(h / 24)}d old`;
}

/** Generate a URL-safe contractor token. */
export function newContractorToken(): string {
  const bytes =
    typeof crypto !== "undefined" && "getRandomValues" in crypto
      ? crypto.getRandomValues(new Uint8Array(24))
      : Uint8Array.from({ length: 24 }, () => Math.floor(Math.random() * 256));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
