import { Platform } from 'react-native';

export interface NotificationScheduleConfig {
  morningTime: string; // "07:00 AM"
  eveningTime: string; // "09:00 PM"
  enabled: boolean;
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
    
    // Configure default handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Cancel existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule 7:00 AM Morning Scripture reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Today's Scripture",
        body: "Take a quiet moment to read, understand, and pray through today's Word.",
        sound: true,
      },
      trigger: {
        hour: 7,
        minute: 0,
        repeats: true,
      },
    });

    // Schedule 9:00 PM Evening Reflection reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Evening Reflection",
        body: "Take a peaceful moment to review your day, surrender burdens, and pray.",
        sound: true,
      },
      trigger: {
        hour: 21,
        minute: 0,
        repeats: true,
      },
    });
  } catch (e) {
    console.warn('Schedule notifications skipped:', e);
  }
}
