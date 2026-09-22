import { supabase, isSupabaseConfigured } from './supabaseConfig';
import { storage } from '../storage/storage';
import { DailyDevotionItem, getFallbackDevotionForDate } from '../data/dailyDevotionsSeed';

const PENDING_SYNC_KEY = 'sela_pending_devotion_completions';
const PENDING_SAVED_KEY = 'sela_pending_devotion_saved';
const DEVOTION_CACHE_PREFIX = 'sela_cached_devotion_';

interface PendingDevotionAction {
  devotionId: string;
  dateStr: string;
  completed?: boolean;
  saved?: boolean;
  timestamp: number;
}

/**
 * Formats a JavaScript Date object into a reliable YYYY-MM-DD local date string.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Fetches today's Daily Devotion.
 * 1. Checks memory/local cache first for instant zero-latency loading.
 * 2. Fetches from Supabase 'daily_devotions' by calendar date.
 * 3. Falls back gracefully to the rich original SELA devotional seed catalog if offline.
 */
export async function fetchDailyDevotionForDate(dateStr: string = getLocalDateString()): Promise<DailyDevotionItem> {
  const cacheKey = `${DEVOTION_CACHE_PREFIX}${dateStr}`;
  const cached = storage.getString(cacheKey);
  let localFallback: DailyDevotionItem | null = null;

  if (cached) {
    try {
      localFallback = JSON.parse(cached);
    } catch {
      // Ignored: parse error fallback
    }
  }

  if (!isSupabaseConfigured()) {
    const fallback = localFallback || getFallbackDevotionForDate(new Date(dateStr + 'T00:00:00'));
    storage.set(cacheKey, JSON.stringify(fallback));
    return fallback;
  }

  try {
    const { data, error } = await supabase
      .from('daily_devotions')
      .select('*')
      .eq('date', dateStr)
      .maybeSingle();

    if (!error && data) {
      const devotionItem: DailyDevotionItem = {
        id: data.id,
        date: data.date,
        title: data.title,
        verseReference: data.verse_reference,
        verseText: data.verse_text,
        verseTranslation: data.verse_translation || 'KJV',
        devotion: data.devotion,
        reflectionQuestion: data.reflection_question,
        prayer: data.prayer,
        dailyAction: data.daily_action,
        bookId: data.book_id,
        chapter: data.chapter,
        verse: data.verse,
      };

      // Save to local cache for offline reliability
      storage.set(cacheKey, JSON.stringify(devotionItem));
      return devotionItem;
    }
  } catch (e) {
    console.warn('Network error fetching Supabase daily devotion:', e);
  }

  // Graceful offline fallback
  const fallback = localFallback || getFallbackDevotionForDate(new Date(dateStr + 'T00:00:00'));
  storage.set(cacheKey, JSON.stringify(fallback));
  return fallback;
}

/**
 * Fetches the user's completion & bookmark status for a specific devotion from Supabase.
 */
export async function fetchUserDevotionStatus(
  devotionId: string
): Promise<{ completed: boolean; saved: boolean; completedAt?: string }> {
  if (!isSupabaseConfigured()) {
    return { completed: false, saved: false };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) {
      return { completed: false, saved: false };
    }

    const { data, error } = await supabase
      .from('user_daily_devotions')
      .select('completed, saved, completed_at')
      .eq('user_id', userId)
      .eq('devotion_id', devotionId)
      .maybeSingle();

    if (!error && data) {
      return {
        completed: !!data.completed,
        saved: !!data.saved,
        completedAt: data.completed_at,
      };
    }
  } catch (e) {
    console.warn('Failed to query user devotion status:', e);
  }

  return { completed: false, saved: false };
}

/**
 * Records completion of today's devotion in Supabase.
 * If offline or unauthenticated, queues the completion locally to sync later.
 */
