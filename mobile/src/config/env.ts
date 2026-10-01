import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  resolveApiEnvironment,
  resolveApiBaseUrl,
  type ApiEnvironment,
  type RuntimePlatform,
} from './api-environment';

/**
 * Centralized runtime configuration.
 *
 * RevenueCat keys can be supplied two ways:
 *  1. `EXPO_PUBLIC_RC_IOS_KEY` / `EXPO_PUBLIC_RC_ANDROID_KEY` env vars at
 *     build time (preferred; injected by EAS secrets / Xcode Cloud env).
 *  2. `app.json -> expo.extra.revenueCatApiKeyIos / ...Android` as a fallback.
 *
 * Both default to the sentinel `__REPLACE_ME__` so the app is safe in dev /
 * Expo Go (every purchases call becomes a no-op via `isRevenueCatConfigured`).
 *
 */

type Extra = {
  apiEnvironment?: ApiEnvironment;
  apiBaseUrl?: string;
  productionApiBaseUrl?: string;
  defaultDevelopmentApiBaseUrl?: string;
  revenueCatApiKeyIos?: string;
  revenueCatApiKeyAndroid?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

const RC_PLACEHOLDER = '__REPLACE_ME__';
const PRODUCTION_API_ORIGIN = 'https://boomerai.orage.agency';
const apiEnvironment = resolveApiEnvironment(
  process.env.EXPO_PUBLIC_API_ENV ?? extra.apiEnvironment,
  undefined,
);
const runtimePlatform: RuntimePlatform =
  Platform.OS === 'android' ? 'android' : Platform.OS === 'web' ? 'web' : 'ios';
const productionApiBaseUrl =
  extra.productionApiBaseUrl ?? extra.apiBaseUrl ?? PRODUCTION_API_ORIGIN;
const apiBaseUrl = resolveApiBaseUrl({
  environment: apiEnvironment,
  platform: runtimePlatform,
  configuredUrl:
    apiEnvironment === 'development'
      ? process.env.EXPO_PUBLIC_API_BASE_URL
      : process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl,
  productionUrl: productionApiBaseUrl,
});

const iosKey =
  process.env.EXPO_PUBLIC_RC_IOS_KEY ??
  extra.revenueCatApiKeyIos ??
  RC_PLACEHOLDER;

const androidKey =
  process.env.EXPO_PUBLIC_RC_ANDROID_KEY ??
  extra.revenueCatApiKeyAndroid ??
  RC_PLACEHOLDER;

export const env = {
  /** Origin selected for the active EAS build environment. */
  apiBaseUrl,
  apiEnvironment,
  revenueCat: {
    iosApiKey: iosKey,
    androidApiKey: androidKey,
  },
};

function isRealKey(key: string): boolean {
  return key !== RC_PLACEHOLDER && !key.includes('PLACEHOLDER');
}

/** API origins are validated at build time and again at runtime. */
export const isApiConfigured = true;

/** True when a real RevenueCat key has been supplied for the current platform. */
export const isRevenueCatConfigured =
  (Platform.OS === 'ios' && isRealKey(env.revenueCat.iosApiKey)) ||
  (Platform.OS === 'android' && isRealKey(env.revenueCat.androidApiKey));
