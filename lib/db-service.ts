/**
 * Database Service Layer
 *
 * This service manages all user data persistence.
 * Currently uses localStorage for preview/testing.
 *
 * TODO: Replace localStorage calls with Neon Postgres queries
 * using the @neondatabase/serverless package.
 *
 * Database Schema (Neon Postgres):
 *
 * CREATE TABLE boomer_users (
 *   id SERIAL PRIMARY KEY,
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   name VARCHAR(255),
 *   password_hash VARCHAR(255),
 *   profile_photo_url TEXT,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 *
 * CREATE TABLE boomer_gamification (
 *   id SERIAL PRIMARY KEY,
 *   email VARCHAR(255) NOT NULL REFERENCES boomer_users(email) ON DELETE CASCADE,
 *   stars INTEGER DEFAULT 0,
 *   completed_lessons TEXT[] DEFAULT '{}',
 *   unlocked_badges TEXT[] DEFAULT '{}',
 *   streak INTEGER DEFAULT 0,
 *   level VARCHAR(50) DEFAULT 'Basic',
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 *
 * CREATE TABLE boomer_chats (
 *   id SERIAL PRIMARY KEY,
 *   email VARCHAR(255) NOT NULL REFERENCES boomer_users(email) ON DELETE CASCADE,
 *   user_prompt TEXT NOT NULL,
 *   ai_response TEXT NOT NULL,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 *
 * CREATE TABLE boomer_gallery (
 *   id SERIAL PRIMARY KEY,
 *   email VARCHAR(255) NOT NULL REFERENCES boomer_users(email) ON DELETE CASCADE,
 *   image_url TEXT NOT NULL,
 *   prompt TEXT NOT NULL,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 */

// Types
export interface UserProfileData {
  email: string
  name: string
  profilePhotoUrl: string | null
}

export interface GamificationData {
  currentStars: number
  completedLessons: string[]
  unlockedBadges: string[]
  streak: number
  level: string
}

export interface ChatMessage {
  id: string
  userPrompt: string
  aiResponse: string
  createdAt: string
}

export interface GalleryImage {
  id: string
  imageUrl: string
  prompt: string
  createdAt: string
}

export interface FullUserData {
  profile: UserProfileData
  gamification: GamificationData
  chatHistory: ChatMessage[]
  gallery: GalleryImage[]
}

const STORAGE_KEYS = {
  PROFILE: (email: string) => `boomer_profile_${email}`,
  GAMIFICATION: (email: string) => `boomer_gamification_${email}`,
  CHATS: (email: string) => `boomer_chats_${email}`,
  GALLERY: (email: string) => `boomer_gallery_${email}`,
}

/**
 * Get user profile by email
 *
 * TODO: Replace with Neon query:
 * const sql = neon(process.env.DATABASE_URL);
 * const result = await sql`SELECT * FROM boomer_users WHERE email = ${email}`;
 * return result[0] || null;
 */
export async function getUserProfile(email: string): Promise<UserProfileData | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (typeof window === "undefined") return null

  const data = localStorage.getItem(STORAGE_KEYS.PROFILE(email))
  if (!data) return null

  return JSON.parse(data) as UserProfileData
}

/**
 * Save/Update user profile
 *
 * TODO: Replace with Neon query:
 * const sql = neon(process.env.DATABASE_URL);
 * await sql`
 *   INSERT INTO boomer_users (email, name, profile_photo_url, updated_at)
 *   VALUES (${profile.email}, ${profile.name}, ${profile.profilePhotoUrl}, NOW())
 *   ON CONFLICT (email) DO UPDATE SET
 *     name = ${profile.name},
 *     profile_photo_url = ${profile.profilePhotoUrl},
 *     updated_at = NOW()
 * `;
 */
export async function saveUserProfile(profile: UserProfileData): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (typeof window === "undefined") return

  localStorage.setItem(STORAGE_KEYS.PROFILE(profile.email), JSON.stringify(profile))
}

