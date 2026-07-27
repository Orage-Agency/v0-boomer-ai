import { apiGet, apiPost } from '@/api/client';
import { isApiConfigured } from '@/config/env';
import { getHistoryKey } from '@/context/storage';

/**
 * Monthly voice allowance for this person.
 *
 * Voice is the most expensive thing in the app, so each account gets a fixed
 * number of minutes per calendar month. The allowance lives on the server (an
 * env var) rather than in the app, so it can be changed without shipping a
 * build — the client just renders whatever the API reports.
 *
 * Fails OPEN: if the check cannot complete we let the call proceed. A network
 * blip must not lock a paying user out, and every individual call is still
 * capped at 10 minutes by the agent itself, so the downside is bounded.
 */

export type VoiceQuota = {
  secondsUsed: number;
  limitSeconds: number;
  remainingSeconds: number;
  period: string;
};

const UNLIMITED: VoiceQuota = {
  secondsUsed: 0,
  limitSeconds: Number.MAX_SAFE_INTEGER,
  remainingSeconds: Number.MAX_SAFE_INTEGER,
  period: '',
};

export async function getVoiceQuota(): Promise<VoiceQuota> {
  if (!isApiConfigured) return UNLIMITED;
  try {
    const ownerKey = await getHistoryKey();
    return await apiGet<VoiceQuota>(
      `/api/voice-usage?ownerKey=${encodeURIComponent(ownerKey)}`,
    );
  } catch {
    return UNLIMITED;
  }
}

/** Record the length of a finished call. Best-effort. */
export async function recordVoiceUsage(seconds: number): Promise<void> {
  const whole = Math.round(seconds);
  if (!isApiConfigured || whole <= 0) return;
  try {
    const ownerKey = await getHistoryKey();
    await apiPost('/api/voice-usage', { ownerKey, seconds: whole });
  } catch {
    /* usage is best-effort — never surface at the end of a call */
  }
}

/** "10 minutes" / "3 minutes 20 seconds" — spoken the way a person would. */
export function formatAllowance(seconds: number): string {
  if (seconds >= Number.MAX_SAFE_INTEGER) return 'unlimited';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} second${s === 1 ? '' : 's'}`;
  if (s === 0) return `${m} minute${m === 1 ? '' : 's'}`;
  return `${m} minute${m === 1 ? '' : 's'} ${s} second${s === 1 ? '' : 's'}`;
}
