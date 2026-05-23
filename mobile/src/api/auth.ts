import { apiPost } from './client';
import type { AuthResult } from '@/types';

/**
 * Auth API. Matches app/api/auth/{signup,login,update-stars,delete}/route.ts.
 *
 * SECURITY NOTE (carry-over from web app): the hosted backend currently stores
 * passwords in plaintext and compares them directly. That is being addressed
 * on the `harden/production-security` branch. The mobile client sends the
 * same fields the backend expects; no extra hashing is done here on purpose so
 * we stay compatible until the backend changes. Do NOT ship to stores before
 * the hardening lands. TODO(owner): re-verify these contracts after harden.
 */

export function signup(
  email: string,
  password: string,
  name: string,
): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/signup', { email, password, name });
}

export function login(email: string, password: string): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/login', { email, password });
}

export function updateStars(
  email: string,
  stars: number,
  level: string,
): Promise<AuthResult> {
  return apiPost<AuthResult>('/api/auth/update-stars', { email, stars, level });
}

export function deleteAccount(email: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>('/api/auth/delete', { email });
}
