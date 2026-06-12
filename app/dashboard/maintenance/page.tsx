import Link from "next/link";
import { requireWriter } from "@/lib/auth";
import { hasEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge, SlaBadge, humanAge } from "@/components/app/maintenance/ui";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const { orgId } = await requireWriter();
  const supabase = createClient();

  const portalOn = await hasEntitlement(orgId, "maintenance_portal");

  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select("id, title, status, priority, is_hazard, sla_due_at, created_at, property_id, properties(label)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const open = (requests ?? []).filter(
    (r) => r.status !== "completed" && r.status !== "closed"
  );

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Triage repairs, assign contractors and track SLAs."
        action={portalOn ? <Badge tone="mint">Maintenance portal on</Badge> : undefined}
      />

      {!portalOn && (
        <Card className="mb-6 border-amber/40">
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">
              Maintenance portal add-on required
            </h2>
            <p className="mt-1 text-sm text-slate">
              Enable the Maintenance portal (£4.99/mo) for tenant-raised repairs,
              contractor links and SLA tracking.
            </p>
          </CardBody>
        </Card>
      )}

      {!requests || requests.length === 0 ? (
        <EmptyState
          title="No maintenance requests"
          body="Tenant-raised issues and your planned jobs will appear here."
        />
      ) : (
        <div className="space-y-3">
          {open.length > 0 && (
            <p className="text-xs uppercase tracking-wide text-slate">Open ({open.length})</p>
          )}
          {requests.map((r) => (
            <Link key={r.id} href={`/dashboard/maintenance/${r.id}`}>
              <Card className="transition-colors hover:border-evergreen/40">
                <CardBody className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {r.title}
                      {r.is_hazard && <span className="ml-2 text-xs text-red">hazard</span>}
                    </p>
                    <p className="text-xs text-slate">
                      {(r as any).properties?.label ?? "—"} · {humanAge(r.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SlaBadge dueAt={r.sla_due_at} status={r.status} />
                    <StatusBadge status={r.status} />
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
