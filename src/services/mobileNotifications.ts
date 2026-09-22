import { Platform } from 'react-native';

export type ReminderType = 'bible' | 'morning' | 'afternoon' | 'evening' | 'night';

export interface NotificationScheduleConfig {
  enabled: boolean;

  // Delivery & Alert Customizations
  soundEnabled?: boolean;
  vibrateEnabled?: boolean;
  showVerseSnippet?: boolean;
  userName?: string;
  personalizedGreeting?: boolean;
  activeDays?: 'everyday' | 'weekdays' | 'weekends';

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

async function registerNotificationWithTrigger(
  Notifications: any,
  content: any,
  timeObj: { hour: number; minute: number },
  activeDays: 'everyday' | 'weekdays' | 'weekends' = 'everyday'
) {
  if (activeDays === 'everyday') {
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        hour: timeObj.hour,
        minute: timeObj.minute,
        repeats: true,
      },
    });
  } else if (activeDays === 'weekdays') {
    // 2 = Monday, 3 = Tuesday, 4 = Wednesday, 5 = Thursday, 6 = Friday
    for (const weekday of [2, 3, 4, 5, 6]) {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          weekday,
          hour: timeObj.hour,
          minute: timeObj.minute,
          repeats: true,
        },
      });
    }
  } else if (activeDays === 'weekends') {
    // 1 = Sunday, 7 = Saturday
    for (const weekday of [1, 7]) {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          weekday,
          hour: timeObj.hour,
          minute: timeObj.minute,
          repeats: true,
        },
      });
    }
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
        shouldPlaySound: config.soundEnabled !== false,
        shouldSetBadge: false,
      }),
    });

    const isSound = config.soundEnabled !== false;
    const isVibrate = config.vibrateEnabled !== false;
    const activeDays = config.activeDays || 'everyday';
    const userFirstName = config.userName ? config.userName.trim().split(' ')[0] : '';
    const hasGreeting = !!userFirstName && config.personalizedGreeting !== false;
    const showSnippet = config.showVerseSnippet !== false;

    // 1. Daily Devotion & Bible Reading Reminder
    if (config.bibleReadingEnabled !== false) {
      const bibleTimeStr = config.bibleReadingTime || config.morningTime || '07:00 AM';
      const bibleTime = parseHourMinute(bibleTimeStr);
      
      const devotionTitle = hasGreeting
        ? `🌅 Good Morning ${userFirstName}! Your Daily Devotion is Ready`
        : "🌅 Your Daily Devotion is Ready";

      const devotionBody = showSnippet && config.verseSnippet
        ? `"${config.verseSnippet.slice(0, 80)}..." Take a few quiet moments with God's Word today.`
        : "Take a few quiet moments with God's Word today.";

      await registerNotificationWithTrigger(
        Notifications,
        {
          title: devotionTitle,
          body: devotionBody,
          sound: isSound,
          vibrate: isVibrate ? [0, 250, 250, 250] : undefined,
          data: { route: '/daily-devotion', screen: 'daily-devotion', type: 'devotional' },
        },
        bibleTime,
        activeDays
      );
    }

    // 2. Morning Short Prayer Reminder
    if (config.morningPrayerEnabled !== false) {
      const morningPrayerTime = parseHourMinute(config.morningPrayerTime || '08:30 AM');
      const morningTitle = hasGreeting
        ? `☀️ Morning Prayer, ${userFirstName} 🙏`
        : "☀️ Morning Prayer: Start with God 🙏";

      await registerNotificationWithTrigger(
        Notifications,
        {
          title: morningTitle,
          body: "Take 2 minutes to thank the Lord, dedicate your steps, and invite His peace into your day.",
          sound: isSound,
          vibrate: isVibrate ? [0, 250, 250, 250] : undefined,
          data: { screen: 'prayer', type: 'morning_prayer' },
        },
        morningPrayerTime,
        activeDays
      );
    }

    // 3. Afternoon Midday Prayer Reminder
    if (config.afternoonPrayerEnabled !== false) {
      const afternoonPrayerTime = parseHourMinute(config.afternoonPrayerTime || '01:00 PM');
      const afternoonTitle = hasGreeting
        ? `🌤️ Midday Prayer Pause, ${userFirstName} 🕊️`
        : "🌤️ Midday Prayer Pause 🕊️";

      await registerNotificationWithTrigger(
        Notifications,
        {
          title: afternoonTitle,
          body: "Take a 60-second breath. Cast your midday stress on God and renew your strength in Him.",
          sound: isSound,
          vibrate: isVibrate ? [0, 250, 250, 250] : undefined,
          data: { screen: 'prayer', type: 'afternoon_prayer' },
        },
        afternoonPrayerTime,
        activeDays
      );
    }

    // 4. Evening Short Prayer & Gratitude Reminder
    if (config.eveningPrayerEnabled !== false) {
      const eveningPrayerTime = parseHourMinute(config.eveningPrayerTime || '07:00 PM');
      const eveningTitle = hasGreeting
        ? `🌅 Evening Prayer & Gratitude, ${userFirstName} 🙏`
        : "🌅 Evening Prayer & Gratitude 🙏";

      await registerNotificationWithTrigger(
        Notifications,
        {
          title: eveningTitle,
          body: "Pause your evening to thank God for carrying you through today and covering your family with grace.",
          sound: isSound,
          vibrate: isVibrate ? [0, 250, 250, 250] : undefined,
          data: { screen: 'prayer', type: 'evening_prayer' },
        },
        eveningPrayerTime,
        activeDays
      );
    }

    // 5. Night Prayer & Sleep Peace Reminder
    if (config.nightPrayerEnabled !== false) {
      const nightPrayerTime = parseHourMinute(config.nightPrayerTime || config.eveningTime || '09:30 PM');
      const nightTitle = hasGreeting
        ? `🌙 Peaceful Sleep, ${userFirstName} 🕊️`
        : "🌙 Night Prayer & Restful Sleep 🕊️";

      await registerNotificationWithTrigger(
        Notifications,
        {
          title: nightTitle,
          body: "Rest safely in God's arms tonight. 'He grants sleep to those He loves' (Psalm 127:2). Sleep in peace.",
          sound: isSound,
          vibrate: isVibrate ? [0, 250, 250, 250] : undefined,
          data: { screen: 'prayer', type: 'night_prayer' },
        },
        nightPrayerTime,
        activeDays
      );
    }
  } catch (e) {
    console.warn('Schedule notifications error:', e);
  }
}

