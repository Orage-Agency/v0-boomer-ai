/**
 * Single source of truth for offline access / bypass codes.
 *
 * These unlock Pro entirely on-device — no network, no email/password — for
 * VIPs, founders, friends & family, press, and in-person demo guests. Every
 * surface that accepts a code (the login modal, the paywall promo field, and
 * AuthContext.redeem) must agree on this list, so it lives here and nowhere
 * else. Adding a code in one place and forgetting another previously broke
 * redemption for those codes.
 */
export const BYPASS_CODES = [
  'BOOMERAI2026',
  'BOOMER-GEORGE-DEV', // unlimited — George's dev/test code
  'BOOMER-LAUNCH-001', // launch / press code
  'BOOMER-VIP-2026',
  'BOOMER-FOUNDER-2026',
  'BOOMER-FRIEND-2026',
  'BOOMER-GUEST-001',
  'BOOMER-GUEST-002',
  'BOOMER-GUEST-003',
] as const;

/** Normalize a user-entered code (trim + uppercase). */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/** True when the code is one of the offline bypass codes. */
export function isBypassCode(code: string): boolean {
  return (BYPASS_CODES as readonly string[]).includes(normalizeCode(code));
}
