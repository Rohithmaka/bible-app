import { Platform } from 'react-native';

export interface NotificationScheduleConfig {
  morningTime?: string; // "07:00 AM" or "06:30 AM"
  eveningTime?: string; // "09:00 PM"
  verseReference?: string;
  verseSnippet?: string;
  enabled: boolean;
}

function parseHourMinute(timeStr: string = '07:00 AM'): { hour: number; minute: number } {
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
  if (Platform.OS === 'web' || !config.enabled) return;
  try {
    const Notifications = require('expo-notifications');
    
    // Configure default handler for foreground notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Cancel existing scheduled notifications to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const morningTime = parseHourMinute(config.morningTime || '07:00 AM');
    const eveningTime = parseHourMinute(config.eveningTime || '09:00 PM');

    const morningTitle = config.verseReference ? `Daily Bread: ${config.verseReference}` : "Today's Morning Scripture 📖";
    const morningBody = config.verseSnippet
      ? `"${config.verseSnippet.slice(0, 100)}..." Tap to read & meditate.`
      : "Take a quiet moment with God's Word to start your day with peace and purpose.";

    // 1. Schedule Morning Daily Scripture Notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: morningTitle,
        body: morningBody,
        sound: true,
        data: { screen: 'home', type: 'daily_verse' },
      },
      trigger: {
        hour: morningTime.hour,
        minute: morningTime.minute,
        repeats: true,
      },
    });

    // 2. Schedule Evening Reflection Notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Evening Reflection & Rest 🕊️",
        body: "Pause your evening to surrender burdens, thank God, and find peaceful rest.",
        sound: true,
        data: { screen: 'prayer', type: 'evening_reflection' },
      },
      trigger: {
        hour: eveningTime.hour,
        minute: eveningTime.minute,
        repeats: true,
      },
    });
  } catch (e) {
    console.warn('Schedule notifications skipped:', e);
  }
}

/**
 * Sends an immediate test notification so the user can verify notifications on their phone right now.
 */
export async function sendInstantDailyVerseNotification(reference: string = 'Proverbs 3:5-6', verseText: string = 'Trust in the LORD with all your heart...') {
  if (Platform.OS === 'web') return;
  try {
    const Notifications = require('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Daily Scripture: ${reference} 📖`,
        body: `"${verseText.slice(0, 120)}..." Tap to read full chapter.`,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (e) {
    console.warn('Instant notification skipped:', e);
  }
}
