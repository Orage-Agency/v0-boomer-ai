import { env } from '@/config/env';

/**
 * Thin fetch wrapper around the hosted Next.js backend.
 *
 * The web app calls relative paths like `/api/profile`; the native app needs
 * an absolute origin, supplied by `env.apiBaseUrl`. All request/response
 * contracts here intentionally match the existing route handlers in
 * `app/api/*` so the hosted backend is reused as-is.
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

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(url(path), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  return parseJson<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  return parseJson<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(url(path), { method: 'DELETE' });
  return parseJson<T>(res);
}

/** Raw fetch for streaming endpoints (chat). Caller handles the stream. */
export function apiFetchRaw(path: string, init: RequestInit): Promise<Response> {
  return fetch(url(path), init);
}