export async function recordDevotionCompletion(
  devotionId: string,
  dateStr: string,
  completed: boolean = true
): Promise<boolean> {
  const isOnline = isSupabaseConfigured();

  if (isOnline) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (userId) {
        const { error } = await supabase.from('user_daily_devotions').upsert(
          {
            user_id: userId,
            devotion_id: devotionId,
            completed,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,devotion_id' }
        );

        if (!error) {
          return true;
        }
      }
    } catch (e) {
      console.warn('Error recording devotion completion to Supabase, queuing locally:', e);
    }
  }

  // Queue locally for background sync
  queuePendingCompletion({
    devotionId,
    dateStr,
    completed,
    timestamp: Date.now(),
  });
  return true;
}

/**
 * Records bookmark/saved status in Supabase with offline queue fallback.
 */
export async function recordDevotionSaved(
  devotionId: string,
  dateStr: string,
  saved: boolean
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (userId) {
        const { error } = await supabase.from('user_daily_devotions').upsert(
          {
            user_id: userId,
            devotion_id: devotionId,
            saved,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,devotion_id' }
        );

        if (!error) return true;
      }
    } catch (e) {
      console.warn('Failed to sync saved devotion to Supabase:', e);
    }
  }

  queuePendingSaved({
    devotionId,
    dateStr,
    saved,
    timestamp: Date.now(),
  });
  return true;
}

/**
 * Synchronizes any pending offline completions with Supabase once network returns.
 */
export async function syncPendingDevotionCompletions(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;

    // 1. Sync completions
    const pendingRaw = storage.getString(PENDING_SYNC_KEY);
    if (pendingRaw) {
      const pendingList: PendingDevotionAction[] = JSON.parse(pendingRaw);
      const remaining: PendingDevotionAction[] = [];

      for (const item of pendingList) {
        try {
          const { error } = await supabase.from('user_daily_devotions').upsert(
            {
              user_id: userId,
              devotion_id: item.devotionId,
              completed: item.completed !== false,
              completed_at: new Date(item.timestamp).toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,devotion_id' }
          );

          if (error) {
            remaining.push(item);
          }
        } catch {
          remaining.push(item);
        }
      }

      if (remaining.length > 0) {
        storage.set(PENDING_SYNC_KEY, JSON.stringify(remaining));
      } else {
        storage.delete(PENDING_SYNC_KEY);
      }
    }

    // 2. Sync bookmarks
    const savedRaw = storage.getString(PENDING_SAVED_KEY);
    if (savedRaw) {
      const savedList: PendingDevotionAction[] = JSON.parse(savedRaw);
      const remainingSaved: PendingDevotionAction[] = [];

      for (const item of savedList) {
        try {
          const { error } = await supabase.from('user_daily_devotions').upsert(
            {
              user_id: userId,
              devotion_id: item.devotionId,
              saved: item.saved ?? true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,devotion_id' }
          );

          if (error) remainingSaved.push(item);
        } catch {
          remainingSaved.push(item);
        }
      }

      if (remainingSaved.length > 0) {
        storage.set(PENDING_SAVED_KEY, JSON.stringify(remainingSaved));
      } else {
        storage.delete(PENDING_SAVED_KEY);
      }
    }
  } catch (e) {
    console.warn('Failed to sync pending completions to Supabase:', e);
  }
}

// Queue helpers
function queuePendingCompletion(action: PendingDevotionAction) {
  try {
    const raw = storage.getString(PENDING_SYNC_KEY);
    const list: PendingDevotionAction[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((i) => i.devotionId !== action.devotionId);
    filtered.push(action);
    storage.set(PENDING_SYNC_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Error queueing completion:', e);
  }
}

function queuePendingSaved(action: PendingDevotionAction) {
  try {
    const raw = storage.getString(PENDING_SAVED_KEY);
    const list: PendingDevotionAction[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((i) => i.devotionId !== action.devotionId);
    filtered.push(action);
    storage.set(PENDING_SAVED_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Error queueing saved devotion:', e);
  }
}
