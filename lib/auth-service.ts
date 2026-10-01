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

/**
 * Create a new user account via API
 */
export async function createUser(email: string, password: string, name: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })

    const result = await response.json()

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
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json()

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
  void email
  try {
    const response = await fetch("/api/auth/update-stars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ stars, level }),
    })

    return await response.json()
  } catch (error) {
    console.error("Update stars error:", error)
    return { success: false, error: "Failed to update stars" }
  }
}

/**
 * Account lookup by email is intentionally unavailable without a session.
 */
export async function getUserByEmail(email: string): Promise<AuthResult> {
  void email
  return { success: false, error: "Sign in to access account details" }
}

/**
 * Delete user account via API
 */
export async function deleteUser(email: string): Promise<{ success: boolean }> {
  void email
  try {
    const response = await fetch("/api/auth/delete", {
      method: "POST",
      credentials: "same-origin",
    })

    const result = await response.json()

    return result
  } catch (error) {
    console.error("Delete user error:", error)
    return { success: false }
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  void fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })
}

/**
 * Check if user is logged in (has valid session)
 */
export async function isLoggedIn(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/me", { credentials: "same-origin" })
    return response.ok
  } catch {
    return false
  }
}
