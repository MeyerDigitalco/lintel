import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/app/ui";
import { saveHmrcIds, submitQuarterly } from "@/app/dashboard/tax/actions";
import type { QuarterlyPeriod } from "@/lib/mtd";

const inputCls =
  "h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

/**
 * HMRC MTD ITSA panel. Only rendered when the HMRC provider is active. Until
 * recognition is granted, submission controls are shown as unavailable — we
 * never present a working "file to HMRC" action before recognition.
 */
export function HmrcPanel({
  connected,
  recognised,
  maskedNino,
  businessId,
  periods,
}: {
  connected: boolean;
  recognised: boolean;
  maskedNino: string | null;
  businessId: string | null;
  periods: QuarterlyPeriod[];
}) {
  return (
    <Card className="mb-6 border-evergreen/30">
      <CardBody>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold tracking-tight">
            HMRC Making Tax Digital
          </h2>
          {connected ? (
            <Badge tone="mint">Connected</Badge>
          ) : (
            <Badge tone="amber">Not connected</Badge>
          )}
        </div>

        {!connected ? (
          <div className="mt-3">
            <p className="text-sm text-slate">
              Connect your HMRC account to retrieve obligations and (once Lintel
              is HMRC-recognised) submit quarterly updates.
            </p>
            <a href="/api/hmrc/connect" className="mt-3 inline-block">
              <Button>Connect to HMRC</Button>
            </a>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            <p className="text-sm text-slate">
              Connected{maskedNino ? ` · NINO ${maskedNino}` : ""}
              {businessId ? ` · business ${businessId}` : ""}.
            </p>

            {(!maskedNino || !businessId) && (
              <form action={saveHmrcIds} className="grid gap-2 sm:grid-cols-2">
                <input name="nino" placeholder="National Insurance number" className={inputCls} />
                <input name="business_id" placeholder="Property business id" className={inputCls} />
                <div className="sm:col-span-2">
                  <Button size="sm" type="submit">Save identifiers</Button>
                </div>
              </form>
            )}

            <div className="rounded-lintel bg-paper p-3">
              {recognised ? (
                <form action={submitQuarterly} className="flex items-center gap-2">
                  <select name="period_key" className={inputCls}>
                    {periods.map((p, i) => (
                      <option key={p.key} value={p.key}>Q{i + 1} (ends {p.endDate})</option>
                    ))}
                  </select>
                  <Button size="sm" type="submit">Submit quarterly update</Button>
                </form>
              ) : (
                <p className="text-xs text-slate">
                  Submission to HMRC switches on once Lintel is HMRC-recognised.
                  Until then, your quarterly summaries are kept ready and can be
                  exported for your accountant.
                </p>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
