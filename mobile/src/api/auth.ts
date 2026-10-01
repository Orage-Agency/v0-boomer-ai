import { API_PATHS } from '@boomer-ai/shared';
import { apiGet, apiPost } from './client';

export type AccountUser = {
  id: string;
  email: string;
  name: string;
  stars: number;
  level: string;
  isPro: boolean;
  proSource: string | null;
  proExpiresAt: string | null;
};

export type AuthSession = { user: AccountUser; sessionToken: string };

type AuthResponse = {
  success: boolean;
  user: AccountUser;
  sessionToken?: string;
  error?: string;
};

const mobileHeaders = { 'X-Boomer-Client': 'mobile' };

async function requireSession(response: Promise<AuthResponse>): Promise<AuthSession> {
  const result = await response;
  if (!result.success) throw new Error(result.error ?? 'Authentication failed');
  if (!result.sessionToken) throw new Error('The server did not return a secure session.');
  return { user: result.user, sessionToken: result.sessionToken };
}

export function login(email: string, password: string): Promise<AuthSession> {
  return requireSession(
    apiPost<AuthResponse>(API_PATHS.login, { email, password }, mobileHeaders),
  );
}

export function signup(
  email: string,
  password: string,
  name: string,
): Promise<AuthSession> {
  return requireSession(
    apiPost<AuthResponse>(API_PATHS.signup, { email, password, name }, mobileHeaders),
  );
}

export async function refreshMe(sessionToken: string): Promise<AccountUser> {
  const response = await apiGet<{ success: boolean; user: AccountUser; error?: string }>(
    API_PATHS.me,
    { Authorization: `Bearer ${sessionToken}` },
  );
  if (!response.success) throw new Error(response.error ?? 'Session refresh failed');
  return response.user;
}

export async function redeemCode(sessionToken: string, code: string): Promise<AccountUser> {
  const response = await apiPost<{
    success: boolean;
    user: AccountUser;
    error?: string;
  }>(
    API_PATHS.redeem,
    { code },
    { Authorization: `Bearer ${sessionToken}` },
  );
  if (!response.success) throw new Error(response.error ?? 'Code redemption failed');
  return response.user;
}

export async function logout(sessionToken: string): Promise<void> {
  await apiPost(
    API_PATHS.logout,
    {},
    { Authorization: `Bearer ${sessionToken}` },
  );
}
