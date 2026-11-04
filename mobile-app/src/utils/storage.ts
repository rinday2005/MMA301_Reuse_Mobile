/**
 * Cross-platform storage for React Native / Expo
 * Safely wraps AsyncStorage with an in-memory fallback cache
 * and provides a globalThis.localStorage polyfill so code ported from web works smoothly.
 */

let AsyncStorageModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  AsyncStorageModule = require('@react-native-async-storage/async-storage').default;
} catch {
  // Fallback to memory store if package is not yet linked
}

const memoryStore: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (AsyncStorageModule) {
      try {
        const val = await AsyncStorageModule.getItem(key);
        if (val !== null) memoryStore[key] = val;
        return val;
      } catch {
        return memoryStore[key] ?? null;
      }
    }
    return memoryStore[key] ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    memoryStore[key] = String(value);
    if (AsyncStorageModule) {
      try {
        await AsyncStorageModule.setItem(key, String(value));
      } catch {
        // ignore error
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    delete memoryStore[key];
    if (AsyncStorageModule) {
      try {
        await AsyncStorageModule.removeItem(key);
      } catch {
        // ignore error
      }
    }
  },

  async clear(): Promise<void> {
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
    if (AsyncStorageModule) {
      try {
        await AsyncStorageModule.clear();
      } catch {
        // ignore error
      }
    }
  },

  getSync(key: string): string | null {
    return memoryStore[key] ?? null;
  },

  setSync(key: string, value: string): void {
    memoryStore[key] = String(value);
    if (AsyncStorageModule) {
      AsyncStorageModule.setItem(key, String(value)).catch(() => {});
    }
  },

  removeSync(key: string): void {
    delete memoryStore[key];
    if (AsyncStorageModule) {
      AsyncStorageModule.removeItem(key).catch(() => {});
    }
  },

  getAllKeysSync(): string[] {
    return Object.keys(memoryStore);
  },
};

// Global polyfill for code expecting window.localStorage
if (typeof (globalThis as any).localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string): string | null => storage.getSync(key),
    setItem: (key: string, value: string): void => storage.setSync(key, value),
    removeItem: (key: string): void => storage.removeSync(key),
    clear: (): void => {
      Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
      if (AsyncStorageModule) {
        AsyncStorageModule.clear().catch(() => {});
      }
    },
    get length(): number {
      return Object.keys(memoryStore).length;
    },
    key: (index: number): string | null => {
      const keys = Object.keys(memoryStore);
      return keys[index] ?? null;
    },
  };
}

// Polyfill global and window as well to prevent ReferenceError in Hermes / strict mode
try {
  const g: any = typeof globalThis !== 'undefined' ? globalThis : {};
  if (typeof g.global !== 'undefined') {
    g.global.localStorage = g.localStorage;
  }
  if (typeof g.window !== 'undefined') {
    g.window.localStorage = g.localStorage;
  }
} catch {
  // Ignore in environments where global/window are read-only
}

export default storage;
