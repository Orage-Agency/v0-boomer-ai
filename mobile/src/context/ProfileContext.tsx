import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { profileApi } from '@/api';
import { isApiConfigured } from '@/config/env';
import { DEFAULT_PROFILE, type UserProfile } from '@/types';
import {
  clearCachedProfile,
  getCachedProfile,
  getDeviceId,
  setCachedProfile,
} from './storage';

/**
 * Central app state.
 *
 * DEVICE-ONLY model (no email/password). Each install gets a stable
 * `deviceId`; the profile is keyed by it. This deliberately removes the
 * email/password auth path that the web backend backed with PLAINTEXT
 * passwords (`/api/auth/*` + `boomer_users`) — a liability we refuse to ship.
 * See memory/boomer-appstore-credentials.md + the web-backend TODO.
 *
 * Flow: deviceId -> load profile (backend best-effort, local cache source of
 * truth) -> onboarding if no persona/level, else straight into the app.
 *
 * Offline-first: local cache drives the UI; backend sync is best-effort and
 * never blocks the user.
 */

export type AppView = 'loading' | 'onboarding' | 'app';

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
    const key = next.deviceId ?? 'anon';
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
        // NOTE: `level` is the LEARNING level the user chose in onboarding
        // ("Beginner", "Advanced", …). It must never be overwritten by the
        // star-based achievement tier — that used to silently reset a user's
        // chosen level to "Basic" on their first earned star. The star tier
        // is derived from `stars` wherever it's displayed (see profile.tsx).
        const merged: UserProfile = { ...prev, ...updates };
        void persist(merged);
        return merged;
      });
    },
    [persist],
  );

  const decideView = useCallback((p: UserProfile) => {
    if (p.persona && p.level) return 'app' as const;
    return 'onboarding' as const;
  }, []);

  const loadProfile = useCallback(
    async (deviceId: string) => {
      // Try backend first (when configured), then local cache.
      let loaded: UserProfile | null = null;
      if (isApiConfigured) {
        try {
          const res = await profileApi.getProfile(deviceId);
          if (res.success && res.profile) {
            loaded = { ...res.profile, deviceId };
          }
        } catch {
          /* fall through to cache */
        }
      }
      if (!loaded) {
        const cached = await getCachedProfile<UserProfile>(deviceId);
        if (cached) {
          loaded = { ...cached, deviceId };
        }
      }
      if (!loaded) {
        loaded = { ...DEFAULT_PROFILE, deviceId };
      }
      setProfile(loaded);
      setView(decideView(loaded));
    },
    [decideView],
  );

  // Bootstrap on mount.
  useEffect(() => {
    (async () => {
      const deviceId = await getDeviceId();
      await loadProfile(deviceId);
    })();
  }, [loadProfile]);

  const resetOnboarding = useCallback(async () => {
    const deviceId = profileRef.current.deviceId;
    if (deviceId) await clearCachedProfile(deviceId);
    setProfile({ ...DEFAULT_PROFILE, deviceId });
    setView('onboarding');
  }, []);

  const deleteAccount = useCallback(async () => {
    const { deviceId } = profileRef.current;
    if (deviceId) await clearCachedProfile(deviceId);
    setProfile({ ...DEFAULT_PROFILE, deviceId });
    setView('onboarding');
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      view,
      profile,
      setView,
      updateProfile,
      resetOnboarding,
      deleteAccount,
      apiConfigured: isApiConfigured,
    }),
    [view, profile, updateProfile, resetOnboarding, deleteAccount],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}

export { calculateLevelFromStars };
