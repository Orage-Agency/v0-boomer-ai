import { apiPost } from './client';

/**
 * Auth + entitlement endpoints. Mirror the contracts in
 * v0-boomer-ai/app/api/{auth,redeem}/route.ts.
 */

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

export async function login(email: string, password: string): Promise<AccountUser> {
  const res = await apiPost<{ success: boolean; user: AccountUser; error?: string }>(
    '/api/auth/login',
    { email, password },
  );
  if (!res.success) throw new Error(res.error ?? 'Login failed');
  return res.user;
}

export async function signup(
  email: string,
  password: string,
  name: string,
): Promise<AccountUser> {
  const res = await apiPost<{ success: boolean; user: AccountUser; error?: string }>(
    '/api/auth/signup',
    { email, password, name },
  );
  if (!res.success) throw new Error(res.error ?? 'Signup failed');
  // /signup currently returns the new user without isPro fields; coerce.
  return { ...res.user, isPro: false, proSource: null, proExpiresAt: null };
}

export async function refreshMe(email: string, password: string): Promise<AccountUser> {
  const res = await apiPost<{ success: boolean; user: AccountUser; error?: string }>(
    '/api/auth/me',
    { email, password },
  );
  if (!res.success) throw new Error(res.error ?? 'Refresh failed');
  return res.user;
}

export async function redeemCode(
  email: string,
  password: string,
  code: string,
): Promise<AccountUser> {
  const res = await apiPost<{
    success: boolean;
    alreadyRedeemed?: boolean;
    user: AccountUser;
    error?: string;
  }>('/api/redeem', { email, password, code });
  if (!res.success) throw new Error(res.error ?? 'Redeem failed');
  return res.user;
}
