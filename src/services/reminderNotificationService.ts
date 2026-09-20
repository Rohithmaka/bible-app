import { Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';

export type ReminderType = 'prayer' | 'bible_reading' | 'devotional' | 'verse_of_day' | 'custom';
export type RepeatType = 'daily' | 'specific_days' | 'weekdays' | 'weekends' | 'once';
export type ReminderDestination =
  | 'prayer'
  | 'prayer_requests'
  | 'bible'
  | 'reading_plan'
  | 'verse_of_day'
  | 'study'
  | 'home';

export interface ReminderItem {
  id: string;
  user_id?: string;
  type: ReminderType;
  title: string;
  message: string;
  time: string; // "HH:MM" (e.g. "06:30") or "06:30 AM"
  repeat_type: RepeatType;
  selected_days: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  enabled: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  destination: ReminderDestination;
  category?: string;
  scheduled_notification_ids?: string[];
  created_at: number;
  updated_at: number;
}

export type DevicePermissionState = 'granted' | 'denied' | 'undetermined';

// Configure foreground notifications presentation
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: notification.request.content.sound !== null,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Initializes dedicated Android Notification Channels for prayers, Bible reading, and devotionals
 */
export async function initNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync('prayer_reminders', {
      name: 'Prayer Reminders',
      description: 'Scheduled reminders for morning, midday, family, and night prayers',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D97706',
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync('bible_reading', {
      name: 'Bible Reading Reminders',
      description: 'Scheduled reminders for daily scripture reading and Bible studies',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync('devotionals', {
      name: 'Daily Devotionals & Verse',
      description: 'Notifications for daily verses and spiritual reflections',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
      showBadge: true,
    });
  } catch (err) {
    console.warn('Failed to initialize notification channels:', err);
  }
}

/**
 * Checks device notification permission state without triggering a prompt
 */
export async function checkDeviceNotificationPermission(): Promise<DevicePermissionState> {
  if (Platform.OS === 'web') return 'denied';

  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED) {
      return 'granted';
    }
    if (settings.canAskAgain) {
      return 'undetermined';
    }
    return 'denied';
  } catch (e) {
    console.warn('Error checking notification permissions:', e);
    return 'undetermined';
  }
}

/**
 * Prompts runtime permission for Android 13+ (POST_NOTIFICATIONS) and iOS
 */
export async function requestDeviceNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    await initNotificationChannels();
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return status === 'granted';
  } catch (e) {
    console.warn('Error requesting notification permissions:', e);
    return false;
  }
}

/**
 * Opens system settings directly to the app notification settings
 */
export async function openDeviceNotificationSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch (e) {
    console.warn('Unable to open device settings:', e);
  }
}

/**
 * Helper to parse time string like "06:30 AM", "6:30 PM", or "14:45"
 */
export function parseHourAndMinute(timeStr: string): { hour: number; minute: number } {
  try {
    const trimmed = timeStr.trim();
    const hasMeridian = /am|pm/i.test(trimmed);

    if (hasMeridian) {
      const parts = trimmed.split(' ');
      const [h, m] = parts[0].split(':').map((n) => parseInt(n, 10));
      let hour = h;
      const minute = m || 0;
      const meridian = (parts[1] || 'AM').toUpperCase();

      if (meridian === 'PM' && hour < 12) hour += 12;
      if (meridian === 'AM' && hour === 12) hour = 0;

      return { hour, minute };
    } else {
      const [h, m] = trimmed.split(':').map((n) => parseInt(n, 10));
      return { hour: h || 0, minute: m || 0 };
    }
  } catch {
    return { hour: 7, minute: 0 };
  }
}

/**
 * Formats hour and minute into readable 12-hour string (e.g. "06:30 AM")
 */
export function formatTo12Hour(hour: number, minute: number): string {
  const meridian = hour >= 12 ? 'PM' : 'AM';
  let h = hour % 12;
  if (h === 0) h = 12;
  const hStr = h < 10 ? `0${h}` : `${h}`;
  const mStr = minute < 10 ? `0${minute}` : `${minute}`;
  return `${hStr}:${mStr} ${meridian}`;
}

/**
 * Formats repeat summary string for UI display
 */
export function formatRepeatSummary(repeatType: RepeatType, selectedDays: number[]): string {
  switch (repeatType) {
    case 'daily':
      return 'Every day';
    case 'weekdays':
      return 'Mon – Fri';
    case 'weekends':
      return 'Sat & Sun';
    case 'once':
      return 'One-time';
    case 'specific_days': {
      if (!selectedDays || selectedDays.length === 0) return 'No days selected';
      if (selectedDays.length === 7) return 'Every day';
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const sorted = [...selectedDays].sort((a, b) => a - b);
      return sorted.map((d) => dayNames[d]).join(' · ');
    }
    default:
      return 'Daily';
  }
}

/**
 * Maps destination key to human readable name
 */
export function getDestinationLabel(dest: ReminderDestination): string {
  switch (dest) {
    case 'prayer':
      return 'Prayer Screen';
    case 'prayer_requests':
      return 'Community Prayers';
    case 'bible':
      return 'Bible Reader';
    case 'reading_plan':
      return 'Reading Plan';
    case 'verse_of_day':
      return 'Verse of the Day';
    case 'study':
      return 'Bible Study';
    case 'home':
    default:
      return 'Home Screen';
  }
}

/**
 * Maps destination key to internal router pathname
 */
