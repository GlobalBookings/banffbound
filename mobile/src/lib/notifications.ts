import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { planBookingReminders } from './reminders.ts';
import { type Booking } from './trip.ts';

const REMINDERS_KEY = 'banffbound.reminders.v1';
type StoredReminder = { notificationId: string; fingerprint: string };
type ReminderMap = Record<string, StoredReminder>;
let operations: Promise<unknown> = Promise.resolve();

function serial<T>(operation: () => Promise<T>): Promise<T> {
  const result = operations.then(operation);
  operations = result.catch(() => undefined);
  return result;
}

function decodeReminders(value: string | null): ReminderMap {
  if (!value || value.length > 40_000) return {};
  try {
    const raw = JSON.parse(value);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    return Object.fromEntries(Object.entries(raw).slice(0, 80).filter(([key, item]) => /^[a-z0-9_-]{1,80}$/i.test(key) && item && typeof item === 'object' && typeof (item as StoredReminder).notificationId === 'string' && typeof (item as StoredReminder).fingerprint === 'string')) as ReminderMap;
  } catch { return {}; }
}

/** Invoke only from an explicit user's Enable reminders action. */
export async function requestReminderPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('bookings', { name: 'Trip reminders', importance: Notifications.AndroidImportance.DEFAULT });
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Reconcile after edits/removal and on app startup, once the user opted in. */
export function syncBookingReminders(bookings: Booking[], enabled: boolean): Promise<{ scheduled: number; unsupported: boolean }> {
  return serial(async () => {
    if (Platform.OS === 'web') return { scheduled: 0, unsupported: true };
    const permission = enabled ? await Notifications.getPermissionsAsync() : null;
    const desired = enabled && permission?.granted ? planBookingReminders(bookings) : [];
    const previous = decodeReminders(await AsyncStorage.getItem(REMINDERS_KEY));
    const next: ReminderMap = {};
    for (const [bookingId, reminder] of Object.entries(previous)) {
      const match = desired.find(item => item.bookingId === bookingId && item.fingerprint === reminder.fingerprint);
      if (match) next[bookingId] = reminder;
      else await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    }
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
    for (const reminder of desired) {
      if (next[reminder.bookingId]) continue;
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: { title: reminder.title, body: reminder.body, data: { bookingId: reminder.bookingId }, ...(Platform.OS === 'android' ? { sound: 'default' } : {}) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.at, ...(Platform.OS === 'android' ? { channelId: 'bookings' } : {}) },
      });
      next[reminder.bookingId] = { notificationId, fingerprint: reminder.fingerprint };
      try { await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(next)); }
      catch (error) { await Notifications.cancelScheduledNotificationAsync(notificationId); throw error; }
    }
    return { scheduled: Object.keys(next).length, unsupported: false };
  });
}
