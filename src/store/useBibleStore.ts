import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from '../storage/storage';

export type HighlightColor = 'gold' | 'sapphire' | 'emerald' | 'rose' | 'purple';
export type ThemeMode = 'light' | 'dark' | 'sepia';
export type BibleTranslation = 'KJV' | 'WEB';

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

export interface BibleState {
  // Navigation Location
  activeBookId: string;
  activeChapter: number;
  selectedVerseNumbers: number[];
  
  // Customization
  translation: BibleTranslation;
  themeMode: ThemeMode;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  lineSpacing: 'normal' | 'relaxed' | 'spacious';
  showVerseNumbers: boolean;
  
  // Library & Personal Data
  bookmarks: Bookmark[];
  highlights: Record<string, HighlightItem>;
  notes: Record<string, StudyNote>;
  
  // Reading Plans
  enrolledPlanIds: string[];
  completedPlanDays: Record<string, number[]>; // planId -> array of completed day numbers
  dailyStreak: number;
  
  // Audio Player State
  isAudioPlaying: boolean;
  playbackSpeed: number;
  audioVerseIndex: number | null;
  
  // Actions
  setLocation: (bookId: string, chapter: number) => void;
  toggleVerseSelection: (verseNumber: number) => void;
  clearVerseSelection: () => void;
  
  setTranslation: (translation: BibleTranslation) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setFontSize: (fontSize: 'sm' | 'md' | 'lg' | 'xl') => void;
  
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
      activeBookId: 'MAT',
      activeChapter: 5,
      selectedVerseNumbers: [],
      
      translation: 'KJV',
      themeMode: 'light',
      fontSize: 'md',
      lineSpacing: 'relaxed',
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
        }
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
        }
      },
      notes: {},
      
      enrolledPlanIds: ['gospels-30'],
      completedPlanDays: {
        'gospels-30': [1, 2]
      },
      dailyStreak: 3,
      
      isAudioPlaying: false,
      playbackSpeed: 1.0,
      audioVerseIndex: null,

      // Actions implementation
      setLocation: (bookId, chapter) => {
        set({ activeBookId: bookId, activeChapter: chapter, selectedVerseNumbers: [], audioVerseIndex: null });
      },

      toggleVerseSelection: (verseNumber) => {
        const current = get().selectedVerseNumbers;
        if (current.includes(verseNumber)) {
          set({ selectedVerseNumbers: current.filter(v => v !== verseNumber) });
        } else {
          set({ selectedVerseNumbers: [...current, verseNumber].sort((a, b) => a - b) });
        }
      },

      clearVerseSelection: () => {
        set({ selectedVerseNumbers: [] });
      },

      setTranslation: (translation) => set({ translation }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setFontSize: (fontSize) => set({ fontSize }),

      addBookmark: (bm) => {
        const id = `bm-${Date.now()}`;
        const newBm: Bookmark = { ...bm, id, createdAt: Date.now() };
        set(state => ({ bookmarks: [newBm, ...state.bookmarks] }));
      },

      removeBookmark: (id) => {
        set(state => ({ bookmarks: state.bookmarks.filter(b => b.id !== id) }));
      },

      isBookmarked: (bookId, chapter, verse) => {
        return get().bookmarks.some(b => b.bookId === bookId && b.chapter === chapter && b.verse === verse);
      },

      setHighlight: (bookId, bookName, chapter, verse, text, color) => {
        const key = `${bookId}:${chapter}:${verse}`;
        set(state => ({
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
            }
          }
        }));
      },

      removeHighlight: (verseKey) => {
        set(state => {
          const updated = { ...state.highlights };
          delete updated[verseKey];
          return { highlights: updated };
        });
      },

      saveNote: (bookId, bookName, chapter, verse, verseText, content) => {
        const key = `${bookId}:${chapter}:${verse}`;
        set(state => ({
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
            }
          }
        }));
      },

      deleteNote: (verseKey) => {
        set(state => {
          const updated = { ...state.notes };
          delete updated[verseKey];
          return { notes: updated };
        });
      },

      enrollPlan: (planId) => {
        set(state => {
          if (state.enrolledPlanIds.includes(planId)) return state;
          return { enrolledPlanIds: [...state.enrolledPlanIds, planId] };
        });
      },

      togglePlanDay: (planId, dayNumber) => {
        set(state => {
          const currentDays = state.completedPlanDays[planId] || [];
          const updatedDays = currentDays.includes(dayNumber)
            ? currentDays.filter(d => d !== dayNumber)
            : [...currentDays, dayNumber];
          
          return {
            completedPlanDays: {
              ...state.completedPlanDays,
              [planId]: updatedDays,
            }
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
