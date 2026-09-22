import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from '../storage/storage';
import { DailyDevotionItem, getFallbackDevotionForDate } from '../data/dailyDevotionsSeed';
import {
  fetchDailyDevotionForDate,
  fetchUserDevotionStatus,
  recordDevotionCompletion,
  recordDevotionSaved,
  getLocalDateString,
  syncPendingDevotionCompletions,
} from '../services/dailyDevotionService';
import { useBibleStore } from './useBibleStore';
import { Analytics } from '../services/analyticsService';

const mmkvStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

/**
 * Calculates consecutive daily devotion streak from a list of completed YYYY-MM-DD date strings.
 * Accurately anchors to today or yesterday, and handles all calendar boundaries.
 */
export function calculateDevotionStreakFromDates(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;
  const set = new Set(completedDates);

  const now = new Date();
  const todayStr = getLocalDateString(now);
  const yesterdayStr = getLocalDateString(new Date(now.getTime() - 86400000));

  let anchorStr = '';
  if (set.has(todayStr)) {
    anchorStr = todayStr;
  } else if (set.has(yesterdayStr)) {
    anchorStr = yesterdayStr;
  } else {
    return 0;
  }

  let streak = 0;
  let checkTime = new Date(`${anchorStr}T00:00:00`).getTime();

  while (true) {
    const dateToCheck = getLocalDateString(new Date(checkTime));
    if (set.has(dateToCheck)) {
      streak++;
      checkTime -= 86400000; // move 1 day back
    } else {
      break;
    }
  }

  return streak;
}

export interface DevotionState {
  todayDevotion: DailyDevotionItem;
  isLoading: boolean;
  isCompleted: boolean;
  isSaved: boolean;
  completedDates: string[]; // YYYY-MM-DD strings
  savedDevotionIds: string[];
  devotionStreak: number;

  // Actions
  loadTodayDevotion: () => Promise<void>;
  markDevotionCompleted: () => Promise<void>;
  toggleDevotionSaved: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
}

export const useDevotionStore = create<DevotionState>()(
  persist(
    (set, get) => ({
      todayDevotion: getFallbackDevotionForDate(),
      isLoading: false,
      isCompleted: false,
      isSaved: false,
      completedDates: [],
      savedDevotionIds: [],
      devotionStreak: 0,

      loadTodayDevotion: async () => {
        set({ isLoading: true });
        const todayStr = getLocalDateString();

        try {
          const devotion = await fetchDailyDevotionForDate(todayStr);
          const state = get();
          const isLocallyCompleted = state.completedDates.includes(todayStr);
          const isLocallySaved = state.savedDevotionIds.includes(devotion.id);

          // Fetch cloud status asynchronously
          const cloudStatus = await fetchUserDevotionStatus(devotion.id);

          const finalCompleted = isLocallyCompleted || cloudStatus.completed;
          const finalSaved = isLocallySaved || cloudStatus.saved;

          let updatedDates = [...state.completedDates];
          if (finalCompleted && !updatedDates.includes(todayStr)) {
            updatedDates.push(todayStr);
          }

          let updatedSaved = [...state.savedDevotionIds];
          if (finalSaved && !updatedSaved.includes(devotion.id)) {
            updatedSaved.push(devotion.id);
          }

          const streak = calculateDevotionStreakFromDates(updatedDates);

          // Sync app-wide streak
          useBibleStore.getState().setDailyStreak(streak);

          set({
            todayDevotion: devotion,
            isCompleted: finalCompleted,
            isSaved: finalSaved,
            completedDates: updatedDates,
            savedDevotionIds: updatedSaved,
            devotionStreak: streak,
            isLoading: false,
          });

          Analytics.trackDevotionViewed(devotion.id, todayStr, devotion.verseReference);
        } catch (e) {
          console.warn('Error loading today devotion:', e);
          const fallback = getFallbackDevotionForDate();
          set({
            todayDevotion: fallback,
            isLoading: false,
          });
        }
      },

      markDevotionCompleted: async () => {
        const state = get();
        const todayStr = getLocalDateString();
        const devotion = state.todayDevotion;

        // Idempotency check: If already completed today, do not increment streak again
        if (state.completedDates.includes(todayStr) && state.isCompleted) {
          return;
        }

        const newCompletedDates = Array.from(new Set([...state.completedDates, todayStr]));
        const newStreak = calculateDevotionStreakFromDates(newCompletedDates);

        // Update local state immediately for instant feedback
        set({
          isCompleted: true,
          completedDates: newCompletedDates,
          devotionStreak: newStreak,
        });

        // Sync with SELA app-wide streak
        useBibleStore.getState().setDailyStreak(newStreak);

        Analytics.trackDevotionCompleted(devotion.id, todayStr, newStreak);

        // Sync to Supabase
        await recordDevotionCompletion(devotion.id, todayStr, true);
      },

      toggleDevotionSaved: async () => {
        const state = get();
        const devotion = state.todayDevotion;
        const newSaved = !state.isSaved;

        let newSavedIds: string[];
        if (newSaved) {
          newSavedIds = Array.from(new Set([...state.savedDevotionIds, devotion.id]));
        } else {
          newSavedIds = state.savedDevotionIds.filter((id) => id !== devotion.id);
        }

        set({
          isSaved: newSaved,
          savedDevotionIds: newSavedIds,
        });

        Analytics.trackDevotionSaved(devotion.id, newSaved);
        await recordDevotionSaved(devotion.id, devotion.date, newSaved);
      },

      syncWithCloud: async () => {
        await syncPendingDevotionCompletions();
        await get().loadTodayDevotion();
      },
    }),
    {
      name: 'sela-daily-devotion-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        completedDates: state.completedDates,
        savedDevotionIds: state.savedDevotionIds,
        devotionStreak: state.devotionStreak,
        todayDevotion: state.todayDevotion,
      }),
    }
  )
);
