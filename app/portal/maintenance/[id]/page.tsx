import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenant } from "@/lib/tenant-auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, SlaBadge, Timeline, humanAge } from "@/components/app/maintenance/ui";
import { tenantAddNote } from "@/app/portal/maintenance/actions";

export const dynamic = "force-dynamic";

export default async function PortalRequestDetail({
  params,
}: {
  params: { id: string };
}) {
  const { active } = await requireTenant();
  const supabase = createClient();

  const { data: req } = await supabase
    .from("maintenance_requests")
    .select("id, title, description, status, sla_due_at, created_at, is_hazard, scheduled_for")
    .eq("tenancy_id", active.tenancyId)
    .eq("id", params.id)
    .maybeSingle();
  if (!req) notFound();

  const { data: events } = await supabase
    .from("maintenance_events")
    .select("id, actor_role, kind, body, new_status, created_at")
    .eq("request_id", req.id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-4">
      <Link href="/portal/maintenance" className="text-sm text-slate hover:text-ink">
        ← Repairs
      </Link>
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">{req.title}</h1>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={req.status} />
          <SlaBadge dueAt={req.sla_due_at} status={req.status} />
          <span className="text-xs text-slate">{humanAge(req.created_at)}</span>
        </div>
      </div>

      {req.description && (
        <Card>
          <CardBody className="p-4">
            <p className="text-sm text-ink">{req.description}</p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <h2 className="mb-3 font-heading text-sm font-semibold tracking-tight">Activity</h2>
          <Timeline events={events ?? []} />
          <form action={tenantAddNote} className="mt-4 flex gap-2">
            <input type="hidden" name="request_id" value={req.id} />
            <input
              name="body"
              required
              placeholder="Add an update…"
              className="h-11 flex-1 rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30"
            />
            <Button type="submit" size="sm">Send</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
