import { useCallback, useRef, useState } from 'react';
import { chatApi, conversationsApi } from '@/api';
import { getDeviceId } from '@/context/storage';
import { isApiConfigured } from '@/config/env';
import type { ChatMessage } from '@/types';

/**
 * Chat hook — owns the message list, sends turns to /api/chat, parses the
 * streamed reply, and best-effort saves the conversation to /api/conversations.
 * Mirrors the responsibilities of the web `chat-tab.tsx` (minus the prompt
 * library UI).
 */

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export type ChatStatus = 'idle' | 'submitted' | 'streaming' | 'error';

export function useChatSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const conversationId = useRef<number | string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback((msgs: ChatMessage[]) => {
    if (!isApiConfigured || msgs.length === 0) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        const deviceId = await getDeviceId();
        const title = msgs[0]?.parts?.[0]?.text?.slice(0, 50) || 'New conversation';
        const preview = msgs[msgs.length - 1]?.parts?.[0]?.text?.slice(0, 100) || '';
        const res = await conversationsApi.saveConversation({
          deviceId,
          title,
          preview,
          messages: msgs,
        });
        if (res.id && conversationId.current == null) {
          conversationId.current = res.id;
        }
      } catch {
        /* best effort */
      }
    }, 1000);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status === 'streaming' || status === 'submitted') return;
      setError(null);

      const userMsg: ChatMessage = {
        id: nextId('user'),
        role: 'user',
        parts: [{ type: 'text', text: trimmed }],
      };
      const assistantId = nextId('assistant');
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        parts: [{ type: 'text', text: '' }],
      };

      const history = [...messages, userMsg];
      setMessages([...history, assistantMsg]);
      setStatus('submitted');

      try {
        const full = await chatApi.sendChat({
          messages: history,
          conversationId: conversationId.current == null ? undefined : String(conversationId.current),
          onDelta: (cumulative) => {
            setStatus('streaming');
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, parts: [{ type: 'text', text: cumulative }] }
                  : m,
              ),
            );
          },
        });

        const finalMsgs: ChatMessage[] = [
          ...history,
          { id: assistantId, role: 'assistant', parts: [{ type: 'text', text: full }] },
        ];
        setMessages(finalMsgs);
        setStatus('idle');
        scheduleSave(finalMsgs);
      } catch (e) {
        setStatus('error');
        setError((e as Error).message || 'Something went wrong. Please try again.');
        // Drop the empty assistant placeholder on error.
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    },
    [messages, status, scheduleSave],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setStatus('idle');
    setError(null);
    conversationId.current = null;
  }, []);

  return { messages, status, error, send, reset };
}
