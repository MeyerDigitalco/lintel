import { requireTenant } from "@/lib/tenant-auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { updateNotifyPref } from "@/app/portal/actions";

export const dynamic = "force-dynamic";

export default async function PortalSettings() {
  const { active, userId, email } = await requireTenant();
  const supabase = createClient();

  const { data: member } = await supabase
    .from("tenancy_members")
    .select("notify_email")
    .eq("tenancy_id", active.tenancyId)
    .eq("user_id", userId)
    .maybeSingle();

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardBody>
          <p className="text-sm text-ink">{email}</p>
          <p className="text-xs text-slate">{active.propertyLabel}</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <form action={updateNotifyPref} className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                name="notify_email"
                defaultChecked={member?.notify_email ?? true}
                className="h-4 w-4"
              />
              Email me about rent reminders and new messages
            </label>
            <Button type="submit" size="sm">Save preferences</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
