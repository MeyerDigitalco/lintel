import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, SlaBadge, Timeline, humanAge } from "@/components/app/maintenance/ui";
import { updateStatus, assignContractor, recordCost } from "@/app/dashboard/maintenance/actions";
import { STATUS_FLOW } from "@/lib/maintenance";
import { gbp } from "@/lib/format";

export const dynamic = "force-dynamic";

const inputCls =
  "h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export default async function ManageRequest({ params }: { params: { id: string } }) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const { data: req } = await supabase
    .from("maintenance_requests")
    .select("id, title, description, category, priority, is_hazard, status, sla_due_at, created_at, scheduled_for, contractor_name, contractor_token, cost, properties(label)")
    .eq("org_id", orgId)
    .eq("id", params.id)
    .maybeSingle();
  if (!req) notFound();

  const { data: events } = await supabase
    .from("maintenance_events")
    .select("id, actor_role, kind, body, new_status, created_at")
    .eq("request_id", req.id)
    .order("created_at", { ascending: true });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const contractorLink = req.contractor_token
    ? `${appUrl}/maintenance/${req.contractor_token}`
    : null;

  return (
    <div>
      <Link href="/dashboard/maintenance" className="text-sm text-slate hover:text-ink">
        ← Maintenance
      </Link>
      <div className="mt-3">
        <PageHeader
          title={req.title}
          subtitle={(req as any).properties?.label}
          action={
            <div className="flex items-center gap-2">
              <SlaBadge dueAt={req.sla_due_at} status={req.status} />
              <StatusBadge status={req.status} />
            </div>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Details</h2>
            <p className="mt-2 text-sm text-ink">{req.description || "No description."}</p>
            <p className="mt-2 text-xs text-slate">
              {req.category} · {req.priority} · {humanAge(req.created_at)}
              {req.is_hazard && <Badge tone="red"> Hazard</Badge>}
            </p>

            {/* Status update */}
            <form action={updateStatus} className="mt-4 space-y-2">
              <input type="hidden" name="request_id" value={req.id} />
              <div className="flex gap-2">
                <select name="status" className={inputCls} defaultValue={req.status}>
                  {STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
                <Button size="sm" type="submit">Update</Button>
              </div>
              <input name="note" placeholder="Add a note (optional)" className={inputCls} />
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Contractor</h2>
            {req.contractor_name && (
              <p className="mt-1 text-sm text-ink">{req.contractor_name}</p>
            )}
            {contractorLink ? (
              <div className="mt-2">
                <p className="text-xs text-slate">Tokenised link (no account needed):</p>
                <code className="mt-1 block break-all rounded-lintel bg-paper px-2 py-1 text-xs text-evergreen">
                  {contractorLink}
                </code>
              </div>
            ) : (
              <form action={assignContractor} className="mt-3 space-y-2">
                <input type="hidden" name="request_id" value={req.id} />
                <input name="contractor_name" placeholder="Contractor name" className={inputCls} />
                <input name="contractor_email" type="email" placeholder="Email (optional)" className={inputCls} />
                <Button size="sm" type="submit">Assign & create link</Button>
              </form>
            )}

            {/* Cost / expense */}
            <div className="mt-5 border-t border-hairline pt-4">
              <h3 className="text-sm font-medium text-ink">Cost</h3>
              {req.cost ? (
                <p className="mt-1 text-sm text-slate">
                  {gbp(Number(req.cost), { decimals: true })} posted to expenses.
                </p>
              ) : (
                <form action={recordCost} className="mt-2 flex gap-2">
                  <input type="hidden" name="request_id" value={req.id} />
                  <input name="cost" placeholder="£ amount" className={inputCls} />
                  <Button size="sm" variant="outline" type="submit">Record</Button>
                </form>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody>
            <h2 className="mb-3 font-heading text-base font-semibold tracking-tight">Activity</h2>
            <Timeline events={events ?? []} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
