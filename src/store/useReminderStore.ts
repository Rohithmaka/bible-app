import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from '../storage/storage';
import {
  ReminderItem,
  ReminderType,
  RepeatType,
  ReminderDestination,
  DevicePermissionState,
  checkDeviceNotificationPermission,
  requestDeviceNotificationPermission,
  scheduleReminderNotification,
  cancelReminderNotifications,
  rescheduleAllReminders,
  initNotificationChannels,
} from '../services/reminderNotificationService';
import { supabase } from '../services/supabaseConfig';

export interface ReminderTemplate {
  id: string;
  type: ReminderType;
  title: string;
  message: string;
  defaultTime: string;
  repeatType: RepeatType;
  selectedDays: number[];
  destination: ReminderDestination;
  icon: string;
}

export const PRAYER_TEMPLATES: ReminderTemplate[] = [
  {
    id: 'tpl-prayer-morning',
    type: 'prayer',
    title: 'Morning Prayer',
    message: 'Start your day with a moment of prayer and dedicate your steps to Christ.',
    defaultTime: '06:30 AM',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    destination: 'prayer',
    icon: '☀️',
  },
  {
    id: 'tpl-prayer-gratitude',
    type: 'prayer',
    title: 'Gratitude Prayer',
    message: "Take a moment to thank God for today's blessings and His faithfulness.",
    defaultTime: '12:30 PM',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    destination: 'prayer',
    icon: '🙏',
  },
  {
    id: 'tpl-prayer-afternoon',
    type: 'prayer',
    title: 'Midday Prayer Pause',
    message: 'Take a 60-second breath. Cast your midday stress on God and renew your strength.',
    defaultTime: '01:00 PM',
    repeatType: 'weekdays',
    selectedDays: [1, 2, 3, 4, 5],
    destination: 'prayer',
    icon: '🌤️',
  },
  {
    id: 'tpl-prayer-family',
    type: 'prayer',
    title: 'Family Prayer',
    message: 'Gather with your loved ones to pray and cover your household with grace.',
    defaultTime: '07:30 PM',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    destination: 'prayer',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'tpl-prayer-night',
    type: 'prayer',
    title: 'Night Prayer',
    message: 'Slow down and spend a quiet moment in prayer. Rest safely in His peace tonight.',
    defaultTime: '09:30 PM',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    destination: 'prayer',
    icon: '🌙',
  },
];

export const BIBLE_TEMPLATES: ReminderTemplate[] = [
  {
    id: 'tpl-bible-morning',
    type: 'bible_reading',
    title: 'Morning Bible Reading',
    message: "Spend a few peaceful minutes with God's Word before beginning your day.",
    defaultTime: '07:00 AM',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    destination: 'bible',
    icon: '📖',
  },
  {
    id: 'tpl-bible-votd',
    type: 'bible_reading',
    title: 'Verse of the Day',
    message: "Reflect on today's verse and meditate on God's truth and guidance.",
    defaultTime: '08:00 AM',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    destination: 'verse_of_day',
    icon: '✨',
  },
  {
    id: 'tpl-bible-study',
    type: 'bible_reading',
    title: 'Bible Study',
    message: 'Your Bible study time is here. Explore scripture deeply and apply it to life.',
    defaultTime: '08:00 PM',
    repeatType: 'specific_days',
    selectedDays: [2, 4, 6], // Tue, Thu, Sat
    destination: 'study',
    icon: '🔍',
  },
  {
    id: 'tpl-bible-evening',
    type: 'bible_reading',
    title: 'Evening Scripture',
    message: "End your day with God's Word and find quiet rest in His promises.",
    defaultTime: '09:00 PM',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    destination: 'bible',
    icon: '🛋️',
  },
];