/**
 * Get gamification data for user
 *
 * TODO: Replace with Neon query:
 * const sql = neon(process.env.DATABASE_URL);
 * const result = await sql`SELECT * FROM boomer_gamification WHERE email = ${email}`;
 * return result[0] || null;
 */
export async function getGamification(email: string): Promise<GamificationData | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (typeof window === "undefined") return null

  const data = localStorage.getItem(STORAGE_KEYS.GAMIFICATION(email))
  if (!data) {
    // Return default gamification data
    return {
      currentStars: 0,
      completedLessons: [],
      unlockedBadges: [],
      streak: 0,
      level: "Basic",
    }
  }

  return JSON.parse(data) as GamificationData
}

/**
 * Update stars count
 *
 * TODO: Replace with Neon query:
 * const sql = neon(process.env.DATABASE_URL);
 * await sql`
 *   UPDATE boomer_gamification
 *   SET stars = ${newCount}, level = ${level}, updated_at = NOW()
 *   WHERE email = ${email}
 * `;
 */
export async function updateStars(email: string, newCount: number, level: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  if (typeof window === "undefined") return

  const current = await getGamification(email)
  const updated: GamificationData = {
    ...current!,
    currentStars: newCount,
    level,
  }

  localStorage.setItem(STORAGE_KEYS.GAMIFICATION(email), JSON.stringify(updated))
}

/**
 * Save full gamification data
 *
 * TODO: Replace with Neon query:
 * const sql = neon(process.env.DATABASE_URL);
 * await sql`
 *   INSERT INTO boomer_gamification (email, stars, completed_lessons, unlocked_badges, streak, level, updated_at)
 *   VALUES (${email}, ${data.currentStars}, ${data.completedLessons}, ${data.unlockedBadges}, ${data.streak}, ${data.level}, NOW())
 *   ON CONFLICT (email) DO UPDATE SET
 *     stars = ${data.currentStars},
 *     completed_lessons = ${data.completedLessons},
 *     unlocked_badges = ${data.unlockedBadges},
 *     streak = ${data.streak},
 *     level = ${data.level},
 *     updated_at = NOW()
 * `;
 */
export async function saveGamification(email: string, data: GamificationData): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (typeof window === "undefined") return

  localStorage.setItem(STORAGE_KEYS.GAMIFICATION(email), JSON.stringify(data))
}

/**
 * Get chat history for user
 *
 * TODO: Replace with Neon query:
 * const sql = neon(process.env.DATABASE_URL);
 * const result = await sql`
 *   SELECT id, user_prompt, ai_response, created_at
 *   FROM boomer_chats
 *   WHERE email = ${email}
 *   ORDER BY created_at DESC
 *   LIMIT 100
 * `;
 * return result;
 */
export async function getChatHistory(email: string): Promise<ChatMessage[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (typeof window === "undefined") return []

  const data = localStorage.getItem(STORAGE_KEYS.CHATS(email))
  if (!data) return []

  return JSON.parse(data) as ChatMessage[]
}

/**
 * Save a chat message
 *
 * TODO: Replace with Neon query:
 * const sql = neon(process.env.DATABASE_URL);
 * await sql`
 *   INSERT INTO boomer_chats (email, user_prompt, ai_response, created_at)
 *   VALUES (${email}, ${message.userPrompt}, ${message.aiResponse}, NOW())
 * `;
 */
export async function saveChat(email: string, userPrompt: string, aiResponse: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (typeof window === "undefined") return

  const history = await getChatHistory(email)
  const newMessage: ChatMessage = {
    id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userPrompt,
    aiResponse,
    createdAt: new Date().toISOString(),
  }

  history.unshift(newMessage) // Add to beginning

  // Keep only last 100 messages
  const trimmed = history.slice(0, 100)
  localStorage.setItem(STORAGE_KEYS.CHATS(email), JSON.stringify(trimmed))
}

