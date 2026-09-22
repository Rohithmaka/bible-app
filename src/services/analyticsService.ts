export type AnalyticsEventName =
  | 'daily_devotion_viewed'
  | 'daily_devotion_completed'
  | 'daily_devotion_saved'
  | 'daily_devotion_shared'
  | 'daily_devotion_notification_opened'
  | 'scripture_opened'
  | 'prayer_offered';

export interface AnalyticsEventPayload {
  devotionId?: string;
  date?: string;
  verseReference?: string;
  streakCount?: number;
  [key: string]: any;
}

/**
 * Privacy-Centric SELA Analytics Service.
 * Respects strict user privacy (Zero third-party trackers or ads).
 * Safe, synchronous, non-blocking telemetry.
 */
export function trackEvent(name: AnalyticsEventName, payload?: AnalyticsEventPayload): void {
  if (__DEV__) {
    // Helpful local telemetry logging during development
    // console.log(`[SELA Analytics] ${name}`, payload || {});
  }
}

export const Analytics = {
  trackDevotionViewed: (devotionId: string, date: string, verseReference: string) => {
    trackEvent('daily_devotion_viewed', { devotionId, date, verseReference });
  },
  trackDevotionCompleted: (devotionId: string, date: string, streakCount: number) => {
    trackEvent('daily_devotion_completed', { devotionId, date, streakCount });
  },
  trackDevotionSaved: (devotionId: string, saved: boolean) => {
    trackEvent('daily_devotion_saved', { devotionId, saved });
  },
  trackDevotionShared: (devotionId: string, verseReference: string) => {
    trackEvent('daily_devotion_shared', { devotionId, verseReference });
  },
  trackDevotionNotificationOpened: (devotionId?: string) => {
    trackEvent('daily_devotion_notification_opened', { devotionId });
  },
};
