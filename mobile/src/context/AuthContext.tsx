import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AccountUser,
  login as apiLogin,
  signup as apiSignup,
  redeemCode as apiRedeem,
  refreshMe as apiMe,
  logout as apiLogout,
} from '@/api/auth';
import { readStoredAuth, writeStoredAuth } from './authStorage';

const HARDCODED_BYPASS_CODES = new Set<string>([
  'BOOMERAI2026',
  'BOOMER-VIP-2026',
  'BOOMER-FOUNDER-2026',
  'BOOMER-FRIEND-2026',
  'BOOMER-GUEST-001',
  'BOOMER-GUEST-002',
  'BOOMER-GUEST-003',
]);

type StoredAuth = {
  email: string;
  user: AccountUser;
  sessionToken: string | null;
  /** Read once to migrate legacy installs, then discarded. */
  password?: string;
};

type AuthContextValue = {
  user: AccountUser | null;
  sessionToken: string | null;
  hydrated: boolean;
  signIn(email: string, password: string): Promise<AccountUser>;
  signUp(email: string, password: string, name: string): Promise<AccountUser>;
  redeem(code: string, email?: string, password?: string): Promise<AccountUser>;
  refresh(): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const persist = useCallback(async (next: StoredAuth | null) => {
    setAuth(next);
    await writeStoredAuth(next);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await readStoredAuth<StoredAuth>();
        if (!stored) return;

        const { password: legacyPassword, ...safeStored } = stored;
        let next = { ...safeStored, sessionToken: stored.sessionToken ?? null };
        if (!next.sessionToken && legacyPassword) {
          try {
            const migrated = await apiLogin(stored.email, legacyPassword);
            next = { email: migrated.user.email, user: migrated.user, sessionToken: migrated.sessionToken };
          } catch {
            next = { email: stored.email, user: stored.user, sessionToken: null };
          }
        } else if (next.sessionToken) {
          try {
            next.user = await apiMe(next.sessionToken);
          } catch {
            next = { email: stored.email, user: stored.user, sessionToken: null };
          }
        }
        if (active) {
          setAuth(next);
          await writeStoredAuth(next);
        }
      } catch {
        // A damaged or unavailable local session leaves the app signed out.
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const session = await apiLogin(email.trim(), password);
      await persist({ ...session, email: session.user.email });
      return session.user;
    },
    [persist],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const session = await apiSignup(email.trim(), password, name.trim());
      await persist({ ...session, email: session.user.email });
      return session.user;
    },
    [persist],
  );

  const redeem = useCallback(
    async (code: string, email?: string, password?: string) => {
      const normalized = code.trim().toUpperCase();
      if (HARDCODED_BYPASS_CODES.has(normalized)) {
        const bypassUser: AccountUser = {
          id: `bypass:${normalized}`,
          email: email?.trim() || auth?.email || 'bypass@boomer.ai',
          name: 'Boomer AI guest',
          stars: 0,
          level: 'pro',
          isPro: true,
          proSource: `bypass-code:${normalized}`,
          proExpiresAt: null,
        };
        await persist({ email: bypassUser.email, user: bypassUser, sessionToken: null });
        return bypassUser;
      }

      let current = auth;
      if (!current?.sessionToken) {
        if (!email || !password) throw new Error('Sign in first, then redeem your code.');
        const session = await apiLogin(email.trim(), password);
        current = { ...session, email: session.user.email };
      }
      const user = await apiRedeem(current.sessionToken!, normalized);
      await persist({ ...current, user, email: user.email });
      return user;
    },
    [auth, persist],
  );

  const refresh = useCallback(async () => {
    if (!auth?.sessionToken) return;
    try {
      const user = await apiMe(auth.sessionToken);
      await persist({ ...auth, user });
    } catch {
      // Keep the local profile visible; the next sign-in can renew the session.
    }
  }, [auth, persist]);

  const signOut = useCallback(async () => {
    try {
      if (auth?.sessionToken) await apiLogout(auth.sessionToken);
    } finally {
      await persist(null);
    }
  }, [auth, persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth?.user ?? null,
      sessionToken: auth?.sessionToken ?? null,
      hydrated,
      signIn,
      signUp,
      redeem,
      refresh,
      signOut,
    }),
    [auth, hydrated, signIn, signUp, redeem, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
