import { Platform } from 'react-native';

interface StorageInterface {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
  clearAll: () => void;
}

const memoryStore = new Map<string, string>();

const inMemoryStorage: StorageInterface = {
  getString: (key: string) => memoryStore.get(key),
  set: (key: string, value: string) => { memoryStore.set(key, value); },
  delete: (key: string) => { memoryStore.delete(key); },
  clearAll: () => { memoryStore.clear(); }
};

function createStorage(): StorageInterface {
  if (Platform.OS === 'web') {
    return {
      getString: (key: string) => {
        if (typeof window === 'undefined') return memoryStore.get(key);
        const val = window.localStorage.getItem(key);
        return val === null ? undefined : val;
      },
      set: (key: string, value: string) => {
        memoryStore.set(key, value);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      delete: (key: string) => {
        memoryStore.delete(key);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      },
      clearAll: () => {
        memoryStore.clear();
        if (typeof window !== 'undefined') {
          window.localStorage.clear();
        }
      }
    };
  }

  try {
    const MMKVModule = require('react-native-mmkv');
    const MMKVClass = MMKVModule?.MMKV || MMKVModule?.default || (typeof MMKVModule === 'function' ? MMKVModule : null);
    if (typeof MMKVClass === 'function') {
      const mmkv = new MMKVClass();
      return {
        getString: (key: string) => mmkv.getString(key),
        set: (key: string, value: string) => mmkv.set(key, value),
        delete: (key: string) => mmkv.delete(key),
        clearAll: () => mmkv.clearAll()
      };
    }
  } catch (e) {
    console.warn('MMKV initialization fallback to in-memory store:', e);
  }

  return inMemoryStorage;
}

export const storage = createStorage();

