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
    let mmkvInstance: any = null;

    if (typeof MMKVModule.createMMKV === 'function') {
      mmkvInstance = MMKVModule.createMMKV({ id: 'sela-persistent-storage' });
    } else if (typeof MMKVModule.MMKV === 'function') {
      mmkvInstance = new MMKVModule.MMKV();
    } else if (typeof MMKVModule.default === 'function') {
      mmkvInstance = new MMKVModule.default();
    }

    if (mmkvInstance) {
      return {
        getString: (key: string) => {
          try {
            const val = mmkvInstance.getString(key);
            if (val !== undefined && val !== null) {
              memoryStore.set(key, val);
              return val;
            }
            return memoryStore.get(key);
          } catch (err) {
            console.warn(`[Storage] MMKV getString error for key "${key}":`, err);
            return memoryStore.get(key);
          }
        },
        set: (key: string, value: string) => {
          memoryStore.set(key, value);
          try {
            mmkvInstance.set(key, value);
          } catch (err) {
            console.warn(`[Storage] MMKV set error for key "${key}":`, err);
          }
        },
        delete: (key: string) => {
          memoryStore.delete(key);
          try {
            if (typeof mmkvInstance.remove === 'function') {
              mmkvInstance.remove(key);
            } else if (typeof mmkvInstance.delete === 'function') {
              mmkvInstance.delete(key);
            }
          } catch (err) {
            console.warn(`[Storage] MMKV delete error for key "${key}":`, err);
          }
        },
        clearAll: () => {
          memoryStore.clear();
          try {
            mmkvInstance.clearAll();
          } catch (err) {
            console.warn('[Storage] MMKV clearAll error:', err);
          }
        }
      };
    }
  } catch (e) {
    console.warn('[Storage] MMKV initialization error, using memory store:', e);
  }

  return inMemoryStorage;
}

export const storage = createStorage();

