import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

/**
 * Lazily create a Neon SQL client.
 *
 * IMPORTANT: This is called INSIDE request handlers (not at module top level)
 * so that `next build` does not require DATABASE_URL to be present, and a
 * missing env var fails gracefully at runtime with a clear error instead of
 * crashing the whole route module at import time.
 */
export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not configured")
  }
  return neon(url)
}
