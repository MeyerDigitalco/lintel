import Link from "next/link";
import { requireTenant } from "@/lib/tenant-auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/app/ui";
import { RaiseRequestForm } from "@/components/portal/RaiseRequestForm";
import { StatusBadge, SlaBadge, humanAge } from "@/components/app/maintenance/ui";

export const dynamic = "force-dynamic";

export default async function PortalMaintenance() {
  const { active } = await requireTenant();

  if (!active.maintenanceEnabled) {
    return (
      <div className="space-y-3">
        <h1 className="font-heading text-xl font-semibold tracking-tight">Repairs</h1>
        <p className="text-sm text-slate">
          Your landlord hasn&apos;t enabled the maintenance portal. Please report
          repairs to them directly.
        </p>
      </div>
    );
  }

  const supabase = createClient();
  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select("id, title, status, sla_due_at, created_at, is_hazard")
    .eq("tenancy_id", active.tenancyId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold tracking-tight">Repairs</h1>
      <RaiseRequestForm />

      {!requests || requests.length === 0 ? (
        <EmptyState title="No requests" body="Report a problem and your landlord will pick it up." />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link key={r.id} href={`/portal/maintenance/${r.id}`}>
              <Card className="transition-colors hover:border-evergreen/40">
                <CardBody className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{r.title}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate">
                    <span>{humanAge(r.created_at)}</span>
                    <SlaBadge dueAt={r.sla_due_at} status={r.status} />
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