export interface InstantReminderCustomization {
  verseRef?: string;
  verseSnippet?: string;
  soundEnabled?: boolean;
  vibrateEnabled?: boolean;
  userName?: string;
  personalizedGreeting?: boolean;
  showVerseSnippet?: boolean;
}

/**
 * Sends an immediate test notification with user customization options applied.
 */
export async function sendInstantPrayerReminder(
  type: ReminderType,
  options?: InstantReminderCustomization
) {
  if (Platform.OS === 'web') return;
  try {
    const Notifications = require('expo-notifications');
    const verseRef = options?.verseRef || 'Proverbs 3:5-6';
    const verseSnippet = options?.verseSnippet || 'Trust in the LORD with all your heart, and do not lean on your own understanding.';
    const isSound = options?.soundEnabled !== false;
    const isVibrate = options?.vibrateEnabled !== false;
    const userFirstName = options?.userName ? options?.userName.trim().split(' ')[0] : '';
    const hasGreeting = !!userFirstName && options?.personalizedGreeting !== false;
    const showSnippet = options?.showVerseSnippet !== false;

    let title = '';
    let body = '';

    switch (type) {
      case 'bible':
        title = hasGreeting
          ? `📖 Good Morning ${userFirstName}! ${verseRef}`
          : `📖 Daily Bread: ${verseRef}`;
        body = showSnippet
          ? `"${verseSnippet.slice(0, 100)}..." Tap to read full chapter.`
          : "Start your day in God's Word. Tap to open today's scripture.";
        break;
      case 'morning':
        title = hasGreeting
          ? `☀️ Morning Prayer, ${userFirstName} 🙏`
          : "☀️ Morning Prayer: Start with God 🙏";
        body = "Take 2 minutes to thank the Lord, dedicate your steps, and invite His peace into your morning.";
        break;
      case 'afternoon':
        title = hasGreeting
          ? `🌤️ Midday Prayer Pause, ${userFirstName} 🕊️`
          : "🌤️ Midday Prayer Pause 🕊️";
        body = "Take a 60-second breath. Cast your midday stress on God and renew your strength in Him.";
        break;
      case 'evening':
        title = hasGreeting
          ? `🌅 Evening Prayer & Gratitude, ${userFirstName} 🙏`
          : "🌅 Evening Prayer & Gratitude 🙏";
        body = "Pause your evening to thank God for carrying you through today and covering your family with grace.";
        break;
      case 'night':
        title = hasGreeting
          ? `🌙 Peaceful Sleep, ${userFirstName} 🕊️`
          : "🌙 Night Prayer & Restful Sleep 🕊️";
        body = "Rest safely in God's arms tonight. 'He grants sleep to those He loves' (Psalm 127:2). Sleep in peace.";
        break;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: isSound,
        vibrate: isVibrate ? [0, 250, 250, 250] : undefined,
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
  return sendInstantPrayerReminder('bible', {
    verseRef: reference,
    verseSnippet: verseText,
  });
}
