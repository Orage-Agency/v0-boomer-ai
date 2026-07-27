import { apiGet, apiPost } from './client';

/**
 * Per-person storage for Sarah's memory. Matches app/api/sarah-memory/route.ts.
 *
 * `ownerKey` is the same key the conversations endpoint uses — the account
 * when signed in, the device id otherwise — so a signed-in user keeps the
 * same companion on a new phone.
 */

export type RemoteNote = { at: string; summary: string };

export type RemoteMemory = {
  notes: RemoteNote[];
  totalConversations: number;
};

export function getMemory(ownerKey: string): Promise<RemoteMemory> {
  return apiGet<RemoteMemory>(`/api/sarah-memory?ownerKey=${encodeURIComponent(ownerKey)}`);
}

export function putMemory(params: {
  ownerKey: string;
  notes: RemoteNote[];
  totalConversations: number;
}): Promise<{ success: boolean }> {
  return apiPost('/api/sarah-memory', params);
}
