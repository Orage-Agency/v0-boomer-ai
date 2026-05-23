import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys + helpers. Replaces the web app's localStorage usage with
 * AsyncStorage. Key names are kept descriptive (no need to match web keys
 * since native storage is separate from the browser).
 */

const KEYS = {
  deviceId: 'boomer-device-id',
  session: 'boomer_session',
  profile: (id: string) => `boomer_profile_${id}`,
} as const;

export type Session = { email: string; name: string };

function makeDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/** Get a stable per-install device id, creating one on first run. */
export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(KEYS.deviceId);
  if (!id) {
    id = makeDeviceId();
    await AsyncStorage.setItem(KEYS.deviceId, id);
  }
  return id;
}

export async function getSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(KEYS.session);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(KEYS.session, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.session);
}

export async function getCachedProfile<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(KEYS.profile(key));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCachedProfile(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(KEYS.profile(key), JSON.stringify(value));
}

export async function clearCachedProfile(key: string): Promise<void> {
  await AsyncStorage.removeItem(KEYS.profile(key));
}
