import { supabase, isSupabaseConfigured } from './supabaseConfig';
import { storage } from '../storage/storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const ANONYMOUS_USER_KEY = 'sela_auth_user_id';
const DISPLAY_NAME_KEY = 'sela_auth_display_name';
const USER_EMAIL_KEY = 'sela_auth_user_email';
const ONBOARDED_KEY = 'sela_has_onboarded';

export interface AuthUserProfile {
  id: string;
  displayName: string;
  isAnonymous: boolean;
  email?: string;
}

/**
 * Check if the user has completed the 5-question onboarding.
 */
export function hasCompletedOnboarding(): boolean {
  return storage.getBoolean(ONBOARDED_KEY) ?? false;
}

/**
 * Persist the onboarding completion status.
 */
export function setCompletedOnboarding(completed: boolean): void {
  storage.set(ONBOARDED_KEY, completed);
}

/**
 * Initializes the user session on app launch.
 */
export async function initializeUserSession(): Promise<AuthUserProfile> {
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
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (!sessionError && sessionData?.session?.user) {
      const user = sessionData.session.user;
      storage.set(ANONYMOUS_USER_KEY, user.id);
      if (user.email) storage.set(USER_EMAIL_KEY, user.email);
      return {
        id: user.id,
        displayName: user.user_metadata?.display_name || localName,
        isAnonymous: user.is_anonymous ?? true,
        email: user.email,
      };
    }
  } catch (e) {
    console.warn('Supabase session check fallback:', e);
  }

  return {
    id: localUid,
    displayName: localName,
    isAnonymous: true,
  };
}

/**
 * Sign in as Guest (Anonymous Auth).
 * Zero friction, instant 1-tap entry.
 */
export async function signInAsGuest(name: string = 'Friend'): Promise<AuthUserProfile> {
  let localUid = storage.getString(ANONYMOUS_USER_KEY);
  if (!localUid) {
    localUid = 'guest_' + Math.random().toString(36).substring(2, 12);
    storage.set(ANONYMOUS_USER_KEY, localUid);
  }
  storage.set(DISPLAY_NAME_KEY, name);

  if (!isSupabaseConfigured()) {
    return { id: localUid, displayName: name, isAnonymous: true };
  }

  try {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: { display_name: name },
      },
    });

    if (!error && data?.user) {
      storage.set(ANONYMOUS_USER_KEY, data.user.id);
      try {
        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          user_id: data.user.id,
          display_name: name,
        });
      } catch (_) {}

      return {
        id: data.user.id,
        displayName: name,
        isAnonymous: true,
      };
    }
  } catch (e) {
    console.warn('Supabase anonymous sign-in error:', e);
  }

  return { id: localUid, displayName: name, isAnonymous: true };
}

/**
 * Sign in with Email and Password using Supabase.
 */
export async function signInWithEmail(email: string, password: string): Promise<{ user: AuthUserProfile | null; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase is not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      const displayName = data.user.user_metadata?.display_name || email.split('@')[0];
      storage.set(ANONYMOUS_USER_KEY, data.user.id);
      storage.set(DISPLAY_NAME_KEY, displayName);
      storage.set(USER_EMAIL_KEY, data.user.email || email);

      return {
        user: {
          id: data.user.id,
          displayName,
          isAnonymous: false,
          email: data.user.email,
        },
      };
    }

    return { user: null, error: 'User not found' };
  } catch (err: any) {
    return { user: null, error: err.message || 'Failed to sign in' };
  }
}

/**
 * Sign up with Email and Password using Supabase.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<{ user: AuthUserProfile | null; error?: string; confirmationRequired?: boolean }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase is not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim() || email.split('@')[0],
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      const name = displayName.trim() || email.split('@')[0];
      storage.set(ANONYMOUS_USER_KEY, data.user.id);
      storage.set(DISPLAY_NAME_KEY, name);
      storage.set(USER_EMAIL_KEY, data.user.email || email);

      try {
        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          user_id: data.user.id,
          display_name: name,
        });
      } catch (_) {}

      const confirmationRequired = !data.session;

      return {
        user: {
          id: data.user.id,
          displayName: name,
          isAnonymous: false,
          email: data.user.email,
        },
        confirmationRequired,
      };
    }

    return { user: null, error: 'Failed to create user' };
  } catch (err: any) {
    return { user: null, error: err.message || 'Registration failed' };
  }
}

/**
 * Resends the email verification confirmation link.
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to resend confirmation email' };
  }
}

/**
 * Sign in with Google via Supabase OAuth.
 */
export async function signInWithGoogle(): Promise<{ user: AuthUserProfile | null; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase is not configured' };
  }

  try {
    const redirectUrl = Linking.createURL('login');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: Platform.OS !== 'web',
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (Platform.OS !== 'web' && data?.url) {
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (res.type === 'success' && res.url) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const u = sessionData.session.user;
          const displayName = u.user_metadata?.full_name || u.user_metadata?.display_name || 'Google User';
          storage.set(ANONYMOUS_USER_KEY, u.id);
          storage.set(DISPLAY_NAME_KEY, displayName);
          if (u.email) storage.set(USER_EMAIL_KEY, u.email);

          return {
            user: {
              id: u.id,
              displayName,
              isAnonymous: false,
              email: u.email,
            },
          };
        }
      }
    }

    return { user: null, error: 'Google sign-in cancelled or pending' };
  } catch (err: any) {
    return { user: null, error: err.message || 'Google sign-in failed' };
  }
}

/**
 * Sign out the current user and reset onboarding status.
 */
export async function signOutUser(): Promise<void> {
  try {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  } catch (_) {}

  storage.delete(ANONYMOUS_USER_KEY);
  storage.delete(DISPLAY_NAME_KEY);
  storage.delete(USER_EMAIL_KEY);
  storage.set(ONBOARDED_KEY, false);
}

/**
 * Gets currently cached user profile.
 */
export function getCachedUserProfile(): AuthUserProfile {
  const id = storage.getString(ANONYMOUS_USER_KEY) || 'anonymous';
  const displayName = storage.getString(DISPLAY_NAME_KEY) || 'Believer';
  const email = storage.getString(USER_EMAIL_KEY);
  return {
    id,
    displayName,
    isAnonymous: !email,
    email,
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
