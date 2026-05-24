import { apiGet, apiPost } from './client';
import type { UserProfile } from '@/types';

/**
 * Profile API. Matches app/api/profile/route.ts.
 *
 * GET  /api/profile?deviceId=...  -> { success, profile }
 * POST /api/profile  (body = full UserProfile JSON) -> { success, deviceId }
 *
 * The backend keys profiles by `deviceId` and stores the whole profile blob.
 * Device-only: no `email` is ever sent.
 */

type GetProfileResponse = {
  success: boolean;
  profile?: UserProfile;
  error?: string;
};

type SaveProfileResponse = {
  success: boolean;
  deviceId?: string;
  error?: string;
};

export function getProfile(deviceId: string): Promise<GetProfileResponse> {
  const q = new URLSearchParams({ deviceId });
  return apiGet<GetProfileResponse>(`/api/profile?${q.toString()}`);
}

export function saveProfile(profile: UserProfile): Promise<SaveProfileResponse> {
  return apiPost<SaveProfileResponse>('/api/profile', profile);
}
