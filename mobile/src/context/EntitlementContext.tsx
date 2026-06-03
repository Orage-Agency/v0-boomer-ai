import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isRevenueCatConfigured } from '@/config/env';
import {
  addCustomerInfoListener,
  fetchCustomerInfo,
  isPro,
} from './purchases';
import { useAuth } from './AuthContext';

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
};

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const { user, refresh: refreshAccount } = useAuth();
  const [rcEntitled, setRcEntitled] = useState<boolean>(!isRevenueCatConfigured);
  const [loading, setLoading] = useState<boolean>(isRevenueCatConfigured);

  const refresh = useCallback(async () => {
    await refreshAccount();
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
  const entitled = rcEntitled || accountEntitled;

  const value = useMemo<EntitlementContextValue>(
    () => ({
      entitled,
      loading,
      configured: isRevenueCatConfigured,
      refresh,
    }),
    [entitled, loading, refresh],
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
