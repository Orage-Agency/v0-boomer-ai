import { API_PATHS, type ProfileResponse } from '@boomer-ai/shared';
import { apiGet, apiPost } from './client';
import type { UserProfile } from '@/types';

export function getProfile(
  deviceId: string,
  sessionToken?: string | null,
): Promise<ProfileResponse> {
  const query = new URLSearchParams({ deviceId });
  const headers: HeadersInit = sessionToken
    ? { Authorization: `Bearer ${sessionToken}` }
    : {};
  return apiGet<ProfileResponse>(`${API_PATHS.profile}?${query.toString()}`, headers);
}

export function saveProfile(
  profile: UserProfile,
  sessionToken?: string | null,
): Promise<ProfileResponse> {
  const headers: HeadersInit = sessionToken
    ? { Authorization: `Bearer ${sessionToken}` }
    : {};
  return apiPost<ProfileResponse>(API_PATHS.profile, profile, headers);
}
