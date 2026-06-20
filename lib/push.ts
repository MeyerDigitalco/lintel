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
    const { data } = await svc.from("push_tokens").select("token").in("user_id", ids);
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
