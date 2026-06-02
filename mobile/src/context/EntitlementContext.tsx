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

/**
 * Tracks the user's "pro" entitlement using RevenueCat's customerInfo.
 *
 * Behavior:
 *  - When RevenueCat is not configured (placeholder key), `entitled` is `true`
 *    so dev / preview builds are not locked out.
 *  - When configured, `entitled` reflects `customerInfo.entitlements.active.pro`
 *    and updates live via RC's listener (covers purchase + restore + renewal).
 */

type EntitlementContextValue = {
  entitled: boolean;
  loading: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
};

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const [entitled, setEntitled] = useState<boolean>(!isRevenueCatConfigured);
  const [loading, setLoading] = useState<boolean>(isRevenueCatConfigured);

  const refresh = useCallback(async () => {
    if (!isRevenueCatConfigured) {
      setEntitled(true);
      setLoading(false);
      return;
    }
    const info = await fetchCustomerInfo();
    setEntitled(info ? isPro(info) : false);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const unsub = addCustomerInfoListener((info) => setEntitled(isPro(info)));
    return unsub;
  }, [refresh]);

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
