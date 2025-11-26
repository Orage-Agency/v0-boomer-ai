/**
 * Authentication Service Layer
 *
 * This service provides authentication functionality with a simulated
 * localStorage database. It is designed to be easily replaced with
 * a real Neon (Postgres) database.
 *
 * USER SCHEMA (for Neon migration):
 * ┌────────────────────────────────────────────────────────────────┐
 * │ TABLE: users                                                   │
 * ├────────────────────────────────────────────────────────────────┤
 * │ id            UUID PRIMARY KEY DEFAULT gen_random_uuid()       │
 * │ email         VARCHAR(255) UNIQUE NOT NULL                     │
 * │ password_hash VARCHAR(255) NOT NULL                            │
 * │ name          VARCHAR(255) NOT NULL                            │
 * │ stars         INTEGER DEFAULT 0                                │
 * │ level         VARCHAR(50) DEFAULT 'Basic'                      │
 * │ created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP              │
 * │ updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP              │
 * └────────────────────────────────────────────────────────────────┘
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

const STORAGE_KEY = "boomer_users_db"
const SESSION_KEY = "boomer_session"

// Simulated network delay for realistic UX
const simulateNetworkDelay = () => new Promise((resolve) => setTimeout(resolve, 800))

/**
 * Get all users from the simulated database
 * TODO: Replace this with Neon (Postgres) database call
 * Example: SELECT * FROM users;
 */
function getUsers(): Record<string, User & { password: string }> {
  if (typeof window === "undefined") return {}
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : {}
}

/**
 * Save users to the simulated database
 * TODO: Replace with Neon transaction
 */
function saveUsers(users: Record<string, User & { password: string }>): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

/**
 * Create a new user account
 * TODO: Replace this with Neon (Postgres) database call
 * Example: INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *;
 */
export async function createUser(email: string, password: string, name: string): Promise<AuthResult> {
  await simulateNetworkDelay()

  const users = getUsers()

  // Check if user already exists
  // TODO: Replace with: SELECT * FROM users WHERE email = $1;
  if (users[email]) {
    return { success: false, error: "An account with this email already exists" }
  }

  // Create new user
  // TODO: Replace with INSERT statement and proper password hashing (bcrypt)
  const newUser: User & { password: string } = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    password, // TODO: Use bcrypt.hash(password, 10) for production
    name,
    stars: 0,
    level: "Basic",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  users[email] = newUser
  saveUsers(users)

  // Create session
  saveSession({ email, name, userId: newUser.id })

  const { password: _, ...userWithoutPassword } = newUser
  return { success: true, user: userWithoutPassword }
}

/**
 * Authenticate a user
 * TODO: Replace this with Neon (Postgres) database call
 * Example: SELECT * FROM users WHERE email = $1;
 * Then: bcrypt.compare(password, user.password_hash)
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  await simulateNetworkDelay()

  const users = getUsers()

  // Find user by email
  // TODO: Replace with: SELECT * FROM users WHERE email = $1;
  const user = users[email]

  if (!user) {
    return { success: false, error: "No account found with this email" }
  }

  // Verify password
  // TODO: Replace with: bcrypt.compare(password, user.password_hash)
  if (user.password !== password) {
    return { success: false, error: "Incorrect password" }
  }

  // Create session
  saveSession({ email, name: user.name, userId: user.id })

  const { password: _, ...userWithoutPassword } = user
  return { success: true, user: userWithoutPassword }
}

/**
 * Update user stars
 * TODO: Replace this with Neon (Postgres) database call
 * Example: UPDATE users SET stars = $1, level = $2, updated_at = NOW() WHERE id = $3;
 */
export async function updateUserStars(email: string, stars: number, level: string): Promise<AuthResult> {
  const users = getUsers()
  const user = users[email]

  if (!user) {
    return { success: false, error: "User not found" }
  }

  // Update stars and level
  // TODO: Replace with UPDATE statement
  user.stars = stars
  user.level = level
  user.updatedAt = new Date().toISOString()

  users[email] = user
  saveUsers(users)

  const { password: _, ...userWithoutPassword } = user
  return { success: true, user: userWithoutPassword }
}

/**
 * Get user by email
 * TODO: Replace this with Neon (Postgres) database call
 * Example: SELECT * FROM users WHERE email = $1;
 */
export async function getUserByEmail(email: string): Promise<AuthResult> {
  const users = getUsers()
  const user = users[email]

  if (!user) {
    return { success: false, error: "User not found" }
  }

  const { password: _, ...userWithoutPassword } = user
  return { success: true, user: userWithoutPassword }
}

/**
 * Delete user account
 * TODO: Replace this with Neon (Postgres) database call
 * Example: DELETE FROM users WHERE email = $1;
 */
export async function deleteUser(email: string): Promise<{ success: boolean }> {
  await simulateNetworkDelay()

  const users = getUsers()

  // TODO: Replace with: DELETE FROM users WHERE email = $1;
  if (users[email]) {
    delete users[email]
    saveUsers(users)
    clearSession()
    return { success: true }
  }

  return { success: false }
}

/**
 * Session Management
 * TODO: Replace with JWT tokens stored in httpOnly cookies for production
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
