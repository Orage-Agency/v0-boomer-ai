import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys + helpers. Replaces the web app's localStorage usage with
 * AsyncStorage. Key names are kept descriptive (no need to match web keys
 * since native storage is separate from the browser).
 */

/** AsyncStorage key that stores the local bypass/promo-code Pro flag. */
export const BYPASS_PRO_KEY = 'boomer_pro_bypass';

const KEYS = {
  deviceId: 'boomer-device-id',
  profile: (id: string) => `boomer_profile_${id}`,
} as const;

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

/** Where AuthContext stores the signed-in account. */
const AUTH_KEY = 'boomer.auth.v1';

/**
 * Owner key for saved conversations.
 *
 * History used to be keyed on the device id alone — but that id is generated
 * per install, so deleting and reinstalling the app (or moving to a new phone)
 * silently orphaned every past conversation. When the user has a real account
 * we key on their email instead, which survives reinstalls. Signed-out users
 * still fall back to the device id, and `getHistoryKeys()` reads both so
 * nothing saved before signing in disappears from the list.
 */
export async function getHistoryKey(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (raw) {
      const email = (JSON.parse(raw) as { email?: string })?.email?.trim().toLowerCase();
      // Bypass/demo accounts share one synthetic email — never pool their
      // conversations together.
      if (email && email !== 'bypass@boomer.ai') return `user:${email}`;
    }
  } catch {
    /* unreadable auth blob — fall back to the device id */
  }
  return getDeviceId();
}

/** Every key this install's conversations may be stored under, newest first. */
export async function getHistoryKeys(): Promise<string[]> {
  const primary = await getHistoryKey();
  const device = await getDeviceId();
  return primary === device ? [device] : [primary, device];
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
