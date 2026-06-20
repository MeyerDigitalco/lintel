import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, Timeline } from "@/components/app/maintenance/ui";
import { fmtDate } from "@/lib/dates";
import { formatMoney } from "@/lib/i18n/currency";
import {
  contractorAccept,
  contractorSchedule,
  contractorNote,
  contractorComplete,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

const inputCls =
  "h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

/**
 * Public contractor view — accessed via a tokenised link, no account required.
 * The token maps to a single job, so a contractor only ever sees the one job
 * (and its address) they were allocated. Reads use the service-role client.
 */
export default async function ContractorPage({
  params,
}: {
  params: { token: string };
}) {
  const service = createServiceClient();
  const { data: req } = await service
    .from("maintenance_requests")
    .select("id, org_id, title, description, category, priority, is_hazard, status, scheduled_for, scheduled_time, quote_amount, cost, contractor_name, property_id, properties(label, city, postcode)")
    .eq("contractor_token", params.token)
    .maybeSingle();
  if (!req) notFound();

  const [{ data: events }, { data: org }] = await Promise.all([
    service.from("maintenance_events").select("id, actor_role, kind, body, new_status, created_at").eq("request_id", req.id).order("created_at", { ascending: true }),
    service.from("orgs").select("currency").eq("id", (req as any).org_id).maybeSingle(),
  ]);
  const currency = ((org as any)?.currency as string) ?? "GBP";
  const money = (n: number) => formatMoney(n, currency, { decimals: true });

  const prop = (req as any).properties;
  const done = req.status === "completed" || req.status === "closed";

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex h-14 items-center border-b border-hairline px-4">
        <Logo />
      </header>
      <main className="mx-auto max-w-md px-4 py-6 space-y-4">
        <div>
          <p className="text-sm text-slate">Job for {req.contractor_name ?? "you"}</p>
          <h1 className="font-heading text-xl font-semibold tracking-tight">{req.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={req.status} />
            {req.is_hazard && (
              <span className="rounded-full bg-red/10 px-2 py-0.5 text-xs font-medium text-red">
                Hazard
              </span>
            )}
          </div>
        </div>

        <Card>
          <CardBody className="p-4 text-sm">
            {prop && (
              <p className="text-slate">
                {[prop.label, prop.city, prop.postcode].filter(Boolean).join(", ")}
              </p>
            )}
            {req.description && <p className="mt-2 text-ink">{req.description}</p>}
            <p className="mt-2 text-xs text-slate">
              {req.category} · {req.priority}
              {req.scheduled_for ? ` · scheduled ${fmtDate(req.scheduled_for)}${(req as any).scheduled_time ? ` at ${(req as any).scheduled_time}` : ""}` : ""}
            </p>
            {((req as any).quote_amount || (req as any).cost) && (
              <p className="mt-1 text-xs text-slate">
                {(req as any).quote_amount ? `Quote ${money(Number((req as any).quote_amount))}` : ""}
                {(req as any).quote_amount && (req as any).cost ? " · " : ""}
                {(req as any).cost ? `Final ${money(Number((req as any).cost))}` : ""}
              </p>
            )}
          </CardBody>
        </Card>

        {!done && (
          <Card>
            <CardBody className="space-y-5">
              {req.status === "assigned" && (
                <form action={contractorAccept}>
                  <input type="hidden" name="token" value={params.token} />
                  <Button type="submit" className="w-full">Accept job</Button>
                </form>
              )}

              {/* Schedule visit + quote */}
              <form action={contractorSchedule} className="space-y-2">
                <input type="hidden" name="token" value={params.token} />
                <p className="text-xs font-medium uppercase tracking-wide text-slate">Schedule &amp; quote</p>
                <div className="flex gap-2">
                  <input name="scheduled_for" type="date" className={inputCls} aria-label="Date" />
                  <input name="scheduled_time" type="time" className={inputCls} aria-label="Time" />
                </div>
                <input name="quote_amount" inputMode="decimal" placeholder={`Quote (${currency})`} className={inputCls} />
                <Button type="submit" variant="outline" className="w-full" size="sm">Save schedule &amp; quote</Button>
              </form>

              {/* Complete with final cost + photos */}
              <form action={contractorComplete} className="space-y-2">
                <input type="hidden" name="token" value={params.token} />
                <p className="text-xs font-medium uppercase tracking-wide text-slate">Complete the job</p>
                <input name="cost" inputMode="decimal" placeholder={`Final cost (${currency})`} className={inputCls} />
                <input
                  name="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="block w-full text-sm text-slate file:mr-3 file:rounded-lintel file:border file:border-hairline file:bg-paper file:px-3 file:py-2 file:text-sm"
                />
                <p className="text-xs text-slate">Add one or more photos of the completed work.</p>
                <Button type="submit" className="w-full">Mark complete</Button>
              </form>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody>
            <h2 className="mb-3 font-heading text-sm font-semibold tracking-tight">Activity</h2>
            <Timeline events={events ?? []} />
            <form action={contractorNote} className="mt-4 flex gap-2">
              <input type="hidden" name="token" value={params.token} />
              <input name="body" required placeholder="Add an update…" className={inputCls} />
              <Button type="submit" size="sm">Send</Button>
            </form>
          </CardBody>
        </Card>

        <p className="text-center text-xs text-slate">
          Secure contractor link from Lintel. Do not share.
        </p>
      </main>
    </div>
  );
}
