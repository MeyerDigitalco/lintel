import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/app/ui";
import type { ReadinessResult, CheckStatus } from "@/lib/court-readiness";

const ring: Record<ReadinessResult["rag"], string> = {
  green: "text-evergreen",
  amber: "text-amber",
  red: "text-red",
};
const dot: Record<CheckStatus, string> = {
  ok: "bg-evergreen",
  warning: "bg-amber",
  fail: "bg-red",
  na: "bg-hairline",
};
const statusLabel: Record<CheckStatus, string> = {
  ok: "OK",
  warning: "Check",
  fail: "Missing",
  na: "N/A",
};

export function ReadinessScore({ result }: { result: ReadinessResult }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold tracking-tight">
            Court-readiness
          </h2>
          <Badge tone={result.rag === "green" ? "moss" : result.rag === "amber" ? "amber" : "red"}>
            {result.rag === "green" ? "Strong" : result.rag === "amber" ? "Needs attention" : "At risk"}
          </Badge>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`font-heading text-3xl font-semibold tabular-nums ${ring[result.rag]}`}>
            {result.score}
          </span>
          <span className="text-sm text-slate">/ 100</span>
        </div>
        <ul className="mt-4 space-y-2">
          {result.checks.map((c) => (
            <li key={c.key} className="flex items-start gap-2 text-sm">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot[c.status]}`} />
              <span className="flex-1">
                <span className="text-ink">{c.label}</span>
                <span className="ml-2 text-xs text-slate">{statusLabel[c.status]}</span>
                <span className="block text-xs text-slate">{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate">
          Indicator only, not legal advice. Address anything flagged before
          relying on the tenancy in a possession claim.
        </p>
      </CardBody>
    </Card>
  );
}