export function getDestinationRoute(dest: ReminderDestination): string {
  switch (dest) {
    case 'prayer':
      return '/prayer';
    case 'prayer_requests':
      return '/prayer';
    case 'bible':
      return '/bible';
    case 'reading_plan':
      return '/library';
    case 'verse_of_day':
      return '/(tabs)';
    case 'study':
      return '/study-workspace';
    case 'home':
    default:
      return '/(tabs)';
  }
}

/**
 * Cancels all scheduled OS notifications for a given reminder
 */
export async function cancelReminderNotifications(reminder: ReminderItem): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    if (reminder.scheduled_notification_ids && reminder.scheduled_notification_ids.length > 0) {
      for (const id of reminder.scheduled_notification_ids) {
        await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      }
    }
  } catch (err) {
    console.warn(`Failed to cancel notification for reminder ${reminder.id}:`, err);
  }
}

/**
 * Schedules native OS notifications for a single reminder according to its repeat pattern
 */
export async function scheduleReminderNotification(reminder: ReminderItem): Promise<string[]> {
  if (Platform.OS === 'web') return [];
  if (!reminder.enabled) return [];

  // Cancel prior instances first
  await cancelReminderNotifications(reminder);

  const channelId = reminder.type === 'bible_reading' ? 'bible_reading' : 'prayer_reminders';
  const { hour, minute } = parseHourAndMinute(reminder.time);
  const scheduledIds: string[] = [];

  const content: Notifications.NotificationContentInput = {
    title: reminder.title,
    body: reminder.message,
    sound: reminder.sound_enabled,
    vibrate: reminder.vibration_enabled ? [0, 250, 250, 250] : undefined,
    data: {
      reminderId: reminder.id,
      destination: reminder.destination,
      type: reminder.type,
      route: getDestinationRoute(reminder.destination),
    },
    ...(Platform.OS === 'android' ? { channelId } : {}),
  };

  try {
    if (reminder.repeat_type === 'once') {
      // Calculate next occurrence
      const now = new Date();
      const triggerDate = new Date();
      triggerDate.setHours(hour, minute, 0, 0);
      if (triggerDate.getTime() <= now.getTime()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId,
        },
      });
      scheduledIds.push(id);
    } else if (reminder.repeat_type === 'daily') {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId,
        },
      });
      scheduledIds.push(id);
    } else {
      // Days to schedule for
      let daysToSchedule: number[] = [];
      if (reminder.repeat_type === 'weekdays') {
        daysToSchedule = [1, 2, 3, 4, 5]; // Mon - Fri
      } else if (reminder.repeat_type === 'weekends') {
        daysToSchedule = [0, 6]; // Sun, Sat
      } else if (reminder.repeat_type === 'specific_days') {
        daysToSchedule = reminder.selected_days && reminder.selected_days.length > 0
          ? reminder.selected_days
          : [0, 1, 2, 3, 4, 5, 6];
      }

      for (const day of daysToSchedule) {
        // In expo-notifications, 1 = Sunday, 2 = Monday, ..., 7 = Saturday
        const expoWeekday = day === 0 ? 1 : day + 1;
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: expoWeekday,
            hour,
            minute,
            channelId,
          },
        });
        scheduledIds.push(id);
      }
    }
  } catch (e) {
    console.warn(`Failed to schedule notifications for ${reminder.title}:`, e);
  }

  return scheduledIds;
}

/**
 * Reschedules all reminders across the app
 */
export async function rescheduleAllReminders(
  reminders: ReminderItem[],
  masterEnabled: boolean
): Promise<Record<string, string[]>> {
  if (Platform.OS === 'web') return {};

  try {
    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
  } catch (e) {
    console.warn('Failed to clear all scheduled notifications:', e);
  }

  if (!masterEnabled) return {};

  const updatedIdsMap: Record<string, string[]> = {};

  for (const r of reminders) {
    if (r.enabled) {
      const ids = await scheduleReminderNotification(r);
      updatedIdsMap[r.id] = ids;
    }
  }

  return updatedIdsMap;
}

/**
 * Sends an immediate test notification with the reminder's exact content, sound, and vibration
 */
export async function sendInstantTestNotification(reminder: ReminderItem): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await initNotificationChannels();
    const channelId = reminder.type === 'bible_reading' ? 'bible_reading' : 'prayer_reminders';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${reminder.type === 'prayer' ? '🙏' : '📖'} ${reminder.title}`,
        body: reminder.message,
        sound: reminder.sound_enabled,
        vibrate: reminder.vibration_enabled ? [0, 250, 250, 250] : undefined,
        data: {
          reminderId: reminder.id,
          destination: reminder.destination,
          type: reminder.type,
          route: getDestinationRoute(reminder.destination),
        },
        ...(Platform.OS === 'android' ? { channelId } : {}),
      },
      trigger: null, // deliver immediately
    });
  } catch (e) {
    console.warn('Failed to send test notification:', e);
  }
}

/**
 * Sets up tap / deep link listeners when user taps a notification banner
 */
export function setupNotificationListeners(onNavigate: (route: string) => void): () => void {
  if (Platform.OS === 'web') return () => {};

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    try {
      const data = response.notification.request.content.data as Record<string, any> | undefined;
      if (data && typeof data.route === 'string') {
        onNavigate(data.route);
      } else if (data && data.destination) {
        onNavigate(getDestinationRoute(data.destination as ReminderDestination));
      }
    } catch (e) {
      console.warn('Error handling notification tap navigation:', e);
    }
  });

  return () => {
    responseSubscription.remove();
  };
}
