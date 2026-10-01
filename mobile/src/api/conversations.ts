import { apiDelete, apiGet, apiPost } from './client';
import { API_PATHS } from '@boomer-ai/shared';
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

function sessionHeaders(sessionToken?: string | null): HeadersInit {
  return sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {};
}

export function listConversations(deviceId: string, sessionToken?: string | null): Promise<ListResponse> {
  return apiGet<ListResponse>(
    `${API_PATHS.conversations}?deviceId=${encodeURIComponent(deviceId)}`,
    sessionHeaders(sessionToken),
  );
}

export function getConversation(
  id: number | string,
  deviceId: string,
  sessionToken?: string | null,
): Promise<ConversationRow> {
  return apiGet<ConversationRow>(
    `${API_PATHS.conversations}?id=${encodeURIComponent(String(id))}&deviceId=${encodeURIComponent(deviceId)}`,
    sessionHeaders(sessionToken),
  );
}

export function saveConversation(params: {
  deviceId: string;
  title: string;
  preview: string;
  messages: ChatMessage[];
}, sessionToken?: string | null): Promise<{ success: boolean; id: number }> {
  return apiPost(API_PATHS.conversations, params, sessionHeaders(sessionToken));
}

export function deleteConversation(
  id: number | string,
  deviceId: string,
  sessionToken?: string | null,
): Promise<{ success: boolean }> {
  return apiDelete(
    `${API_PATHS.conversations}?id=${encodeURIComponent(String(id))}&deviceId=${encodeURIComponent(deviceId)}`,
    sessionHeaders(sessionToken),
  );
}
