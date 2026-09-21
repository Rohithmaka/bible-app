import { supabase, isSupabaseConfigured } from './supabaseConfig';
import { StudyNote, DailyTimeLog } from '../store/useBibleStore';
import { storage } from '../storage/storage';

const USER_ID_KEY = 'sela_auth_user_id';

/**
 * Upserts a study note into the Supabase 'verse_notes' table.
 */
export async function syncNoteToSupabase(note: StudyNote): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || storage.getString(USER_ID_KEY);
    if (!userId) return;

    await supabase.from('verse_notes').upsert({
      user_id: userId,
      translation_id: 'kjv',
      book_id: note.bookId,
      chapter: note.chapter,
      verse: note.verse,
      note_text: note.content,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,translation_id,book_id,chapter,verse'
    });
  } catch (e) {
    console.warn('Failed to sync note to Supabase:', e);
  }
}

/**
 * Deletes a study note from Supabase.
 */
export async function deleteNoteFromSupabase(bookId: string, chapter: number, verse: number): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || storage.getString(USER_ID_KEY);
    if (!userId) return;

    await supabase
      .from('verse_notes')
      .delete()
      .match({
        user_id: userId,
        book_id: bookId,
        chapter,
        verse,
      });
  } catch (e) {
    console.warn('Failed to delete note from Supabase:', e);
  }
}

/**
 * Syncs the 365-Day reading planner progress to Supabase user_profiles.
 */
export async function syncPlannerProgressToSupabase(
  completedDays: Record<string, number[]>,
  dailyTimeLogs: Record<string, DailyTimeLog>,
  streak: number
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || storage.getString(USER_ID_KEY);
    if (!userId) return;

    await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        user_id: userId,
        growth_goals: {
          completedDays,
          dailyTimeLogs,
          streak,
          syncedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });
  } catch (e) {
    console.warn('Failed to sync planner progress to Supabase:', e);
  }
}

/**
 * Syncs highlights and bookmarks to Supabase user_profiles.
 */
export async function syncUserDataBackupToSupabase(
  bookmarks: any[],
  highlights: Record<string, any>
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || storage.getString(USER_ID_KEY);
    if (!userId) return;

    await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        user_id: userId,
        bookmarks: bookmarks,
        highlights: highlights,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });
  } catch (e) {
    console.warn('Failed to backup devotional data to Supabase:', e);
  }
}
