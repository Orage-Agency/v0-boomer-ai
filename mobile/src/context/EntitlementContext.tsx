import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRevenueCatConfigured } from '@/config/env';
import {
  addCustomerInfoListener,
  fetchCustomerInfo,
  isPro,
} from './purchases';
import { useAuth } from './AuthContext';
import { BYPASS_PRO_KEY } from './storage';

/**
 * Tracks the user's "pro" entitlement.
 *
 * Entitled === (RevenueCat Pro) OR (account.isPro from server).
 *
 *  - RC Pro covers normal App-Store purchases (annual/monthly).
 *  - account.isPro covers off-store paying customers and George dev codes
 *    redeemed via /api/redeem.
 *
 * When RevenueCat is not configured (dev / preview), the RC half short-circuits
 * to `true` so devs aren't locked out — production builds always set a real key.
 */

type EntitlementContextValue = {
  entitled: boolean;
  loading: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
  /** True for one moment right after entitlement flips false -> true. */
  justUnlocked: boolean;
  /** Dismiss the just-unlocked celebration. */
  clearJustUnlocked: () => void;
};

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const { user, refresh: refreshAccount } = useAuth();
  const [rcEntitled, setRcEntitled] = useState<boolean>(!isRevenueCatConfigured);
  const [bypassEntitled, setBypassEntitled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(isRevenueCatConfigured);

  const refresh = useCallback(async () => {
    await refreshAccount();
    // Check local bypass code flag.
    const bypass = await AsyncStorage.getItem(BYPASS_PRO_KEY);
    setBypassEntitled(bypass === 'true');
    if (!isRevenueCatConfigured) {
      setRcEntitled(true);
      setLoading(false);
      return;
    }
    const info = await fetchCustomerInfo();
    setRcEntitled(info ? isPro(info) : false);
    setLoading(false);
  }, [refreshAccount]);

  useEffect(() => {
    void refresh();
    const unsub = addCustomerInfoListener((info) => setRcEntitled(isPro(info)));
    return unsub;
  }, [refresh]);

  const accountEntitled = !!user?.isPro;
  const entitled = rcEntitled || accountEntitled || bypassEntitled;

  // Celebrate the unlock — but only a genuine in-session false -> true flip
  // (purchase, restore, login, or code), never the initial load settling for a
  // user who was already Pro. We establish a baseline once loading completes
  // and only fire on transitions after that.
  const [justUnlocked, setJustUnlocked] = useState(false);
  const prevEntitled = useRef(entitled);
  const hasSettled = useRef(false);
  useEffect(() => {
    if (loading) return; // wait for the first entitlement load to finish
    if (!hasSettled.current) {
      // First settle: record the baseline, no celebration.
      hasSettled.current = true;
    } else if (!prevEntitled.current && entitled) {
      setJustUnlocked(true);
    }
    prevEntitled.current = entitled;
  }, [entitled, loading]);
  const clearJustUnlocked = useCallback(() => setJustUnlocked(false), []);

  const value = useMemo<EntitlementContextValue>(
    () => ({
      entitled,
      loading,
      configured: isRevenueCatConfigured,
      refresh,
      justUnlocked,
      clearJustUnlocked,
    }),
    [entitled, loading, refresh, justUnlocked, clearJustUnlocked],
  );

  return (
    <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>
  );
}

export function useEntitlement(): EntitlementContextValue {
  const ctx = useContext(EntitlementContext);
  if (!ctx) throw new Error('useEntitlement must be used within EntitlementProvider');
  return ctx;
}
