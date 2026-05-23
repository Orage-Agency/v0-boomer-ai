import { apiDelete, apiGet, apiPost } from './client';
import type { ChatMessage, ConversationSummary } from '@/types';

/**
 * Conversations API. Matches app/api/conversations/route.ts.
 *
 * GET    /api/conversations?deviceId=...        -> { conversations: [...] }
 * GET    /api/conversations?id=...              -> single conversation row
 * POST   /api/conversations { deviceId, title, preview, messages } -> { id }
 * DELETE /api/conversations?id=...              -> { success }
 */

type ListResponse = { conversations: ConversationSummary[] };

type ConversationRow = {
  id: number | string;
  title: string;
  preview: string;
  messages: ChatMessage[];
  message_count: number;
};

export function listConversations(deviceId: string): Promise<ListResponse> {
  return apiGet<ListResponse>(
    `/api/conversations?deviceId=${encodeURIComponent(deviceId)}`,
  );
}

export function getConversation(
  id: number | string,
): Promise<ConversationRow> {
  return apiGet<ConversationRow>(
    `/api/conversations?id=${encodeURIComponent(String(id))}`,
  );
}

export function saveConversation(params: {
  deviceId: string;
  title: string;
  preview: string;
  messages: ChatMessage[];
}): Promise<{ success: boolean; id: number }> {
  return apiPost('/api/conversations', params);
}

export function deleteConversation(
  id: number | string,
): Promise<{ success: boolean }> {
  return apiDelete(`/api/conversations?id=${encodeURIComponent(String(id))}`);
}
