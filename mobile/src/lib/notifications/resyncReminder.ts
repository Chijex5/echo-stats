import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// Monthly "upload a fresh Spotify export" nudge. Spotify's extended-history
// exports are snapshots, so a periodic re-upload (deduped server-side) is
// the only way to backfill plays the live sync missed. One local
// notification is kept scheduled ~30 days out from the last import;
// completing a re-sync (or import) pushes it another 30 days.

const REMINDER_ID = "monthly-resync-reminder";
const REMINDER_INTERVAL_DAYS = 30;
const MIN_DELAY_SECONDS = 3_600; // never fire "immediately" on app open

const REMINDER_CONTENT: Notifications.NotificationContentInput = {
  title: "Time to re-sync your history",
  body: "Grab a fresh Spotify export so your stats cover everything from the last month.",
};

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("reminders", {
    name: "Reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function scheduleAt(secondsFromNow: number) {
  await ensureAndroidChannel();
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: REMINDER_CONTENT,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(MIN_DELAY_SECONDS, Math.round(secondsFromNow)),
      repeats: false,
    },
  });
}

/**
 * Call right after a successful import/re-sync: asks for permission (first
 * time only) and schedules the next reminder a full interval out.
 * Returns false when the user declined notifications.
 */
export async function scheduleResyncReminder(): Promise<boolean> {
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return false;

  await scheduleAt(REMINDER_INTERVAL_DAYS * 86_400);
  return true;
}

/**
 * Call on app start with the server's lastImportAt. Scheduled notifications
 * don't survive reinstalls (and the OS can drop them), so if permission is
 * already granted and nothing is pending, this quietly re-arms the reminder
 * relative to the real last import. Never prompts.
 */
export async function syncResyncReminder(lastImportAt: string | null): Promise<void> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    const pending = await Notifications.getAllScheduledNotificationsAsync();
    if (pending.some((n) => n.identifier === REMINDER_ID)) return;

    const base = lastImportAt ? new Date(lastImportAt).getTime() : Date.now();
    const fireAt = base + REMINDER_INTERVAL_DAYS * 86_400_000;
    await scheduleAt((fireAt - Date.now()) / 1000);
  } catch {
    // Reminders are best-effort — never let them break app startup.
  }
}
