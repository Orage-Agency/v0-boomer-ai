import { apiFetchRaw } from './client';
import { env } from '@/config/env';
import type { ChatMessage } from '@/types';

/**
 * Chat API. Matches app/api/chat/route.ts.
 *
 * The backend uses the Vercel AI SDK and returns a "UI message stream"
 * (Server-Sent-Events-style) via `result.toUIMessageStreamResponse()`.
 * On the web, `@ai-sdk/react`'s `useChat` consumes this automatically. On
 * native we parse it ourselves.
 *
 * The stream emits lines like:
 *   data: {"type":"text-delta","delta":"Hello"}
 *   data: {"type":"text-delta","delta":" there"}
 *   data: [DONE]
 *
 * We accumulate `text-delta` deltas (and tolerate the older `text` field) and
 * surface them through an `onDelta` callback for live streaming UI.
 *
 * NOTE: React Native's fetch does not expose a `ReadableStream` body reader in
 * all engines. We therefore read the full response text and parse it. This
 * yields the complete answer reliably; for token-by-token streaming on device,
 * see TODO below.
 *
 * TODO(parity): For true incremental streaming on device, add
 * `react-native-fetch-api` / `expo/fetch` streaming or switch the backend to a
 * plain text endpoint. The current approach delivers the full message at once.
 */

const MODEL = 'openai/gpt-4o-mini';

export type SendChatOptions = {
  messages: ChatMessage[];
  capturedImage?: string;
  conversationId?: string | null;
  /** Called with the cumulative text as it is parsed. */
  onDelta?: (cumulativeText: string) => void;
  signal?: AbortSignal;
};

function toBackendMessages(messages: ChatMessage[]) {
  // The backend accepts UIMessage[]; sending role + parts is compatible with
  // convertToModelMessages on the server.
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    parts: m.parts,
  }));
}

function extractDelta(obj: Record<string, unknown>): string {
  if (typeof obj.delta === 'string') return obj.delta;
  if (typeof obj.textDelta === 'string') return obj.textDelta;
  if (obj.type === 'text' && typeof obj.text === 'string') return obj.text;
  return '';
}

/** Parse one SSE data payload string into appended text. */
function parsePayload(payload: string): string {
  const trimmed = payload.trim();
  if (!trimmed || trimmed === '[DONE]') return '';
  try {
    const obj = JSON.parse(trimmed) as Record<string, unknown>;
    return extractDelta(obj);
  } catch {
    // Some chunks may be plain text; append as-is.
    return trimmed;
  }
}

/**
 * Send a chat turn and return the assistant's full reply text.
 * Calls `onDelta` with cumulative text as chunks are parsed.
 */
export async function sendChat(opts: SendChatOptions): Promise<string> {
  const res = await apiFetchRaw('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      messages: toBackendMessages(opts.messages),
      model: MODEL,
      capturedImage: opts.capturedImage,
      conversationId: opts.conversationId ?? undefined,
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    let message = `Chat failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const raw = await res.text();
  let cumulative = '';

  // Handle both SSE ("data: ...") framing and raw concatenated lines.
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const payload = line.startsWith('data:') ? line.slice(5) : line;
    const piece = parsePayload(payload);
    if (piece) {
      cumulative += piece;
      opts.onDelta?.(cumulative);
    }
  }

  // Fallback: if nothing parsed (unexpected format), surface the raw text.
  if (!cumulative && raw.trim()) {
    cumulative = raw.trim();
    opts.onDelta?.(cumulative);
  }

  return cumulative;
}

export const CHAT_MODEL = MODEL;
export const CHAT_API_ORIGIN = env.apiBaseUrl;