const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-prayer-morning',
    type: 'prayer',
    title: 'Morning Prayer & Devotion',
    message: 'Start your day with Scripture and dedicate your steps to Christ.',
    time: '07:00 AM',
    repeat_type: 'daily',
    selected_days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    sound_enabled: true,
    vibration_enabled: true,
    destination: 'prayer',
    created_at: 1710000000000,
    updated_at: 1710000000000,
  },
  {
    id: 'rem-prayer-afternoon',
    type: 'prayer',
    title: 'Midday Prayer & Grace',
    message: 'Take a holy breath. Cast your midday stress on God.',
    time: '01:00 PM',
    repeat_type: 'daily',
    selected_days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    sound_enabled: true,
    vibration_enabled: true,
    destination: 'prayer',
    created_at: 1710000002000,
    updated_at: 1710000002000,
  },
  {
    id: 'rem-prayer-evening',
    type: 'devotional',
    title: 'Evening Devotion & Walk',
    message: 'Reflect on God’s goodness and review today’s Scripture journey.',
    time: '07:00 PM',
    repeat_type: 'daily',
    selected_days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    sound_enabled: true,
    vibration_enabled: true,
    destination: 'verse_of_day',
    created_at: 1710000003000,
    updated_at: 1710000003000,
  },
  {
    id: 'rem-prayer-night',
    type: 'prayer',
    title: 'Night Prayer & Peaceful Rest',
    message: 'Slow down in gratitude and rest safely in His peace tonight.',
    time: '09:30 PM',
    repeat_type: 'daily',
    selected_days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    sound_enabled: true,
    vibration_enabled: true,
    destination: 'prayer',
    created_at: 1710000004000,
    updated_at: 1710000004000,
  },
];

export interface ReminderState {
  reminders: ReminderItem[];
  masterEnabled: boolean;
  devicePermissionStatus: DevicePermissionState;
  hasCheckedPermissionOnce: boolean;

  // Actions
  checkDevicePermissions: () => Promise<DevicePermissionState>;
  requestDevicePermissions: () => Promise<boolean>;
  setMasterEnabled: (enabled: boolean) => Promise<void>;
  toggleAllDailyRhythms: (enable?: boolean) => Promise<boolean>;

