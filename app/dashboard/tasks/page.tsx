import { requireSession, isWriterRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge, EmptyState } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fmtDate, daysUntil } from "@/lib/dates";
import { createTask, toggleTask, deleteTask } from "./actions";

export const dynamic = "force-dynamic";

const inputCls =
  "h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export default async function TasksPage() {
  const { orgId, role } = await requireSession();
  const canWrite = isWriterRole(role);
  const supabase = createClient();

  const [{ data: tasks }, { data: properties }] = await Promise.all([
    supabase.from("tasks").select("id, title, notes, due_on, priority, status, property_id, properties(label)").eq("org_id", orgId).order("due_on", { ascending: true }),
    supabase.from("properties").select("id, label").eq("org_id", orgId).order("label"),
  ]);

  const open = (tasks ?? []).filter((t) => t.status !== "done");
  const done = (tasks ?? []).filter((t) => t.status === "done");

  return (
    <div>
      <PageHeader title="Tasks" subtitle="Reminders and to-dos across your portfolio." action={<Badge>{open.length} open</Badge>} />

      {canWrite && (
        <Card className="mb-6">
          <CardBody>
            <form action={createTask} className="grid gap-2 sm:grid-cols-2">
              <input name="title" required placeholder="e.g. Chase gas engineer for certificate" className={`${inputCls} sm:col-span-2`} />
              <input name="due_on" type="date" className={inputCls} />
              <select name="property_id" className={inputCls} defaultValue="">
                <option value="">No property</option>
                {(properties ?? []).map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
              </select>
              <select name="priority" className={inputCls} defaultValue="normal">
                <option value="low">Low priority</option>
                <option value="normal">Normal priority</option>
                <option value="high">High priority</option>
              </select>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Add task</Button></div>
            </form>
          </CardBody>
        </Card>
      )}

      {open.length === 0 && done.length === 0 ? (
        <EmptyState title="No tasks yet" body="Add reminders for renewals, inspections, chasing references and more." />
      ) : (
        <div className="space-y-3">
          {open.map((t) => {
            const d = daysUntil(t.due_on);
            return (
              <Card key={t.id}>
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {canWrite && (
                        <form action={toggleTask}>
                          <input type="hidden" name="id" value={t.id} />
                          <input type="hidden" name="done" value="true" />
                          <button type="submit" aria-label="Mark done" className="mt-0.5 h-5 w-5 rounded-full border border-hairline hover:border-evergreen" />
                        </form>
                      )}
                      <div>
                        <p className="text-sm font-medium text-ink">{t.title}</p>
                        <p className="mt-0.5 text-xs text-slate">
                          {(t as any).properties?.label ? `${(t as any).properties.label} · ` : ""}
                          {t.priority === "high" ? "High priority" : t.priority === "low" ? "Low priority" : "Normal"}
                        </p>
                        {t.notes && <p className="mt-1 text-xs text-slate">{t.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.due_on && (
                        <Badge tone={d !== null && d < 0 ? "red" : d !== null && d <= 7 ? "amber" : "default"}>
                          {d !== null && d < 0 ? "Overdue" : `due ${fmtDate(t.due_on)}`}
                        </Badge>
                      )}
                      {canWrite && (
                        <form action={deleteTask}>
                          <input type="hidden" name="id" value={t.id} />
                          <button type="submit" className="text-xs text-slate hover:text-red">Delete</button>
                        </form>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}

          {done.length > 0 && (
            <div className="pt-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate">Done</h2>
              {done.map((t) => (
                <Card key={t.id} className="mb-2 opacity-60">
                  <CardBody>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {canWrite && (
                          <form action={toggleTask}>
                            <input type="hidden" name="id" value={t.id} />
                            <input type="hidden" name="done" value="false" />
                            <button type="submit" aria-label="Reopen" className="flex h-5 w-5 items-center justify-center rounded-full bg-evergreen text-xs font-bold text-paper">✓</button>
                          </form>
                        )}
                        <p className="text-sm text-slate line-through">{t.title}</p>
                      </div>
                      {canWrite && (
                        <form action={deleteTask}>
                          <input type="hidden" name="id" value={t.id} />
                          <button type="submit" className="text-xs text-slate hover:text-red">Delete</button>
                        </form>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
