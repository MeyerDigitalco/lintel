import { requireWriter } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { PageHeader, Badge, EmptyState } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { inviteMember, changeMemberRole, removeMember } from "../actions";

export const dynamic = "force-dynamic";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";
const selectCls =
  "h-11 rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  landlord: "Landlord",
  accountant: "Accountant (read-only)",
};
const ASSIGNABLE = ["owner", "admin", "landlord", "accountant"];

export default async function TeamPage() {
  const { orgId, role, userId: me } = await requireWriter();
  const isAdmin = role === "owner" || role === "admin";

  const service = createServiceClient();
  const { data: members } = await service
    .from("memberships")
    .select("user_id, role, created_at")
    .eq("org_id", orgId)
    .in("role", ["owner", "admin", "landlord", "accountant"])
    .order("created_at", { ascending: true });

  const { data: list } = await service.auth.admin.listUsers();
  const emailById = new Map((list?.users ?? []).map((u: any) => [u.id, u.email as string]));
  const nameById = new Map((list?.users ?? []).map((u: any) => [u.id, (u.user_metadata?.full_name as string) ?? ""]));

  const rows = (members ?? []).map((m) => ({
    userId: m.user_id,
    role: m.role as string,
    email: emailById.get(m.user_id) ?? "-",
    name: nameById.get(m.user_id) ?? "",
  }));
  const ownerCount = rows.filter((r) => r.role === "owner").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team & roles"
        subtitle="Owners and admins manage the account. Landlords get full write access. Accountants are read-only."
        action={<Badge>{rows.length} {rows.length === 1 ? "member" : "members"}</Badge>}
      />

      {isAdmin && (
        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Invite a member</h2>
            <p className="mt-1 text-xs text-slate">They get an email invite. Accountants only ever see read-only screens.</p>
            <form action={inviteMember} className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-[220px] flex-1">
                <label className="mb-1 block text-xs font-medium text-slate" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required placeholder="name@example.com" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate" htmlFor="role">Role</label>
                <select id="role" name="role" defaultValue="landlord" className={selectCls}>
                  <option value="admin">Admin</option>
                  <option value="landlord">Landlord</option>
                  <option value="accountant">Accountant (read-only)</option>
                </select>
              </div>
              <Button type="submit">Send invite</Button>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <h2 className="font-heading text-base font-semibold tracking-tight">Members</h2>
          {rows.length === 0 ? (
            <div className="mt-4"><EmptyState title="No team members yet" body="Invite your first teammate above." /></div>
          ) : (
            <div className="mt-4 divide-y divide-hairline">
              {rows.map((r) => {
                const isMe = r.userId === me;
                const lastOwner = r.role === "owner" && ownerCount <= 1;
                return (
                  <div key={r.userId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {r.name || r.email} {isMe && <span className="text-xs font-normal text-slate">(you)</span>}
                      </p>
                      {r.name ? <p className="truncate text-xs text-slate">{r.email}</p> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && !isMe ? (
                        <form action={changeMemberRole} className="flex items-center gap-2">
                          <input type="hidden" name="user_id" value={r.userId} />
                          <select name="role" defaultValue={r.role} className={selectCls + " h-9"}>
                            {ASSIGNABLE.map((opt) => (
                              <option key={opt} value={opt}>{ROLE_LABEL[opt]}</option>
                            ))}
                          </select>
                          <Button type="submit" variant="outline" size="sm">Update</Button>
                        </form>
                      ) : (
                        <Badge tone={r.role === "accountant" ? "default" : "moss"}>{ROLE_LABEL[r.role] ?? r.role}</Badge>
                      )}
                      {isAdmin && !isMe && !lastOwner && (
                        <form action={removeMember}>
                          <input type="hidden" name="user_id" value={r.userId} />
                          <Button type="submit" variant="ghost" size="sm">Remove</Button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
