import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatApi, conversationsApi } from '@/api';
import { getHistoryKey } from '@/context/storage';
import { isApiConfigured } from '@/config/env';
import type { ChatMessage } from '@/types';

/**
 * Chat hook — owns the message list, sends turns to /api/chat, parses the
 * streamed reply, and best-effort saves the conversation to /api/conversations.
 * Mirrors the responsibilities of the web `chat-tab.tsx` (minus the prompt
 * library UI).
 *
 * MEMORY: the current conversation is persisted to AsyncStorage after every
 * completed turn and restored when the app reopens, so closing the app never
 * loses the chat. Past conversations saved to the backend can be reloaded via
 * `loadById` (used by the History screen) and continued seamlessly — new turns
 * update the same conversation row.
 */

let idCounter = 0;
/** Unique message id — exported so screens can build local messages too. */
export function makeMessageId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}
const nextId = makeMessageId;

export type ChatStatus = 'idle' | 'submitted' | 'streaming' | 'error';

/** Where the in-progress conversation lives between app launches. */
const CURRENT_CHAT_KEY = 'boomer.chat.current';

type PersistedChat = {
  messages: ChatMessage[];
  conversationId: number | string | null;
};

export function useChatSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const conversationId = useRef<number | string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);
  // Bumped by reset(); an in-flight send that started under an older
  // generation must not write its result back (otherwise "New Chat" during
  // streaming resurrected the cleared conversation when the stream finished).
  const generation = useRef(0);

  // Restore the conversation that was on screen when the app last closed.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(CURRENT_CHAT_KEY);
        if (raw && !cancelled) {
          const saved = JSON.parse(raw) as PersistedChat;
          if (Array.isArray(saved.messages) && saved.messages.length > 0) {
            conversationId.current = saved.conversationId ?? null;
            setMessages(saved.messages);
          }
        }
      } catch {
        /* corrupted snapshot — start fresh */
      } finally {
        hydrated.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Persist the current conversation locally (called on completed turns). */
  const persist = useCallback((msgs: ChatMessage[]) => {
    if (!hydrated.current) return;
    const payload: PersistedChat = {
      messages: msgs,
      conversationId: conversationId.current,
    };
    if (msgs.length === 0) {
      void AsyncStorage.removeItem(CURRENT_CHAT_KEY).catch(() => undefined);
    } else {
      void AsyncStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(payload)).catch(
        () => undefined,
      );
    }
  }, []);

  const scheduleSave = useCallback((msgs: ChatMessage[]) => {
    if (!isApiConfigured || msgs.length === 0) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        const deviceId = await getHistoryKey();
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
          // Re-persist so the locally-stored chat carries its backend id.
          persist(msgs);
        }
      } catch {
        /* best effort */
      }
    }, 1000);
  }, [persist]);

  const send = useCallback(
    async (text: string, image?: { uri: string; dataUrl: string }): Promise<boolean> => {
      const trimmed = text.trim();
      if ((!trimmed && !image) || status === 'streaming' || status === 'submitted') return false;
      setError(null);
      const gen = generation.current;

      // With a photo but no text, give the model a gentle default prompt.
      const promptText = trimmed || (image ? 'Can you tell me about this picture?' : '');
      const userMsg: ChatMessage = {
        id: nextId('user'),
        role: 'user',
        parts: [{ type: 'text', text: promptText }],
        ...(image ? { imageUri: image.uri } : {}),
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
          capturedImage: image?.dataUrl,
          conversationId: conversationId.current == null ? undefined : String(conversationId.current),
          onDelta: (cumulative) => {
            if (generation.current !== gen) return;
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

        if (generation.current !== gen) return true;
        const finalMsgs: ChatMessage[] = [
          ...history,
          { id: assistantId, role: 'assistant', parts: [{ type: 'text', text: full }] },
        ];
        setMessages(finalMsgs);
        setStatus('idle');
        persist(finalMsgs);
        scheduleSave(finalMsgs);
        return true;
      } catch (e) {
        if (generation.current !== gen) return false;
        setStatus('error');
        setError((e as Error).message || 'Something went wrong. Please try again.');
        // Drop the empty assistant placeholder on error; keep the user's
        // message visible so "Try Again" has context.
        setMessages((prev) => {
          const kept = prev.filter((m) => m.id !== assistantId);
          persist(kept);
          return kept;
        });
        return false;
      }
    },
    [messages, status, scheduleSave, persist],
  );

  /**
   * Load a past conversation from the backend and make it the active chat.
   * New messages will continue (update) that same conversation.
   */
  const loadById = useCallback(async (id: number | string): Promise<boolean> => {
    try {
      const row = await conversationsApi.getConversation(id);
      const msgs = Array.isArray(row.messages) ? row.messages : [];
      if (msgs.length === 0) return false;
      generation.current += 1; // orphan any in-flight send
      conversationId.current = row.id;
      setMessages(msgs);
      setStatus('idle');
      setError(null);
      persist(msgs);
      return true;
    } catch {
      setError('Could not open that conversation. Please try again.');
      return false;
    }
  }, [persist]);

  const reset = useCallback(() => {
    generation.current += 1;
    setMessages([]);
    setStatus('idle');
    setError(null);
    conversationId.current = null;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    void AsyncStorage.removeItem(CURRENT_CHAT_KEY).catch(() => undefined);
  }, []);

  /**
   * Append locally-authored messages (inline image exchanges, upsell cards)
   * without going through /api/chat. Persists + backend-saves like a normal
   * turn so they survive restarts and appear in History.
   */
  const appendLocal = useCallback(
    (newMessages: ChatMessage[]) => {
      setMessages((prev) => {
        const next = [...prev, ...newMessages];
        persist(next);
        scheduleSave(next);
        return next;
      });
    },
    [persist, scheduleSave],
  );

  /** Replace a message in place (e.g. "painting…" placeholder → the image). */
  const updateMessage = useCallback(
    (id: string, next: ChatMessage) => {
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === id ? next : m));
        persist(updated);
        scheduleSave(updated);
        return updated;
      });
    },
    [persist, scheduleSave],
  );

  return { messages, status, error, send, reset, loadById, appendLocal, updateMessage };
}
