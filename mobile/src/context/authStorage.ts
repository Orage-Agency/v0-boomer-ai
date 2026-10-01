import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEY = 'boomer.auth.v1';

function sessionStorage(): Storage | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

async function readCurrent(): Promise<string | null> {
  if (Platform.OS === 'web') return sessionStorage()?.getItem(STORAGE_KEY) ?? null;
  return SecureStore.getItemAsync(STORAGE_KEY);
}

async function writeCurrent(value: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    const storage = sessionStorage();
    if (!storage) throw new Error('Session storage is unavailable.');
    if (value === null) storage.removeItem(STORAGE_KEY);
    else storage.setItem(STORAGE_KEY, value);
    return;
  }

  if (value === null) await SecureStore.deleteItemAsync(STORAGE_KEY);
  else await SecureStore.setItemAsync(STORAGE_KEY, value);
}

/**
 * Read revocable session data from Keychain/Keystore on native, or from the
 * current browser tab session on web. Legacy credentials are read only long
 * enough for AuthContext to exchange them for a session token.
 */
export async function readStoredAuth<T>(): Promise<T | null> {
  let serialized: string | null = null;
  try {
    serialized = await readCurrent();
    if (!serialized) {
      serialized = await AsyncStorage.getItem(STORAGE_KEY);
      if (serialized) await writeCurrent(serialized);
    }
  } finally {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  }

  if (!serialized) return null;
  try {
    return JSON.parse(serialized) as T;
  } catch {
    await writeCurrent(null).catch(() => undefined);
    return null;
  }
}

export async function writeStoredAuth(value: unknown | null): Promise<void> {
  if (value === null) {
    await writeCurrent(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }

  await writeCurrent(JSON.stringify(value));
  await AsyncStorage.removeItem(STORAGE_KEY);
}
