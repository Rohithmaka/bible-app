import { Platform } from 'react-native';

export type ReminderType = 'bible' | 'morning' | 'afternoon' | 'evening' | 'night';

export interface NotificationScheduleConfig {
  enabled: boolean;

  // 1. Daily Bible Reading
  bibleReadingEnabled?: boolean;
  bibleReadingTime?: string; // e.g. "07:00 AM"
  verseReference?: string;
  verseSnippet?: string;

  // 2. Morning Short Prayer
  morningPrayerEnabled?: boolean;
  morningPrayerTime?: string; // e.g. "08:30 AM"

  // 3. Afternoon Midday Prayer
  afternoonPrayerEnabled?: boolean;
  afternoonPrayerTime?: string; // e.g. "01:00 PM"

  // 4. Evening Short Prayer
  eveningPrayerEnabled?: boolean;
  eveningPrayerTime?: string; // e.g. "07:00 PM"

  // 5. Night Prayer & Sleep Peace
  nightPrayerEnabled?: boolean;
  nightPrayerTime?: string; // e.g. "09:30 PM"

  // Legacy fallbacks
  morningTime?: string;
  eveningTime?: string;
}

export function parseHourMinute(timeStr: string = '07:00 AM'): { hour: number; minute: number } {
  try {
    const parts = timeStr.trim().split(' ');
    const timeParts = parts[0].split(':');
    let hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1] || '0', 10);
    const meridian = (parts[1] || 'AM').toUpperCase();

    if (meridian === 'PM' && hour < 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;

    return { hour, minute };
  } catch {
    return { hour: 7, minute: 0 };
  }
}

export async function requestMobileNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const Notifications = require('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Notifications permission request skipped:', e);
    return false;
  }
}

export async function scheduleDailySpiritualReminders(config: NotificationScheduleConfig) {
  if (Platform.OS === 'web') return;

  try {
    const Notifications = require('expo-notifications');

    // Always clear existing notifications first to avoid stacking duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!config.enabled) return;

    // Configure foreground notification presentation handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // 1. Daily Bible Reading Reminder
    if (config.bibleReadingEnabled !== false) {
      const bibleTimeStr = config.bibleReadingTime || config.morningTime || '07:00 AM';
      const bibleTime = parseHourMinute(bibleTimeStr);
      const bibleTitle = config.verseReference
        ? `📖 Daily Bread: ${config.verseReference}`
        : "📖 Time for Daily Bible Reading";
      const bibleBody = config.verseSnippet
        ? `"${config.verseSnippet.slice(0, 100)}..." Tap to read and meditate.`
        : "Start your day in God's Word. Tap to open today's scripture.";

      await Notifications.scheduleNotificationAsync({
        content: {
          title: bibleTitle,
          body: bibleBody,
          sound: true,
          data: { screen: 'home', type: 'bible_reading' },
        },
        trigger: {
          hour: bibleTime.hour,
          minute: bibleTime.minute,
          repeats: true,
        },
      });
    }

    // 2. Morning Short Prayer Reminder
    if (config.morningPrayerEnabled !== false) {
      const morningPrayerTime = parseHourMinute(config.morningPrayerTime || '08:30 AM');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "☀️ Morning Prayer: Start with God 🙏",
          body: "Take 2 minutes to thank the Lord, dedicate your steps, and invite His peace into your day.",
          sound: true,
          data: { screen: 'prayer', type: 'morning_prayer' },
        },
        trigger: {
          hour: morningPrayerTime.hour,
          minute: morningPrayerTime.minute,
          repeats: true,
        },
      });
    }

    // 3. Afternoon Midday Prayer Reminder
    if (config.afternoonPrayerEnabled !== false) {
      const afternoonPrayerTime = parseHourMinute(config.afternoonPrayerTime || '01:00 PM');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌤️ Midday Prayer Pause 🕊️",
          body: "Take a 60-second breath. Cast your midday stress on God and renew your strength in Him.",
          sound: true,
          data: { screen: 'prayer', type: 'afternoon_prayer' },
        },
        trigger: {
          hour: afternoonPrayerTime.hour,
          minute: afternoonPrayerTime.minute,
          repeats: true,
        },
      });
    }

    // 4. Evening Short Prayer & Gratitude Reminder
    if (config.eveningPrayerEnabled !== false) {
      const eveningPrayerTime = parseHourMinute(config.eveningPrayerTime || '07:00 PM');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌅 Evening Prayer & Gratitude 🙏",
          body: "Pause your evening to thank God for carrying you through today and covering your family with grace.",
          sound: true,
          data: { screen: 'prayer', type: 'evening_prayer' },
        },
        trigger: {
          hour: eveningPrayerTime.hour,
          minute: eveningPrayerTime.minute,
          repeats: true,
        },
      });
    }

    // 5. Night Prayer & Sleep Peace Reminder
    if (config.nightPrayerEnabled !== false) {
      const nightPrayerTime = parseHourMinute(config.nightPrayerTime || config.eveningTime || '09:30 PM');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌙 Night Prayer & Restful Sleep 🕊️",
          body: "Rest safely in God's arms tonight. 'He grants sleep to those He loves' (Psalm 127:2). Sleep in peace.",
          sound: true,
          data: { screen: 'prayer', type: 'night_prayer' },
        },
        trigger: {
          hour: nightPrayerTime.hour,
          minute: nightPrayerTime.minute,
          repeats: true,
        },
      });
    }
  } catch (e) {
    console.warn('Schedule notifications error:', e);
  }
}

/**
 * Sends an immediate test notification for any of the 5 spiritual reminders so the user can verify it right now.
 */
export async function sendInstantPrayerReminder(
  type: ReminderType,
  verseRef: string = 'Proverbs 3:5-6',
  verseSnippet: string = 'Trust in the LORD with all your heart, and do not lean on your own understanding.'
) {
  if (Platform.OS === 'web') return;
  try {
    const Notifications = require('expo-notifications');
    let title = '';
    let body = '';

    switch (type) {
      case 'bible':
        title = `📖 Daily Bread: ${verseRef}`;
        body = `"${verseSnippet.slice(0, 100)}..." Tap to read full chapter.`;
        break;
      case 'morning':
        title = "☀️ Morning Prayer: Start with God 🙏";
        body = "Take 2 minutes to thank the Lord, dedicate your steps, and invite His peace into your morning.";
        break;
      case 'afternoon':
        title = "🌤️ Midday Prayer Pause 🕊️";
        body = "Take a 60-second breath. Cast your midday stress on God and renew your strength in Him.";
        break;
      case 'evening':
        title = "🌅 Evening Prayer & Gratitude 🙏";
        body = "Pause your evening to thank God for carrying you through today and covering your family with grace.";
        break;
      case 'night':
        title = "🌙 Night Prayer & Restful Sleep 🕊️";
        body = "Rest safely in God's arms tonight. 'He grants sleep to those He loves' (Psalm 127:2). Sleep in peace.";
        break;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (e) {
    console.warn('Instant notification error:', e);
  }
}

/**
 * Backward compatibility helper for daily verse test
 */
export async function sendInstantDailyVerseNotification(
  reference: string = 'Proverbs 3:5-6',
  verseText: string = 'Trust in the LORD with all your heart...'
) {
  return sendInstantPrayerReminder('bible', reference, verseText);
}
