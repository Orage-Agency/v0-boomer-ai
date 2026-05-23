/**
 * Shared domain types for the Boomer AI mobile app.
 *
 * `UserProfile` mirrors the shape used by the web app (see
 * components: app/page.tsx `UserProfile`) so the same `/api/profile`
 * contract works unchanged. The web app stores the whole profile JSON
 * blob in the `profile_data` column keyed by `deviceId`.
 */

export type UserProfile = {
  persona: string | null;
  age: string | null;
  aiLevel: number;
  userTitle: string | null;
  avatarSrc: string | null;
  level: string | null;
  stars: number;
  streak: number;
  badges: string[];
  lessonsCompleted: string[];
  userName: string | null;
  name?: string;
  deviceId: string | null;
  dailyArtCount: number;
  lastArtDate: string | null;
  pinnedFeatures: string[];
  email: string | null;
  isLoggedIn: boolean;
};

export const DEFAULT_PROFILE: UserProfile = {
  persona: null,
  age: null,
  aiLevel: 0,
  userTitle: null,
  avatarSrc: null,
  level: null,
  stars: 0,
  streak: 0,
  badges: [],
  lessonsCompleted: [],
  userName: null,
  deviceId: null,
  dailyArtCount: 0,
  lastArtDate: null,
  pinnedFeatures: [],
  email: null,
  isLoggedIn: false,
};

// ---- Auth ----

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  stars: number;
  level: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResult = {
  success: boolean;
  user?: AuthUser;
  error?: string;
};

// ---- Chat ----

export type ChatRole = 'user' | 'assistant';

/**
 * Mirror of the Vercel AI SDK UI message shape. The backend `/api/chat`
 * returns a UI message stream; we keep `parts` to stay compatible with the
 * stored conversation format used by `/api/conversations`.
 */
export type ChatMessagePart = { type: 'text'; text: string };

export type ChatMessage = {
  id: string;
  role: ChatRole;
  parts: ChatMessagePart[];
};

export type ConversationSummary = {
  id: number | string;
  title: string;
  preview: string;
  timestamp: string;
  message_count: number;
};

// ---- Image generation ----

export type GenerateImageResult = {
  imageUrl?: string;
  error?: string;
  errorType?: string;
};
