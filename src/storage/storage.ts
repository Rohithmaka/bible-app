import { Platform } from 'react-native';

interface StorageInterface {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
  clearAll: () => void;
}

let storage: StorageInterface;

if (Platform.OS === 'web') {
  storage = {
    getString: (key: string) => {
      if (typeof window === 'undefined') return undefined;
      const val = window.localStorage.getItem(key);
      return val === null ? undefined : val;
    },
    set: (key: string, value: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    },
    delete: (key: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    },
    clearAll: () => {
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
      }
    }
  };
} else {
  // Use require here to prevent the bundler from initializing native JSI modules on web
  const { MMKV } = require('react-native-mmkv');
  const mmkv = new MMKV();
  storage = {
    getString: (key: string) => mmkv.getString(key),
    set: (key: string, value: string) => mmkv.set(key, value),
    delete: (key: string) => mmkv.delete(key),
    clearAll: () => mmkv.clearAll()
  };
}

export { storage };
