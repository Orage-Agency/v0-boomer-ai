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
import { mergeUserProfiles } from '@boomer-ai/shared';
import { useAuth } from './AuthContext';
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
 * A device profile remains usable without an account. When a secure account
 * session is present, the backend merges the device profile into account
 * profiles and associates conversation history before returning the result.
 *
 * Offline-first: local cache drives the UI; backend sync is best-effort and
 * never blocks the user.
 */

export type AppView = 'loading' | 'onboarding' | 'app';

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
  const { user: accountUser, sessionToken } = useAuth();
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
        await profileApi.saveProfile(next, sessionToken);
      } catch {
        /* offline / not configured — cache already saved */
      }
    }
  }, [sessionToken]);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setProfile((prev) => {
        const merged: UserProfile = { ...prev, ...updates };
        void persist(merged);
        return merged;
      });
    },
    [persist],
  );

  const decideView = useCallback((p: UserProfile) => {
    if (p.level) return 'app' as const;
    return 'onboarding' as const;
  }, []);

  const loadProfile = useCallback(
    async (deviceId: string) => {
      // Try backend first (when configured), then local cache.
      let loaded: UserProfile | null = null;
      const hasAccount = Boolean(
        accountUser && sessionToken && !accountUser.id.startsWith('bypass:'),
      );
      const cached = await getCachedProfile<UserProfile>(deviceId);
      if (isApiConfigured) {
        try {
          const res = await profileApi.getProfile(deviceId, sessionToken);
          if (res.success && res.profile) {
            const cachedBelongsToThisAccount = !hasAccount
              || !cached?.email
              || cached.email.toLowerCase() === accountUser?.email.toLowerCase();
            loaded = cached && cachedBelongsToThisAccount
              ? mergeUserProfiles(cached, res.profile)
              : res.profile;
          }
        } catch {
          /* fall through to cache */
        }
      }
      if (!loaded) {
        if (cached) {
          loaded = { ...cached, deviceId };
        }
      }
      if (!loaded) {
        loaded = { ...DEFAULT_PROFILE, deviceId };
      }
      loaded = {
        ...loaded,
        email: hasAccount ? accountUser!.email : null,
        isLoggedIn: hasAccount,
      };
      setProfile(loaded);
      if (hasAccount) {
        await setCachedProfile(deviceId, loaded);
      }
      setView(decideView(loaded));
    },
    [accountUser, decideView, sessionToken],
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
