/**
 * Client-side auth helpers.
 *
 * The authoritative session is a signed, httpOnly cookie set by the API routes
 * (see lib/session.ts). These helpers only call the API and keep a small,
 * NON-authoritative copy of display info (email/name) in localStorage for UI.
 */

export interface User {
  id: string
  email: string
  name: string
  stars: number
  level: string
  createdAt: string
  updatedAt: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

const SESSION_KEY = "boomer_session"

export async function createUser(email: string, password: string, name: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })

    const result = await response.json()

    if (result.success && result.user) {
      saveSession({ email: result.user.email, name: result.user.name, userId: result.user.id })
    }

    return result
  } catch (error) {
    console.error("Create user error:", error)
    return { success: false, error: "Network error. Please try again." }
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()

    if (result.success && result.user) {
      saveSession({ email: result.user.email, name: result.user.name, userId: result.user.id })
    }

    return result
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Network error. Please try again." }
  }
}

/** Update the signed-in user's stars. Identity is derived server-side from the session cookie. */
export async function updateUserStars(stars: number): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/update-stars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars }),
    })

    return await response.json()
  } catch (error) {
    console.error("Update stars error:", error)
    return { success: false, error: "Failed to update stars" }
  }
}

/** Delete the signed-in account. Identity is derived server-side from the session cookie. */
export async function deleteUser(): Promise<{ success: boolean }> {
  try {
    const response = await fetch("/api/auth/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    const result = await response.json()

    if (result.success) {
      clearSession()
    }

    return result
  } catch (error) {
    console.error("Delete user error:", error)
    return { success: false }
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" })
  } catch {
    // ignore network errors on logout
  }
  clearSession()
}

function saveSession(session: { email: string; name: string; userId: string }): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): { email: string; name: string; userId: string } | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(SESSION_KEY)
  return data ? JSON.parse(data) : null
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_KEY)
}

export function isLoggedIn(): boolean {
  return getSession() !== null
}
