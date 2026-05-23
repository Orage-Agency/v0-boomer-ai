import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { authApi, profileApi } from '@/api';
import { isApiConfigured } from '@/config/env';
import { DEFAULT_PROFILE, type UserProfile } from '@/types';
import {
  clearCachedProfile,
  clearSession,
  getCachedProfile,
  getDeviceId,
  getSession,
  setCachedProfile,
  setSession,
} from './storage';

/**
 * Central app state, mirroring the logic in the web app's `app/page.tsx`:
 *  - resolve a device id
 *  - load profile from backend, fall back to local cache
 *  - decide which "view" the user belongs in (auth / onboarding / app)
 *  - persist updates locally + sync to backend
 *  - recompute level from stars on every star change
 *
 * Offline-first: local cache is the source of truth for the UI; backend sync
 * is best-effort and never blocks the user (matches web behaviour).
 */

export type AppView = 'loading' | 'auth' | 'onboarding' | 'app';

function calculateLevelFromStars(stars: number): string {
  if (stars < 200) return 'Basic';
  if (stars < 600) return 'Intermediate';
  if (stars < 1400) return 'Advanced';
  return 'Expert';
}

type ProfileContextValue = {
  view: AppView;
  profile: UserProfile;
  setView: (v: AppView) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  apiConfigured: boolean;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<AppView>('loading');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const persist = useCallback(async (next: UserProfile) => {
    const key = next.email ?? next.deviceId ?? 'anon';
    await setCachedProfile(key, next);
    // Best-effort backend sync; never throws to the UI.
    if (isApiConfigured && next.userName && next.level) {
      try {
        await profileApi.saveProfile(next);
      } catch {
        /* offline / not configured — cache already saved */
      }
    }
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setProfile((prev) => {
        const merged: UserProfile = { ...prev, ...updates };
        if (updates.stars !== undefined) {
          merged.level = calculateLevelFromStars(updates.stars);
        }
        void persist(merged);
        return merged;
      });
    },
    [persist],
  );

  const decideView = useCallback((p: UserProfile, email?: string | null) => {
    if (p.persona && p.level) return 'app' as const;
    if (email) return 'onboarding' as const;
    return 'auth' as const;
  }, []);

  const loadProfile = useCallback(
    async (deviceId: string, email?: string | null) => {
      // Try backend first (when configured), then local cache.
      let loaded: UserProfile | null = null;
      if (isApiConfigured) {
        try {
          const res = await profileApi.getProfile(deviceId, email);
          if (res.success && res.profile) {
            loaded = {
              ...res.profile,
              deviceId,
              isLoggedIn: !!email,
              email: email ?? null,
            };
          }
        } catch {
          /* fall through to cache */
        }
      }
      if (!loaded) {
        const cached = await getCachedProfile<UserProfile>(email ?? deviceId);
        if (cached) {
          loaded = {
            ...cached,
            deviceId,
            isLoggedIn: !!email,
            email: email ?? null,
          };
        }
      }
      if (!loaded) {
        loaded = {
          ...DEFAULT_PROFILE,
          deviceId,
          isLoggedIn: !!email,
          email: email ?? null,
        };
      }
      setProfile(loaded);
      setView(decideView(loaded, email));
    },
    [decideView],
  );

  // Bootstrap on mount.
  useEffect(() => {
    (async () => {
      const deviceId = await getDeviceId();
      const session = await getSession();
      if (session) {
        await loadProfile(deviceId, session.email);
      } else {
        setProfile({ ...DEFAULT_PROFILE, deviceId });
        setView('auth');
      }
    })();
  }, [loadProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!isApiConfigured) {
        return {
          ok: false,
          error: 'App is not connected to a server yet (API URL not set).',
        };
      }
      try {
        const res = await authApi.login(email, password);
        if (res.success && res.user) {
          await setSession({ email: res.user.email, name: res.user.name });
          const deviceId = await getDeviceId();
          await loadProfile(deviceId, res.user.email);
          return { ok: true };
        }
        return { ok: false, error: res.error ?? 'Sign in failed' };
      } catch (e) {
        return { ok: false, error: (e as Error).message };
      }
    },
    [loadProfile],
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      if (!isApiConfigured) {
        return {
          ok: false,
          error: 'App is not connected to a server yet (API URL not set).',
        };
      }
      try {
        const res = await authApi.signup(email, password, name);
        if (res.success && res.user) {
          await setSession({ email: res.user.email, name: res.user.name });
          const deviceId = await getDeviceId();
          await loadProfile(deviceId, res.user.email);
          return { ok: true };
        }
        return { ok: false, error: res.error ?? 'Sign up failed' };
      } catch (e) {
        return { ok: false, error: (e as Error).message };
      }
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    await clearSession();
    const deviceId = profileRef.current.deviceId;
    setProfile({ ...DEFAULT_PROFILE, deviceId });
    setView('auth');
  }, []);

  const resetOnboarding = useCallback(async () => {
    const deviceId = profileRef.current.deviceId;
    const email = profileRef.current.email;
    if (email) await clearCachedProfile(email);
    setProfile({
      ...DEFAULT_PROFILE,
      deviceId,
      email,
      isLoggedIn: !!email,
    });
    setView('onboarding');
  }, []);

  const deleteAccount = useCallback(async () => {
    const { email, deviceId } = profileRef.current;
    if (email && isApiConfigured) {
      try {
        await authApi.deleteAccount(email);
      } catch {
        /* best effort */
      }
      await clearCachedProfile(email);
    }
    await clearSession();
    setProfile({ ...DEFAULT_PROFILE, deviceId });
    setView('auth');
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      view,
      profile,
      setView,
      updateProfile,
      login,
      signup,
      logout,
      resetOnboarding,
      deleteAccount,
      apiConfigured: isApiConfigured,
    }),
    [view, profile, updateProfile, login, signup, logout, resetOnboarding, deleteAccount],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}

export { calculateLevelFromStars };
