import { env } from '@/config/env';

/**
 * Thin fetch wrapper around the hosted Next.js backend.
 *
 * The web app calls relative paths like `/api/profile`; the native app needs
 * an absolute origin, supplied by `env.apiBaseUrl`. All request/response
 * contracts here intentionally match the existing route handlers in
 * `app/api/*` so the hosted backend is reused as-is.
 *
 * Every JSON request carries a timeout (default 30s, image generation passes
 * 75s) so a stalled connection surfaces a clear, retryable error instead of
 * a spinner that never ends.
 */

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const DEFAULT_TIMEOUT_MS = 30_000;

function url(path: string): string {
  const base = env.apiBaseUrl.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // leave body as raw text
  }
  if (!res.ok) {
    const message =
      (body as { error?: string })?.error ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body);
  }
  return body as T;
}

/** fetch with an abort-based timeout; maps aborts to a friendly ApiError. */
async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (e) {
    if (controller.signal.aborted) {
      throw new ApiError(
        'This is taking longer than usual. Please check your internet and try again.',
        0,
        null,
      );
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiGet<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const res = await fetchWithTimeout(
    url(path),
    { method: 'GET', headers: { Accept: 'application/json' } },
    timeoutMs,
  );
  return parseJson<T>(res);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const res = await fetchWithTimeout(
    url(path),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    },
    timeoutMs,
  );
  return parseJson<T>(res);
}

export async function apiDelete<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const res = await fetchWithTimeout(url(path), { method: 'DELETE' }, timeoutMs);
  return parseJson<T>(res);
}

/** Raw fetch for streaming endpoints (chat). Caller handles the stream. */
export function apiFetchRaw(path: string, init: RequestInit): Promise<Response> {
  return fetch(url(path), init);
}
