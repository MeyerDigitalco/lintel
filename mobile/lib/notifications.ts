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

type Item = { id: string; label: string; expires_at: string | null; properties?: { label: string } | null };

/** Schedule local reminders 14 days before each compliance item expires. */
export async function scheduleComplianceReminders(items: Item[]): Promise<void> {
  const ok = await ensureNotificationPermission();
  if (!ok) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = Date.now();
    for (const it of items) {
      if (!it.expires_at) continue;
      const exp = new Date(`${it.expires_at}T09:00:00`);
      if (isNaN(exp.getTime()) || exp.getTime() < now) continue;
      let when = new Date(exp.getTime() - 14 * 86400000);
      if (when.getTime() < now + 60000) when = new Date(now + 86400000); // within 14d → remind tomorrow
      const where = it.properties?.label ? ` · ${it.properties.label}` : "";
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Compliance expiring soon",
          body: `${it.label}${where} expires ${fmtDate(it.expires_at)}.`,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
      });
    }
  } catch {
    // best-effort; notifications are non-critical
  }
}
