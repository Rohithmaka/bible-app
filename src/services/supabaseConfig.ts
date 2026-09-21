import { createClient } from '@supabase/supabase-js';
import { storage } from '../storage/storage';

// Replace with your actual Supabase URL and Anon Key from your Supabase Dashboard
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const isSupabaseConfigured = (): boolean => {
  return (
    !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
    !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('your-project') &&
    !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.includes('your-supabase-anon-key') &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key'
  );
};

// MMKV Custom Adapter for Supabase Session Persistence
const CustomMmkvStorageAdapter = {
  getItem: (key: string) => {
    return storage.getString(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: CustomMmkvStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
