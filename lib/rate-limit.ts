/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * NOTE: This is per-process. On serverless (Vercel) each instance has its own
 * map, so this provides best-effort abuse mitigation, not a hard global limit.
 * For strict global limits use a shared store (e.g. Upstash Redis / Vercel KV).
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { ok: true, remaining: limit - 1, resetAt }
  }

  existing.count += 1
  const ok = existing.count <= limit
  return { ok, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt }
}

export function clientKey(request: Request, scope: string): string {
  const fwd = request.headers.get("x-forwarded-for")
  const ip = (fwd ? fwd.split(",")[0].trim() : null) || request.headers.get("x-real-ip") || "unknown"
  return `${scope}:${ip}`
}

/** Build a 429 Response with Retry-After. */
export function tooManyRequests(resetAt: number): Response {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
  return new Response(JSON.stringify({ error: "Too many requests. Please slow down and try again shortly." }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfter),
    },
  })
}
