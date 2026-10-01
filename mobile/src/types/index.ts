/** Shared product data types come from @boomer-ai/shared. */
export { DEFAULT_PROFILE } from '@boomer-ai/shared';
export type { UserProfile } from '@boomer-ai/shared';

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
