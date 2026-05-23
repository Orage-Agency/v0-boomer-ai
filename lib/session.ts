import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

/**
 * Signed session handling.
 *
 * Sessions are stored in a signed, httpOnly cookie (JWT via `jose`).
 * Two kinds of subject can be present:
 *   - `userId`/`email` for authenticated account users
 *   - `deviceId` for the anonymous device-bound flow
 *
 * Authorization is ALWAYS derived from the session, never from client-supplied
 * email/device-id in the request body or query string.
 */

export const SESSION_COOKIE = "boomer_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export interface SessionPayload {
  userId?: string
  email?: string
  deviceId?: string
}

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET is not configured (must be a long random string)")
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as SessionPayload
  } catch {
    return null
  }
}

/** Read and verify the session from the request cookies. Returns null if absent/invalid. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return await verifySessionToken(token)
}

/** Set the session cookie (call from a Route Handler). */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

/** Clear the session cookie. */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/**
 * Ensure there is a device-bound session and return its deviceId.
 *
 * If an authenticated/device session already exists, its deviceId is reused
 * (or a new one minted if the session is account-only). This binds the
 * anonymous device flow to a server-issued cookie so that one caller cannot
 * read or mutate another device's data by guessing/supplying a device id.
 */
export async function ensureDeviceSession(): Promise<string> {
  const existing = await getSession()
  if (existing?.deviceId) return existing.deviceId

  const deviceId = `device_${Date.now()}_${crypto.randomUUID()}`
  await setSessionCookie({ ...existing, deviceId })
  return deviceId
}
