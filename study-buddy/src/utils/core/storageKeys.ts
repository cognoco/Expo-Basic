import { z } from 'zod';
import { getStorageItem, setStorageItem, removeStorageItem } from '@utils/core/storage';

export const StorageKeys = {
  hasLaunched: 'hasLaunched',
  selectedAge: 'selectedAge',
  selectedBuddy: 'selectedBuddy',
  childName: 'childName',
  parentPin: 'parentPin',
  parentPinSetAt: 'parentPinSetAt',
  lastSessionLog: 'lastSessionLog',
  currentStreak: 'currentStreak',
  totalFocusTime: 'totalFocusTime',
  calmStreak: 'calmStreak',
  speechSettings: 'speechSettings',
  photoSettings: 'photoSettings',
  lastWorkPhoto: 'lastWorkPhoto',
  sessionsCount: 'sessionsCount',
  lastNotifAction: 'lastNotifAction',
  feedbackHistory: 'feedbackHistory',
  photoIndex: 'photoIndex',
} as const;

export type StorageKey = keyof typeof StorageKeys;

export async function getStringKey(key: StorageKey): Promise<string | null> {
  return getStorageItem(StorageKeys[key]);
}

export async function setStringKey(key: StorageKey, value: string): Promise<boolean> {
  return setStorageItem(StorageKeys[key], value);
}

export async function removeKey(key: StorageKey): Promise<boolean> {
  return removeStorageItem(StorageKeys[key]);
}

export async function getJson<T>(key: StorageKey, schema: z.ZodSchema<T>, fallback: T): Promise<T> {
  try {
    const raw = await getStorageItem(StorageKeys[key]);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (!result.success) return fallback;
    return result.data;
  } catch {
    return fallback;
  }
}

export async function setJson<T>(key: StorageKey, value: T): Promise<boolean> {
  try {
    return await setStorageItem(StorageKeys[key], JSON.stringify(value));
  } catch {
    return false;
  }
}
