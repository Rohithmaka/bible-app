import { supabase, isSupabaseConfigured } from './supabaseConfig';
import { storage } from '../storage/storage';

const ANONYMOUS_USER_KEY = 'sela_auth_user_id';
const DISPLAY_NAME_KEY = 'sela_auth_display_name';

export interface AuthUserProfile {
  id: string;
  displayName: string;
  isAnonymous: boolean;
  email?: string;
}

/**
 * Initializes the user session.
 * Uses persistent Anonymous Auth via Supabase so every device has a unique `auth.uid()`.
 * If Supabase is offline/not configured, falls back to a generated local UUID in MMKV.
 */
export async function initializeUserSession(): Promise<AuthUserProfile> {
  // 1. Fallback local profile if Supabase is unconfigured
  let localUid = storage.getString(ANONYMOUS_USER_KEY);
  let localName = storage.getString(DISPLAY_NAME_KEY) || 'Believer';

  if (!localUid) {
    localUid = 'local_' + Math.random().toString(36).substring(2, 12);
    storage.set(ANONYMOUS_USER_KEY, localUid);
    storage.set(DISPLAY_NAME_KEY, localName);
  }

  if (!isSupabaseConfigured()) {
    return {
      id: localUid,
      displayName: localName,
      isAnonymous: true,
    };
  }

  try {
    // 2. Check existing Supabase session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (!sessionError && sessionData?.session?.user) {
      const user = sessionData.session.user;
      storage.set(ANONYMOUS_USER_KEY, user.id);
      return {
        id: user.id,
        displayName: user.user_metadata?.display_name || localName,
        isAnonymous: user.is_anonymous ?? true,
        email: user.email,
      };
    }

    // 3. Perform Anonymous Sign-In if no active session
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          display_name: localName,
        },
      },
    });

    if (!authError && authData?.user) {
      const user = authData.user;
      storage.set(ANONYMOUS_USER_KEY, user.id);
      
      // Auto-upsert into user_profiles table
      try {
        await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            user_id: user.id,
            display_name: localName,
          });
      } catch (_) {}

      return {
        id: user.id,
        displayName: localName,
        isAnonymous: true,
      };
    }
  } catch (e) {
    console.warn('Supabase anonymous auth fallback to local:', e);
  }

  return {
    id: localUid,
    displayName: localName,
    isAnonymous: true,
  };
}

/**
 * Gets currently cached user profile.
 */
export function getCachedUserProfile(): AuthUserProfile {
  const id = storage.getString(ANONYMOUS_USER_KEY) || 'anonymous';
  const displayName = storage.getString(DISPLAY_NAME_KEY) || 'Believer';
  return {
    id,
    displayName,
    isAnonymous: true,
  };
}

/**
 * Updates the user's display name locally and in Supabase.
 */
export async function updateUserDisplayName(name: string): Promise<void> {
  storage.set(DISPLAY_NAME_KEY, name);
  if (!isSupabaseConfigured()) return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
    if (uid) {
      await supabase
        .from('user_profiles')
        .update({ display_name: name, updated_at: new Date().toISOString() })
        .eq('id', uid);
    }
  } catch (e) {
    console.warn('Failed to update display name in Supabase:', e);
  }
}
