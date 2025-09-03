// src/lib/persistStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Zustand's StateStorage shape (what createJSONStorage expects)
type StateStorage = {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string) => void | Promise<void>;
  removeItem: (name: string) => void | Promise<void>;
};

function canUseMMKV(): boolean {
  // Expo Go can't load custom native modules
  const isExpoGo = Constants.appOwnership === "expo";
  if (isExpoGo) return false;

  // New Architecture (TurboModules) is required for MMKV 3.x
  // This is a decent runtime indicator in dev clients/EAS builds
  const hasTurbo = !!(global as any).__turboModuleProxy;

  // Also make sure require doesn't explode in JS
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("react-native-mmkv");
    return !!mod?.MMKV && hasTurbo;
  } catch {
    return false;
  }
}

export function createBestStorage(): StateStorage {
  if (canUseMMKV()) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require("react-native-mmkv");
    const mmkv = new MMKV();

    const storage: StateStorage = {
      getItem: (name) => mmkv.getString(name) ?? null,
      setItem: (name, value) => mmkv.set(name, value),
      removeItem: (name) => mmkv.delete(name),
    };
    return storage;
  }

  // Fallback that works inside Expo Go
  return {
    getItem: (name) => AsyncStorage.getItem(name),
    setItem: (name, value) => AsyncStorage.setItem(name, value),
    removeItem: (name) => AsyncStorage.removeItem(name),
  };
}

/**
 * Optional: one-time migration from AsyncStorage -> MMKV when you first
 * launch a New Arch/dev-client build. Call this *before* creating your store.
 */
export async function migrateIfNeeded(keyNames: string[]) {
  if (!canUseMMKV()) return;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require("react-native-mmkv");
  const mmkv = new MMKV();

  for (const key of keyNames) {
    if (mmkv.getString(key) != null) continue;
    const v = await AsyncStorage.getItem(key);
    if (v != null) {
      mmkv.set(key, v);
      await AsyncStorage.removeItem(key); // optional: clean up
    }
  }
}
