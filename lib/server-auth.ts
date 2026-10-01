import { createHash, randomBytes } from 'node:crypto';
import { sql } from '@/lib/neon-client';
export { hashPassword, verifyPassword } from '@/lib/passwords';
import { verifyPassword } from '@/lib/passwords';
const SESSION_COOKIE = 'boomer_auth';
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  stars: number;
  level: string;
  isPro: boolean;
  proSource: string | null;
  proExpiresAt: string | null;
};

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
  await sql`
    INSERT INTO boomer_auth_sessions (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${userId}, ${expiresAt})
  `;
  return { token, expiresAt };
}

export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const users = await sql`
    SELECT u.id, u.email, u.name, u.stars, u.level, u.is_pro, u.pro_source,
           u.pro_expires_at
    FROM boomer_auth_sessions s
    JOIN boomer_users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash}
      AND s.revoked_at IS NULL
      AND s.expires_at > NOW()
    LIMIT 1
  `;
  if (users.length === 0) return null;
  const row = users[0];
  const expired = row.pro_expires_at && new Date(row.pro_expires_at) < new Date();
  const isPro = Boolean(row.is_pro) && !expired;
  return {
    id: String(row.id),
    email: row.email,
    name: row.name,
    stars: row.stars ?? 0,
    level: row.level ?? 'Beginner',
    isPro,
    proSource: isPro ? row.pro_source : null,
    proExpiresAt: row.pro_expires_at ? new Date(row.pro_expires_at).toISOString() : null,
  };
}

export async function revokeSession(request: Request): Promise<void> {
  const token = getSessionToken(request);
  if (!token) return;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  await sql`
    UPDATE boomer_auth_sessions
    SET revoked_at = NOW()
    WHERE token_hash = ${tokenHash} AND revoked_at IS NULL
  `;
}

export function setSessionCookie(response: Response, token: string, expiresAt: Date): void {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`,
  );
}

export function clearSessionCookie(response: Response): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`,
  );
}

function getSessionToken(request: Request): string | null {
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) return authorization.slice(7).trim() || null;
  const cookieHeader = request.headers.get('cookie');
  const entry = cookieHeader?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return entry ? decodeURIComponent(entry.slice(SESSION_COOKIE.length + 1)) : null;
}
