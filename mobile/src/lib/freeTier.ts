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
