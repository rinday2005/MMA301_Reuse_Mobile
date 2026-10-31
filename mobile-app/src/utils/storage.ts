/**
 * Cross-platform storage for React Native / Expo
 * Safely wraps AsyncStorage with an in-memory fallback cache
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
    memoryStore[key] = value;
    if (AsyncStorageModule) {
      try {
        await AsyncStorageModule.setItem(key, value);
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
    memoryStore[key] = value;
  },

  removeSync(key: string): void {
    delete memoryStore[key];
  },
};

export default storage;
