import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from '../storage/storage';

export type HighlightColor = 'gold' | 'sapphire' | 'emerald' | 'rose' | 'purple';
export type ThemeMode = 'light' | 'dark' | 'sepia';
export type ReadingFontFamily = 'auto' | 'mandali' | 'serif' | 'sans';
export type BibleTranslation = string;

export interface Bookmark {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: number;
}

export interface HighlightItem {
  verseKey: string; // `${bookId}:${chapter}:${verse}`
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  color: HighlightColor;
  text: string;
  createdAt: number;
}

export interface StudyNote {
  verseKey: string; // `${bookId}:${chapter}:${verse}`
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string;
  content: string;
  updatedAt: number;
}

export interface HistoryItem {
  bookId: string;
  bookName: string;
  chapter: number;
  timestamp: number;
}

export interface DailyTimeLog {
  readingMinutes: number; // Bible reading time in mins
  prayerMinutes: number;  // Prayer time in mins
  quietMinutes: number;   // Quiet time in mins
}

export interface BibleState {
  // Navigation Location
  activeBookId: string;
  activeChapter: number;
  selectedVerseNumbers: number[];

  // Translation & Parallel Mode
  translation: string;
  parallelMode: boolean;
  parallelTranslations: string[]; // 2-4 selected translations

  // Visual & Reading Customizations
  themeMode: ThemeMode;
  fontFamily: ReadingFontFamily;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  lineSpacing: 'normal' | 'relaxed' | 'spacious';
  verseSpacing: 'compact' | 'normal' | 'spacious';
  showVerseNumbers: boolean;

  // Library & Personal Data
  bookmarks: Bookmark[];
  highlights: Record<string, HighlightItem>;
  notes: Record<string, StudyNote>;
  history: HistoryItem[];

  // Reading Plans & Daily Time Tracking
  enrolledPlanIds: string[];
  completedPlanDays: Record<string, number[]>;
  dailyStreak: number;
  rewardPoints: number;
  unlockedAchievements: string[];
  dailyTimeLogs: Record<string, DailyTimeLog>; // `${planId}:${dayNumber}` -> DailyTimeLog

  // Audio Player State
  isAudioPlaying: boolean;
  playbackSpeed: number;
  audioVerseIndex: number | null;

  // Actions
  setLocation: (bookId: string, chapter: number) => void;
  toggleVerseSelection: (verseNumber: number) => void;
  clearVerseSelection: () => void;

  setTranslation: (translation: string) => void;
  setParallelMode: (enabled: boolean) => void;
  setParallelTranslations: (translations: string[]) => void;
  toggleParallelTranslation: (translationId: string) => void;

  setThemeMode: (themeMode: ThemeMode) => void;
  setFontFamily: (fontFamily: ReadingFontFamily) => void;
  setFontSize: (fontSize: 'sm' | 'md' | 'lg' | 'xl') => void;
  setLineSpacing: (spacing: 'normal' | 'relaxed' | 'spacious') => void;
  setVerseSpacing: (spacing: 'compact' | 'normal' | 'spacious') => void;

  // Bookmark actions
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (bookId: string, chapter: number, verse: number) => boolean;

  // Highlight actions
  setHighlight: (bookId: string, bookName: string, chapter: number, verse: number, text: string, color: HighlightColor) => void;
  removeHighlight: (verseKey: string) => void;

  // Note actions
  saveNote: (bookId: string, bookName: string, chapter: number, verse: number, verseText: string, content: string) => void;
  deleteNote: (verseKey: string) => void;

  // Reading Plan actions
  enrollPlan: (planId: string) => void;
  togglePlanDay: (planId: string, dayNumber: number) => void;
  setDailyTimeLog: (planId: string, dayNumber: number, log: Partial<DailyTimeLog>) => void;

