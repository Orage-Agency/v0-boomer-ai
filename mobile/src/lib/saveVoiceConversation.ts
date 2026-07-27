import { conversationsApi } from '@/api';
import { isApiConfigured } from '@/config/env';
import { getHistoryKey } from '@/context/storage';
import { makeMessageId } from '@/screens/useChat';
import type { ChatMessage } from '@/types';
import type { CallTurn } from '@/lib/summarizeCall';

/**
 * Store a finished voice call alongside typed chats, under the same per-person
 * key, so History shows everything Sarah and this person have talked about —
 * spoken or typed — and it survives moving to a new phone.
 *
 * Best-effort and fired after hang-up: losing a transcript must never surface
 * as an error at the end of a call.
 */
export async function saveVoiceConversation(turns: CallTurn[]): Promise<void> {
  if (!isApiConfigured) return;
  // A greeting and a goodbye is not a conversation worth keeping.
  const spoken = turns.filter((t) => t.text.trim());
  if (spoken.filter((t) => t.role === 'user').length < 2) return;

  const messages: ChatMessage[] = spoken.map((t) => ({
    id: makeMessageId(t.role === 'user' ? 'user' : 'assistant'),
    role: t.role === 'user' ? 'user' : 'assistant',
    parts: [{ type: 'text', text: t.text }],
  }));

  const firstUser = spoken.find((t) => t.role === 'user')?.text ?? 'Voice conversation';
  const last = spoken[spoken.length - 1]?.text ?? '';

  try {
    const ownerKey = await getHistoryKey();
    await conversationsApi.saveConversation({
      deviceId: ownerKey,
      // Marked so History can tell a spoken conversation from a typed one.
      title: `🎙️ ${firstUser.slice(0, 46)}`,
      preview: last.slice(0, 100),
      messages,
    });
  } catch {
    /* transcript is a nicety — never interrupt the end of a call */
  }
}
