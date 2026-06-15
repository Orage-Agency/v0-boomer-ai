import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AccountUser,
  login as apiLogin,
  signup as apiSignup,
  redeemCode as apiRedeem,
  refreshMe as apiMe,
} from '@/api/auth';
import { BYPASS_PRO_KEY } from './storage';
import { isBypassCode, normalizeCode } from '@/lib/bypassCodes';

/**
 * Tracks the (optional) signed-in account.
 *
 * The native app is device-only by default — no login required to use free
 * features. An account is only needed when the user:
 *   (a) wants to log in on a new device to restore a Pro purchase, or
 *   (b) has an off-store access / bypass code to redeem.
 *
 * We persist email + password in AsyncStorage (matching the existing simple
 * web auth). Server returns a fresh `isPro` flag on every login/refresh; the
 * mobile EntitlementContext ORs this with RC's customerInfo.entitlements.
 */

const STORAGE_KEY = 'boomer.auth.v1';

/** A synthetic bypass user never round-trips to the server. */
function isBypassUser(user: AccountUser | undefined | null): boolean {
  return !!user && (user.id.startsWith('bypass:') || !!user.proSource?.startsWith('bypass-code:'));
}

function makeBypassUser(code: string, email?: string): AccountUser {
  const normalized = normalizeCode(code);
  return {
    id: `bypass:${normalized}`,
    email: email?.trim() || 'bypass@boomer.ai',
    name: 'Boomer AI guest',
    stars: 0,
    level: 'pro',
    isPro: true,
    proSource: `bypass-code:${normalized}`,
    proExpiresAt: null,
  };
}

type StoredAuth = {
  email: string;
  password: string;
  user: AccountUser;
};

type AuthContextValue = {
  user: AccountUser | null;
  /** True until the persisted session is loaded from AsyncStorage. */
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

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setAuth(JSON.parse(raw) as StoredAuth);
      } catch {
        // ignore — treat as logged-out
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next: StoredAuth | null) => {
    setAuth(next);
    if (next) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const user = await apiLogin(email, password);
      await persist({ email, password, user });
      return user;
    },
    [persist],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const user = await apiSignup(email, password, name);
      await persist({ email, password, user });
      return user;
    },
    [persist],
  );

  const redeem = useCallback(
    async (code: string, email?: string, password?: string) => {
      // Hardcoded bypass codes work offline, no email/password required.
      if (isBypassCode(code)) {
        const e = (email ?? auth?.email ?? '').trim();
        const p = password ?? auth?.password ?? '';
        const bypassUser = makeBypassUser(code, e);
        // Durable flag so the unlock survives even if a server refresh later
        // returns a non-Pro profile for the same email.
        await AsyncStorage.setItem(BYPASS_PRO_KEY, 'true');
        await persist({
          email: e || bypassUser.email,
          password: p,
          user: bypassUser,
        });
        return bypassUser;
      }
      const e = email ?? auth?.email;
      const p = password ?? auth?.password;
      if (!e || !p) throw new Error('Sign in first, then redeem your code.');
      const user = await apiRedeem(e, p, code);
      await persist({ email: e, password: p, user });
      return user;
    },
    [auth, persist],
  );

  const refresh = useCallback(async () => {
    if (!auth) return;
    // Never round-trip a bypass user to the server — apiMe would return a
    // non-Pro profile and silently wipe the local unlock.
    if (isBypassUser(auth.user)) return;
    try {
      const user = await apiMe(auth.email, auth.password);
      await persist({ ...auth, user });
    } catch {
      // silent — stale token; user can re-login if needed
    }
  }, [auth, persist]);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(BYPASS_PRO_KEY);
    await persist(null);
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth?.user ?? null,
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