  addReminder: (
    reminder: Omit<ReminderItem, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<ReminderItem>;
  updateReminder: (id: string, updates: Partial<ReminderItem>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  duplicateReminder: (id: string) => Promise<ReminderItem | null>;
  toggleReminderEnabled: (id: string) => Promise<void>;

  getPrayerReminders: () => ReminderItem[];
  getBibleReadingReminders: () => ReminderItem[];
  syncAllScheduledNotifications: () => Promise<void>;
}

const zustandStorage: StateStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: INITIAL_REMINDERS,
      masterEnabled: true,
      devicePermissionStatus: 'undetermined',
      hasCheckedPermissionOnce: false,

      checkDevicePermissions: async () => {
        const status = await checkDeviceNotificationPermission();
        set({ devicePermissionStatus: status, hasCheckedPermissionOnce: true });
        return status;
      },

      requestDevicePermissions: async () => {
        const granted = await requestDeviceNotificationPermission();
        const status: DevicePermissionState = granted ? 'granted' : 'denied';
        set({ devicePermissionStatus: status, hasCheckedPermissionOnce: true });

        if (granted && get().masterEnabled) {
          await get().syncAllScheduledNotifications();
        }

        return granted;
      },

      setMasterEnabled: async (enabled: boolean) => {
        const updated = get().reminders.map((r) => ({ ...r, enabled }));
        set({ masterEnabled: enabled, reminders: updated });
        await rescheduleAllReminders(updated, enabled);
      },

      toggleAllDailyRhythms: async (targetState?: boolean) => {
        const current = get().masterEnabled;
        const next = targetState !== undefined ? targetState : !current;

        if (next) {
          let permission = get().devicePermissionStatus;
          if (permission !== 'granted') {
            const granted = await get().requestDevicePermissions();
            if (!granted) {
              return false;
            }
          }
          const updated = get().reminders.map((r) => ({ ...r, enabled: true }));
          set({ masterEnabled: true, reminders: updated });
          await rescheduleAllReminders(updated, true);
          return true;
        } else {
          const updated = get().reminders.map((r) => ({ ...r, enabled: false }));
          set({ masterEnabled: false, reminders: updated });
          await rescheduleAllReminders(updated, false);
          return false;
        }
      },

      addReminder: async (data) => {
        await initNotificationChannels();
        const now = Date.now();
        const newReminder: ReminderItem = {
          ...data,
          id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          created_at: now,
          updated_at: now,
        };

        // If enabled and master is enabled, schedule with OS
        if (newReminder.enabled && get().masterEnabled) {
          const ids = await scheduleReminderNotification(newReminder);
          newReminder.scheduled_notification_ids = ids;
        }

        set((state) => ({
          reminders: [newReminder, ...state.reminders],
        }));

        // Optional cloud backup to Supabase
        try {
          Promise.resolve(
            supabase.from('reminders').insert({
              id: newReminder.id,
              user_id: newReminder.user_id || 'anonymous',
              type: newReminder.type,
              title: newReminder.title,
              message: newReminder.message,
              time: newReminder.time,
              repeat_type: newReminder.repeat_type,
              selected_days: newReminder.selected_days,
              enabled: newReminder.enabled,
              sound_enabled: newReminder.sound_enabled,
              vibration_enabled: newReminder.vibration_enabled,
              destination: newReminder.destination,
            })
          ).catch(() => {});
        } catch {}

        return newReminder;
      },

      updateReminder: async (id, updates) => {
        const currentList = get().reminders;
        const index = currentList.findIndex((r) => r.id === id);
        if (index === -1) return;

        const oldItem = currentList[index];
        // Cancel previous OS schedule
        await cancelReminderNotifications(oldItem);

        const updatedItem: ReminderItem = {
          ...oldItem,
          ...updates,
          updated_at: Date.now(),
        };

        // Reschedule if enabled
        if (updatedItem.enabled && get().masterEnabled) {
          const ids = await scheduleReminderNotification(updatedItem);
          updatedItem.scheduled_notification_ids = ids;
        } else {
          updatedItem.scheduled_notification_ids = [];
        }

        const newList = [...currentList];
        newList[index] = updatedItem;

        set({ reminders: newList });

        // Cloud sync
        try {
          Promise.resolve(
            supabase.from('reminders').upsert({
              id: updatedItem.id,
              user_id: updatedItem.user_id || 'anonymous',
              type: updatedItem.type,
              title: updatedItem.title,
              message: updatedItem.message,
              time: updatedItem.time,
              repeat_type: updatedItem.repeat_type,
              selected_days: updatedItem.selected_days,
              enabled: updatedItem.enabled,
              sound_enabled: updatedItem.sound_enabled,
              vibration_enabled: updatedItem.vibration_enabled,
              destination: updatedItem.destination,
            })
          ).catch(() => {});
        } catch {}
      },

      deleteReminder: async (id) => {
        const item = get().reminders.find((r) => r.id === id);
        if (item) {
          await cancelReminderNotifications(item);
        }

        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        }));

        try {
          Promise.resolve(
            supabase.from('reminders').delete().eq('id', id)
          ).catch(() => {});
        } catch {}
      },

      duplicateReminder: async (id) => {
        const item = get().reminders.find((r) => r.id === id);
        if (!item) return null;

        const cloned: Omit<ReminderItem, 'id' | 'created_at' | 'updated_at'> = {
          ...item,
          title: `${item.title} (Copy)`,
          scheduled_notification_ids: [],
        };

        return await get().addReminder(cloned);
      },

      toggleReminderEnabled: async (id) => {
        const item = get().reminders.find((r) => r.id === id);
        if (!item) return;
        await get().updateReminder(id, { enabled: !item.enabled });
      },

      getPrayerReminders: () => {
        return get().reminders.filter((r) => r.type === 'prayer');
      },

      getBibleReadingReminders: () => {
        return get().reminders.filter((r) => r.type === 'bible_reading');
      },

      syncAllScheduledNotifications: async () => {
        const { reminders, masterEnabled } = get();
        const idsMap = await rescheduleAllReminders(reminders, masterEnabled);

        set((state) => ({
          reminders: state.reminders.map((r) => ({
            ...r,
            scheduled_notification_ids: idsMap[r.id] || [],
          })),
        }));
      },
    }),
    {
      name: 'spiritual-reminders-v2-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
