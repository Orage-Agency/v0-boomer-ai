import { fetch as expoFetch } from 'expo/fetch';
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
 * STREAMING: we use `expo/fetch` (SDK 52+), whose response body is a real
 * `ReadableStream`, so deltas render token-by-token as they arrive — the
 * reply "types itself" instead of appearing all at once after a long wait.
 * If the stream reader is unavailable for any reason we fall back to reading
 * the full body, which still yields the complete answer.
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
  // convertToModelMessages on the server. Upsell cards are app furniture, not
  // conversation — keep them away from the model.
  return messages
    .filter((m) => !m.upsell)
    .map((m) => ({
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

/** Strip SSE framing from a single line and return appended text. */
function parseLine(line: string): string {
  const payload = line.startsWith('data:') ? line.slice(5) : line;
  return parsePayload(payload);
}

/**
 * Send a chat turn and return the assistant's full reply text.
 * Calls `onDelta` with cumulative text as chunks arrive from the stream.
 */
export async function sendChat(opts: SendChatOptions): Promise<string> {
  const base = env.apiBaseUrl.replace(/\/$/, '');

  // Inactivity watchdog: 30s to connect / first byte, 25s between chunks.
  // Without this a stalled connection left "Thinking…" on screen forever
  // with the input disabled.
  const controller = new AbortController();
  if (opts.signal) {
    opts.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  let watchdog: ReturnType<typeof setTimeout> | null = null;
  const armWatchdog = (ms: number) => {
    if (watchdog) clearTimeout(watchdog);
    watchdog = setTimeout(() => controller.abort(), ms);
  };
  const friendlyTimeout = () =>
    new Error('This is taking longer than usual. Please check your internet and try again.');

  armWatchdog(30_000);
  let res: Awaited<ReturnType<typeof expoFetch>>;
  try {
    res = await expoFetch(`${base}/api/chat`, {
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
      signal: controller.signal,
    });
  } catch (e) {
    if (watchdog) clearTimeout(watchdog);
    if (controller.signal.aborted && !opts.signal?.aborted) throw friendlyTimeout();
    throw e;
  }

  if (!res.ok) {
    if (watchdog) clearTimeout(watchdog);
    let message = `Chat failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  let cumulative = '';
  const reader = res.body?.getReader();

  if (reader) {
    // True incremental streaming: decode chunks, split into complete lines,
    // and keep the trailing partial line in the buffer for the next chunk.
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      armWatchdog(25_000);
      let done: boolean;
      let value: Uint8Array | undefined;
      try {
        ({ done, value } = await reader.read());
      } catch (e) {
        if (watchdog) clearTimeout(watchdog);
        if (controller.signal.aborted && !opts.signal?.aborted) throw friendlyTimeout();
        throw e;
      }
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';
      let appended = false;
      for (const line of lines) {
        const piece = parseLine(line);
        if (piece) {
          cumulative += piece;
          appended = true;
        }
      }
      if (appended) opts.onDelta?.(cumulative);
    }
    if (watchdog) clearTimeout(watchdog);
    // Flush whatever remains in the buffer.
    const tailPiece = parseLine(buffer);
    if (tailPiece) {
      cumulative += tailPiece;
      opts.onDelta?.(cumulative);
    }
  } else {
    // Fallback: no stream reader — read the whole body and parse at once.
    armWatchdog(60_000);
    let raw: string;
    try {
      raw = await res.text();
    } catch (e) {
      if (controller.signal.aborted && !opts.signal?.aborted) throw friendlyTimeout();
      throw e;
    } finally {
      if (watchdog) clearTimeout(watchdog);
    }
    for (const line of raw.split(/\r?\n/)) {
      const piece = parseLine(line);
      if (piece) {
        cumulative += piece;
        opts.onDelta?.(cumulative);
      }
    }
    if (!cumulative && raw.trim()) {
      cumulative = raw.trim();
      opts.onDelta?.(cumulative);
    }
  }

  return cumulative;
}

export const CHAT_MODEL = MODEL;
export const CHAT_API_ORIGIN = env.apiBaseUrl;
