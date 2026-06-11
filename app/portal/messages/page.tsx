import { requireTenant } from "@/lib/tenant-auth";
import { createClient } from "@/lib/supabase/server";
import { MessageThread } from "@/components/portal/MessageThread";
import { Button } from "@/components/ui/Button";
import { sendTenantMessage } from "@/app/portal/actions";

export const dynamic = "force-dynamic";

export default async function PortalMessages() {
  const { active } = await requireTenant();
  const supabase = createClient();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_role, body, created_at")
    .eq("tenancy_id", active.tenancyId)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold tracking-tight">Messages</h1>
      <MessageThread messages={messages ?? []} viewerRole="tenant" />

      <form action={sendTenantMessage} className="sticky bottom-20 flex gap-2">
        <input
          name="body"
          required
          placeholder="Message your landlord…"
          className="h-11 flex-1 rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30"
        />
        <Button type="submit">Send</Button>
      </form>
      <p className="text-xs text-slate">Messages are logged for both of you.</p>
    </div>
  );
}
