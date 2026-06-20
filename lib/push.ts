import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const WRITER_ROLES = ["owner", "admin", "landlord"];

/** Send an Expo push to specific users (their registered devices). Best-effort. */
export async function sendPushToUsers(userIds: string[], msg: PushMessage): Promise<void> {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (!ids.length) return;
  try {
    const svc = createServiceClient();
    // Respect per-user opt-outs for this alert type (absence of a row = on).
    let recipients = ids;
    const type = (msg.data?.type as string) || "";
    if (type) {
      const { data: prefs } = await svc
        .from("notification_prefs")
        .select("user_id")
        .eq("type", type)
        .eq("enabled", false)
        .in("user_id", ids);
      const off = new Set((prefs ?? []).map((r: any) => r.user_id));
      recipients = ids.filter((id) => !off.has(id));
    }
    if (!recipients.length) return;
    const { data } = await svc.from("push_tokens").select("token").in("user_id", recipients);
    const tokens = [...new Set((data ?? []).map((r: any) => r.token as string))].filter(
      (t) => typeof t === "string" && t.startsWith("ExponentPushToken")
    );
    if (!tokens.length) return;
    const messages = tokens.map((to) => ({ to, sound: "default", title: msg.title, body: msg.body, data: msg.data ?? {} }));
    for (let i = 0; i < messages.length; i += 100) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(messages.slice(i, i + 100)),
      }).catch(() => {});
    }
  } catch {
    // never let notifications break the underlying action
  }
}

/** Notify the landlords/admins of an organisation. */
export async function sendPushToOrg(orgId: string, msg: PushMessage): Promise<void> {
  try {
    const svc = createServiceClient();
    const { data } = await svc.from("memberships").select("user_id, role").eq("org_id", orgId);
    const ids = (data ?? []).filter((m: any) => WRITER_ROLES.includes(m.role)).map((m: any) => m.user_id);
    await sendPushToUsers(ids, msg);
  } catch {
    // best-effort
  }
}
