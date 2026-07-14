import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Free-tier caps used across the per-feature gates.
 *
 * Per-feature gates (J-BOOMER-FREETIER-GATES) follow the paywall brief:
 *   - 5 AI chat messages per day
 *   - 3 lessons (intro only); rest are locked behind the paywall
 *   - No voice chat / image generation for non-entitled users
 *
 * Entitled (Pro) users bypass all of this — the `useEntitlement()` hook is the
 * single source of truth and these constants are only read on the free path.
 */
export const FREE_FEATURES = {
  CHAT_DAILY_CAP: 5,
  FREE_LESSON_COUNT: 3,
} as const;

const STORAGE_PREFIX = 'boomer.freeTier.chat';

/** Local YYYY-MM-DD for AsyncStorage key (resets at local midnight). */
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function chatCounterStorageKey(date: string = todayKey()): string {
  return `${STORAGE_PREFIX}.${date}`;
}

/** How many free chat messages have been used today. */
export async function getChatUsedToday(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(chatCounterStorageKey(todayKey()));
    return raw ? Number.parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

/** Free chat messages remaining today (never negative). */
export async function getChatRemainingToday(): Promise<number> {
  const used = await getChatUsedToday();
  return Math.max(0, FREE_FEATURES.CHAT_DAILY_CAP - used);
}

/**
 * Consume one free chat message. Returns the remaining count AFTER consuming,
 * or null when the cap was already reached (nothing consumed).
 */
export async function consumeChatQuota(): Promise<number | null> {
  const key = chatCounterStorageKey(todayKey());
  const used = await getChatUsedToday();
  if (used >= FREE_FEATURES.CHAT_DAILY_CAP) return null;
  try {
    await AsyncStorage.setItem(key, String(used + 1));
  } catch {
    // Best-effort — allowing the send beats false-positive gating.
  }
  return FREE_FEATURES.CHAT_DAILY_CAP - (used + 1);
}

/** Give one message back (a send that failed shouldn't cost quota). */
export async function refundChatQuota(): Promise<void> {
  const key = chatCounterStorageKey(todayKey());
  const used = await getChatUsedToday();
  if (used <= 0) return;
  try {
    await AsyncStorage.setItem(key, String(used - 1));
  } catch {
    /* best effort */
  }
}
