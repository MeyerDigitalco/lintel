import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";
import { ensureNotificationPermission } from "@/lib/notifications";

/** Register this device's Expo push token against the signed-in user. */
export async function registerPushToken(userId: string): Promise<void> {
  try {
    const ok = await ensureNotificationPermission();
    if (!ok) return;
    const projectId = (Constants.expoConfig as any)?.extra?.eas?.projectId
      ?? (Constants as any)?.easConfig?.projectId;
    const res = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    const token = res?.data;
    if (!token) return;
    await supabase.from("push_tokens").upsert(
      { user_id: userId, token, platform: Platform.OS },
      { onConflict: "user_id,token" }
    );
  } catch {
    // best-effort; push is non-critical
  }
}
