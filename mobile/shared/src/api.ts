/** Route contracts shared by the web and mobile API adapters. */
export const API_PATHS = {
  profile: '/api/profile',
  chat: '/api/chat',
  conversations: '/api/conversations',
  generateImage: '/api/generate-image',
  improvePrompt: '/api/improve-prompt',
  login: '/api/auth/login',
  signup: '/api/auth/signup',
  logout: '/api/auth/logout',
  me: '/api/auth/me',
  redeem: '/api/redeem',
} as const;

export type ApiFailure = {
  success?: false;
  error?: string;
  message?: string;
};

export type ProfileResponse = {
  success: boolean;
  profile?: import('./profile').UserProfile;
  deviceId?: string;
  error?: string;
};

export type ChatRequest = {
  messages: unknown[];
  model?: string;
  capturedImage?: string;
  conversationId?: string | null;
};

export type ImageRequest = { prompt: string };
export type ImprovePromptRequest = { prompt: string };
