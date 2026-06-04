import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { env, isRevenueCatConfigured } from '@/config/env';

/**
 * RevenueCat in-app purchases service.
 *
 * This wraps `react-native-purchases`. It is intentionally defensive: when no
 * RevenueCat API key is configured (placeholder keys), every method becomes a
 * safe no-op so the app still runs end-to-end in development and on Expo Go.
 *
 * SETUP CHECKLIST (owner):
 *  1. Create a RevenueCat account -> project for "Boomer AI".
 *  2. Add iOS + Android apps; paste the public SDK keys into
 *     app.json -> expo.extra.revenueCatApiKeyIos / ...Android.
 *  3. In App Store Connect, create the subscription / product IDs below and
 *     attach them to a RevenueCat "Offering" named ENTITLEMENT_OFFERING.
 *  4. In Google Play Console, create matching products + offering.
 *  5. RevenueCat requires a custom dev client or production build — IAP does
 *     NOT work in Expo Go. Use `eas build --profile development`.
 *
 * Product IDs are PLACEHOLDERS — replace with real store product identifiers.
 */

/**
 * Store product identifiers. These MUST match what is created in App Store
 * Connect (Apple) / Google Play Console verbatim.
 *  - boomerai.pro.yearly   -> $97/yr, 7-day free trial
 *  - boomerai.pro.monthly  -> $9.99/mo, 3-day free trial
 */
export const PRODUCT_IDS = {
  annual: 'boomerai.pro.yearly',
  monthly: 'boomerai.pro.monthly',
} as const;

// The RevenueCat entitlement that unlocks "Pro" features.
export const PRO_ENTITLEMENT = 'pro';

// Default RevenueCat Offering identifier to display on the paywall.
export const ENTITLEMENT_OFFERING = 'default';

let configured = false;

/** Initialize the RevenueCat SDK. Safe to call multiple times. */
export async function initPurchases(): Promise<void> {
  if (configured) return;
  if (!isRevenueCatConfigured) {
    // No real key — skip init so the app keeps working.
    return;
  }
  const apiKey =
    Platform.OS === 'ios'
      ? env.revenueCat.iosApiKey
      : env.revenueCat.androidApiKey;
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });
    configured = true;
  } catch (e) {
    // Likely running in Expo Go (native module unavailable). Stay no-op.
    console.warn('[purchases] configure failed (Expo Go?)', (e as Error).message);
  }
}

/** Associate the RevenueCat user with the app account (call after login). */
export async function identifyUser(appUserId: string): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logIn(appUserId);
  } catch (e) {
    console.warn('[purchases] logIn failed', (e as Error).message);
  }
}

/** Fetch the offering to display on the paywall. */
export async function getOffering(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    console.warn('[purchases] getOfferings failed', (e as Error).message);
    return null;
  }
}

/** Purchase a package. Returns whether the Pro entitlement is now active. */
export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<{ ok: boolean; cancelled?: boolean; error?: string }> {
  if (!configured) {
    return { ok: false, error: 'Purchases not configured' };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { ok: isPro(customerInfo) };
  } catch (e) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) return { ok: false, cancelled: true };
    return { ok: false, error: err.message ?? 'Purchase failed' };
  }
}

/** Restore previous purchases. */
export async function restorePurchases(): Promise<boolean> {
  if (!configured) return false;
  try {
    const info = await Purchases.restorePurchases();
    return isPro(info);
  } catch (e) {
    console.warn('[purchases] restore failed', (e as Error).message);
    return false;
  }
}

/** Check current entitlement status. */
export async function isProActive(): Promise<boolean> {
  if (!configured) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return isPro(info);
  } catch {
    return false;
  }
}

function isPro(info: CustomerInfo): boolean {
  return info.entitlements.active[PRO_ENTITLEMENT] !== undefined;
}

/**
 * Subscribe to RevenueCat customerInfo updates. Returns an unsubscribe fn.
 * No-ops (returns a noop unsub) when purchases are not configured.
 */
export function addCustomerInfoListener(
  cb: (info: CustomerInfo) => void,
): () => void {
  if (!configured) return () => undefined;
  try {
    Purchases.addCustomerInfoUpdateListener(cb);
    return () => {
      try {
        Purchases.removeCustomerInfoUpdateListener(cb);
      } catch {
        /* ignore */
      }
    };
  } catch {
    return () => undefined;
  }
}

/** Fetch latest customer info; returns null when not configured. */
export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export { isPro };