  // Audio actions
  setAudioPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setAudioVerseIndex: (index: number | null) => void;
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

export const useBibleStore = create<BibleState>()(
  persist(
    (set, get) => ({
      // Defaults
      activeBookId: 'JHN',
      activeChapter: 3,
      selectedVerseNumbers: [],

      translation: 'KJV',
      parallelMode: false,
      parallelTranslations: ['KJV', 'WEB', 'TEL_IRV'],

      themeMode: 'light',
      fontFamily: 'auto',
      fontSize: 'md',
      lineSpacing: 'relaxed',
      verseSpacing: 'normal',
      showVerseNumbers: true,

      bookmarks: [
        {
          id: 'bm-1',
          bookId: 'PSA',
          bookName: 'Psalms',
          chapter: 23,
          verse: 1,
          text: 'The LORD is my shepherd; I shall not want.',
          createdAt: Date.now() - 86400000,
        },
      ],
      highlights: {
        'JHN:3:16': {
          verseKey: 'JHN:3:16',
          bookId: 'JHN',
          bookName: 'John',
          chapter: 3,
          verse: 16,
          color: 'gold',
          text: 'For God so loved the world, that he gave his only begotten Son...',
          createdAt: Date.now() - 43200000,
        },
      },
      notes: {},
      history: [
        { bookId: 'JHN', bookName: 'John', chapter: 3, timestamp: Date.now() - 3600000 },
      ],

      enrolledPlanIds: ['gospels-30'],
      completedPlanDays: {
        'gospels-30': [1, 2],
      },
      dailyStreak: 3,
      rewardPoints: 350,
      unlockedAchievements: ['first_step', 'flame_3'],
      dailyTimeLogs: {},

      isAudioPlaying: false,
      playbackSpeed: 1.0,
      audioVerseIndex: null,

      // Actions implementation
      setLocation: (bookId, chapter) => {
        const historyItem: HistoryItem = { bookId, bookName: bookId, chapter, timestamp: Date.now() };
        set((state) => ({
          activeBookId: bookId,
          activeChapter: chapter,
          selectedVerseNumbers: [],
          audioVerseIndex: null,
          history: [historyItem, ...state.history.filter((h) => !(h.bookId === bookId && h.chapter === chapter))].slice(0, 20),
        }));
      },

      toggleVerseSelection: (verseNumber) => {
        const current = get().selectedVerseNumbers;
        if (current.includes(verseNumber)) {
          set({ selectedVerseNumbers: current.filter((v) => v !== verseNumber) });
        } else {
          set({ selectedVerseNumbers: [...current, verseNumber].sort((a, b) => a - b) });
        }
      },

      clearVerseSelection: () => {
        set({ selectedVerseNumbers: [] });
      },

      setTranslation: (translation) => set({ translation }),
      setParallelMode: (parallelMode) => set({ parallelMode }),
      setParallelTranslations: (parallelTranslations) => set({ parallelTranslations }),
      toggleParallelTranslation: (tId) => {
        const current = get().parallelTranslations;
        if (current.includes(tId)) {
          if (current.length > 1) {
            set({ parallelTranslations: current.filter((id) => id !== tId) });
          }
        } else {
          if (current.length < 4) {
            set({ parallelTranslations: [...current, tId] });
          }
        }
      },

      setThemeMode: (themeMode) => set({ themeMode }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineSpacing: (lineSpacing) => set({ lineSpacing }),
      setVerseSpacing: (verseSpacing) => set({ verseSpacing }),

      addBookmark: (bm) => {
        const id = `bm-${Date.now()}`;
        const newBm: Bookmark = { ...bm, id, createdAt: Date.now() };
        set((state) => ({ bookmarks: [newBm, ...state.bookmarks] }));
      },

      removeBookmark: (id) => {
        set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) }));
      },

      isBookmarked: (bookId, chapter, verse) => {
        return get().bookmarks.some((b) => b.bookId === bookId && b.chapter === chapter && b.verse === verse);
      },

      setHighlight: (bookId, bookName, chapter, verse, text, color) => {
        const key = `${bookId}:${chapter}:${verse}`;
        set((state) => ({
          highlights: {
            ...state.highlights,
            [key]: {
              verseKey: key,
              bookId,
              bookName,
              chapter,
              verse,
              color,
              text,
              createdAt: Date.now(),
            },
          },
        }));
      },

      removeHighlight: (verseKey) => {
        set((state) => {
          const updated = { ...state.highlights };
          delete updated[verseKey];
          return { highlights: updated };
        });
      },

      saveNote: (bookId, bookName, chapter, verse, verseText, content) => {
        const key = `${bookId}:${chapter}:${verse}`;
        set((state) => ({
          notes: {
            ...state.notes,
            [key]: {
              verseKey: key,
              bookId,
              bookName,
              chapter,
              verse,
              verseText,
              content,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      deleteNote: (verseKey) => {
        set((state) => {
          const updated = { ...state.notes };
          delete updated[verseKey];
          return { notes: updated };
        });
      },

      enrollPlan: (planId) => {
        set((state) => {
          if (state.enrolledPlanIds.includes(planId)) return state;
          return { enrolledPlanIds: [...state.enrolledPlanIds, planId] };
        });
      },

      togglePlanDay: (planId, dayNumber) => {
        set((state) => {
          const currentDays = state.completedPlanDays[planId] || [];
          const updatedDays = currentDays.includes(dayNumber)
            ? currentDays.filter((d) => d !== dayNumber)
            : [...currentDays, dayNumber];

          return {
            completedPlanDays: {
              ...state.completedPlanDays,
              [planId]: updatedDays,
            },
          };
        });
      },

      setDailyTimeLog: (planId, dayNumber, logUpdate) => {
        set((state) => {
          const key = `${planId}:${dayNumber}`;
          const current = state.dailyTimeLogs[key] || { readingMinutes: 15, prayerMinutes: 10, quietMinutes: 10 };
          return {
            dailyTimeLogs: {
              ...state.dailyTimeLogs,
              [key]: {
                ...current,
                ...logUpdate,
              },
            },
          };
        });
      },

      setAudioPlaying: (isAudioPlaying) => set({ isAudioPlaying }),
      setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
      setAudioVerseIndex: (audioVerseIndex) => set({ audioVerseIndex }),
    }),
    {
      name: 'holy-bible-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
