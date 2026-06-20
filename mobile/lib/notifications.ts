import * as Notifications from "expo-notifications";
import { fmtDate } from "@/lib/format";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

type ExpiringItem = { id: string; label: string; expires_at: string | null; properties?: { label: string } | null };

async function scheduleOne(title: string, label: string, where: string, expires: string) {
  const exp = new Date(`${expires}T09:00:00`);
  const now = Date.now();
  if (isNaN(exp.getTime()) || exp.getTime() < now) return;
  let when = new Date(exp.getTime() - 14 * 86400000);
  if (when.getTime() < now + 60000) when = new Date(now + 86400000); // within 14d → remind tomorrow
  await Notifications.scheduleNotificationAsync({
    content: { title, body: `${label}${where} expires ${fmtDate(expires)}.` },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
  });
}

/**
 * Schedule local reminders 14 days before each compliance item AND each
 * document expires. Cancels and rebuilds the full set in one pass.
 */
export async function scheduleReminders(opts: {
  compliance?: ExpiringItem[];
  documents?: ExpiringItem[];
}): Promise<void> {
  const ok = await ensureNotificationPermission();
  if (!ok) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const it of opts.compliance ?? []) {
      if (!it.expires_at) continue;
      await scheduleOne("Compliance expiring soon", it.label, it.properties?.label ? ` · ${it.properties.label}` : "", it.expires_at);
    }
    for (const d of opts.documents ?? []) {
      if (!d.expires_at) continue;
      await scheduleOne("Document expiring soon", d.label, d.properties?.label ? ` · ${d.properties.label}` : "", d.expires_at);
    }
  } catch {
    // best-effort; notifications are non-critical
  }
}

/** Back-compat wrapper. */
export async function scheduleComplianceReminders(items: ExpiringItem[]): Promise<void> {
  await scheduleReminders({ compliance: items });
}
