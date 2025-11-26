/**
 * Authentication Service Layer
 *
 * This service connects to the Neon Postgres database via API routes
 * for user authentication, signup, and profile management.
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

/**
 * Create a new user account via API
 */
export async function createUser(email: string, password: string, name: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })

    const result = await response.json()

    if (result.success && result.user) {
      // Save session locally
      saveSession({ email: result.user.email, name: result.user.name, userId: result.user.id })
    }

    return result
  } catch (error) {
    console.error("Create user error:", error)
    return { success: false, error: "Network error. Please try again." }
  }
}

/**
 * Authenticate a user via API
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()

    if (result.success && result.user) {
      // Save session locally
      saveSession({ email: result.user.email, name: result.user.name, userId: result.user.id })
    }

    return result
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Network error. Please try again." }
  }
}

/**
 * Update user stars via API
 */
export async function updateUserStars(email: string, stars: number, level: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/update-stars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, stars, level }),
    })

    return await response.json()
  } catch (error) {
    console.error("Update stars error:", error)
    return { success: false, error: "Failed to update stars" }
  }
}

/**
 * Get user by email via API
 */
export async function getUserByEmail(email: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "" }), // Will fail but we can check if user exists
    })

    return await response.json()
  } catch (error) {
    return { success: false, error: "User not found" }
  }
}

/**
 * Delete user account via API
 */
export async function deleteUser(email: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch("/api/auth/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
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

/**
 * Session Management (localStorage for client-side session tracking)
 */
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

/**
 * Check if user is logged in (has valid session)
 */
export function isLoggedIn(): boolean {
  return getSession() !== null
}
