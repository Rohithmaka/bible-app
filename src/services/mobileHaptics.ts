import { Platform } from 'react-native';

export async function triggerLightHaptic() {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {
    // Fail silently on unsupported platforms
  }
}

export async function triggerMediumHaptic() {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (e) {
    // Fail silently on unsupported platforms
  }
}

export async function triggerSuccessHaptic() {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (e) {
    // Fail silently on unsupported platforms
  }
}