/**
 * Get gallery images for user
 *
 * TODO: Replace with Neon query:
 * const sql = neon(process.env.DATABASE_URL);
 * const result = await sql`
 *   SELECT id, image_url, prompt, created_at
 *   FROM boomer_gallery
 *   WHERE email = ${email}
 *   ORDER BY created_at DESC
 * `;
 * return result;
 */
export async function getGallery(email: string): Promise<GalleryImage[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (typeof window === "undefined") return []

  const data = localStorage.getItem(STORAGE_KEYS.GALLERY(email))
  if (!data) return []

  return JSON.parse(data) as GalleryImage[]
}

/**
 * Save an image to gallery
 *
 * TODO: Replace with Neon query:
 * const sql = neon(process.env.DATABASE_URL);
 * await sql`
 *   INSERT INTO boomer_gallery (email, image_url, prompt, created_at)
 *   VALUES (${email}, ${imageUrl}, ${prompt}, NOW())
 * `;
 */
export async function saveImage(email: string, imageUrl: string, prompt: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (typeof window === "undefined") return

  const gallery = await getGallery(email)
  const newImage: GalleryImage = {
    id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    imageUrl,
    prompt,
    createdAt: new Date().toISOString(),
  }

  gallery.unshift(newImage) // Add to beginning
  localStorage.setItem(STORAGE_KEYS.GALLERY(email), JSON.stringify(gallery))
}

/**
 * Delete image from gallery
 *
 * TODO: Replace with Neon query:
 * const sql = neon(process.env.DATABASE_URL);
 * await sql`DELETE FROM boomer_gallery WHERE id = ${imageId} AND email = ${email}`;
 */
export async function deleteImage(email: string, imageId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  if (typeof window === "undefined") return

  const gallery = await getGallery(email)
  const filtered = gallery.filter((img) => img.id !== imageId)
  localStorage.setItem(STORAGE_KEYS.GALLERY(email), JSON.stringify(filtered))
}

/**
 * Get all user data at once (for initial load)
 *
 * TODO: Replace with Neon transaction for efficiency:
 * const sql = neon(process.env.DATABASE_URL);
 * const [profile, gamification, chats, gallery] = await Promise.all([
 *   sql`SELECT * FROM boomer_users WHERE email = ${email}`,
 *   sql`SELECT * FROM boomer_gamification WHERE email = ${email}`,
 *   sql`SELECT * FROM boomer_chats WHERE email = ${email} ORDER BY created_at DESC LIMIT 100`,
 *   sql`SELECT * FROM boomer_gallery WHERE email = ${email} ORDER BY created_at DESC`
 * ]);
 */
export async function getAllUserData(email: string): Promise<FullUserData | null> {
  const [profile, gamification, chatHistory, gallery] = await Promise.all([
    getUserProfile(email),
    getGamification(email),
    getChatHistory(email),
    getGallery(email),
  ])

  if (!profile) return null

  return {
    profile,
    gamification: gamification || {
      currentStars: 0,
      completedLessons: [],
      unlockedBadges: [],
      streak: 0,
      level: "Basic",
    },
    chatHistory,
    gallery,
  }
}

/**
 * Delete all user data (for account deletion)
 *
 * TODO: Replace with Neon cascade delete:
 * const sql = neon(process.env.DATABASE_URL);
 * await sql`DELETE FROM boomer_users WHERE email = ${email}`;
 * (The ON DELETE CASCADE will handle related tables)
 */
export async function deleteAllUserData(email: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (typeof window === "undefined") return

  localStorage.removeItem(STORAGE_KEYS.PROFILE(email))
  localStorage.removeItem(STORAGE_KEYS.GAMIFICATION(email))
  localStorage.removeItem(STORAGE_KEYS.CHATS(email))
  localStorage.removeItem(STORAGE_KEYS.GALLERY(email))
}
