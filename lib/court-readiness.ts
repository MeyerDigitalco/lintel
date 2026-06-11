/**
 * Court-readiness score.
 *
 * Estimates how well a tenancy would stand up if the landlord needed to rely on
 * it (e.g. a possession claim): are the prescribed documents served, was the
 * deposit protected in time, are safety certificates in date, is the landlord
 * registered where required, and (England) was Right to Rent checked.
 *
 * This is an indicator, not legal advice. The pure scorer below is
 * dependency-free and unit-tested; data gathering lives in
 * court-readiness-server.ts.
 */

export type CheckStatus = "ok" | "warning" | "fail" | "na";

export interface ReadinessCheck {
  key: string;
  label: string;
  status: CheckStatus;
  detail: string;
  weight: number;
}

export interface ReadinessInput {
  /** statutory deposit-protection deadline in days */
  protectionDeadlineDays: number;
  requiresRegistration: boolean;
  rightToRentApplies: boolean;
  /** prescribed start-of-tenancy documents for the nation */
  prescribedDocs: { key: string; label: string }[];
  startDate: string | null;
  depositAmount: number | null;
  depositProtectedAt: string | null;
  /** keys of documents we have evidence were served/held */
  servedDocKeys: string[];
  /** true=in date, false=expired/overdue, null=unknown/not recorded */
  gasInDate: boolean | null;
  eicrInDate: boolean | null;
  epcInDate: boolean | null;
  registrationValid: boolean;
  rightToRentDone: boolean;
}

export interface ReadinessResult {
  score: number; // 0-100
  rag: "green" | "amber" | "red";
  checks: ReadinessCheck[];
}

const factor = (s: CheckStatus) => (s === "ok" ? 1 : s === "warning" ? 0.5 : s === "na" ? 1 : 0);

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function scoreReadiness(input: ReadinessInput): ReadinessResult {
  const checks: ReadinessCheck[] = [];

  // Deposit protection
  if (!input.depositAmount || input.depositAmount <= 0) {
    checks.push({ key: "deposit", label: "Deposit protection", status: "na", detail: "No deposit held.", weight: 25 });
  } else if (!input.depositProtectedAt) {
    checks.push({ key: "deposit", label: "Deposit protection", status: "fail", detail: "Deposit not recorded as protected.", weight: 25 });
  } else if (input.startDate && daysBetween(input.startDate, input.depositProtectedAt) > input.protectionDeadlineDays) {
    checks.push({ key: "deposit", label: "Deposit protection", status: "warning", detail: `Protected, but after the ${input.protectionDeadlineDays}-day deadline.`, weight: 25 });
  } else {
    checks.push({ key: "deposit", label: "Deposit protection", status: "ok", detail: "Protected within the statutory window.", weight: 25 });
  }

  // Prescribed documents served
  if (input.prescribedDocs.length === 0) {
    checks.push({ key: "docs", label: "Prescribed documents", status: "na", detail: "None required.", weight: 20 });
  } else {
    const served = input.prescribedDocs.filter((d) => input.servedDocKeys.includes(d.key));
    const missing = input.prescribedDocs.filter((d) => !input.servedDocKeys.includes(d.key));
    const status: CheckStatus = missing.length === 0 ? "ok" : served.length === 0 ? "fail" : "warning";
    checks.push({
      key: "docs",
      label: "Prescribed documents served",
      status,
      detail: missing.length === 0 ? "All required documents recorded." : `Missing: ${missing.map((d) => d.label).join(", ")}.`,
      weight: 20,
    });
  }

  // Certificates
  const cert = (key: string, label: string, v: boolean | null, weight: number) =>
    checks.push({
      key,
      label,
      status: v === true ? "ok" : v === false ? "fail" : "warning",
      detail: v === true ? "In date." : v === false ? "Expired or overdue." : "Not recorded.",
      weight,
    });
  cert("gas", "Gas safety certificate", input.gasInDate, 15);
  cert("eicr", "Electrical (EICR)", input.eicrInDate, 12);
  cert("epc", "EPC", input.epcInDate, 6);

  // Registration
  if (input.requiresRegistration) {
    checks.push({
      key: "registration",
      label: "Landlord registration",
      status: input.registrationValid ? "ok" : "fail",
      detail: input.registrationValid ? "Registered and current." : "No valid registration recorded.",
      weight: 15,
    });
  }

  // Right to Rent (England)
  if (input.rightToRentApplies) {
    checks.push({
      key: "right_to_rent",
      label: "Right to Rent check",
      status: input.rightToRentDone ? "ok" : "fail",
      detail: input.rightToRentDone ? "Completed." : "Not recorded.",
      weight: 7,
    });
  }

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + c.weight * factor(c.status), 0);
  const score = totalWeight ? Math.round((got / totalWeight) * 100) : 0;
  const rag = score >= 85 ? "green" : score >= 60 ? "amber" : "red";

  return { score, rag, checks };
}
