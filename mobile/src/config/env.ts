import Constants from 'expo-constants';
import { Platform } from 'react-native';

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
 * TODO(owner): Replace `apiBaseUrl` with the real Vercel PRODUCTION URL for
 * the v0-boomer-ai deployment (e.g. https://boomer-ai.vercel.app).
 */

type Extra = {
  apiBaseUrl?: string;
  elevenLabsAgentId?: string;
  revenueCatApiKeyIos?: string;
  revenueCatApiKeyAndroid?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

const RC_PLACEHOLDER = '__REPLACE_ME__';
const PLACEHOLDER_API = 'https://CHANGE-ME.vercel.app';

const iosKey =
  process.env.EXPO_PUBLIC_RC_IOS_KEY ??
  extra.revenueCatApiKeyIos ??
  RC_PLACEHOLDER;

const androidKey =
  process.env.EXPO_PUBLIC_RC_ANDROID_KEY ??
  extra.revenueCatApiKeyAndroid ??
  RC_PLACEHOLDER;

export const env = {
  /** Origin of the hosted Next.js backend that serves /api/* routes. */
  apiBaseUrl: extra.apiBaseUrl ?? PLACEHOLDER_API,
  /** ElevenLabs conversational agent (Sara) for the real-time Voice screen. */
  elevenLabsAgentId: extra.elevenLabsAgentId ?? '',
  revenueCat: {
    iosApiKey: iosKey,
    androidApiKey: androidKey,
  },
};

function isRealKey(key: string): boolean {
  return key !== RC_PLACEHOLDER && !key.includes('PLACEHOLDER');
}

/** True when the API base URL has not yet been configured by the owner. */
export const isApiConfigured = !env.apiBaseUrl.includes('CHANGE-ME');

/** True when a real RevenueCat key exists for the platform actually running. */
export function isRevenueCatConfiguredForPlatform(os: string): boolean {
  const key =
    os === 'ios' ? env.revenueCat.iosApiKey : env.revenueCat.androidApiKey;
  return isRealKey(key);
}

/**
 * True when a real RevenueCat key is configured for the CURRENT platform.
 * Platform-aware so that a live iOS key does not make Android (still on a
 * placeholder store key) think IAP is available — on Android this stays false
 * until a real `goog_...` key is set, and the paywall shows its unavailable
 * state instead of dead buttons.
 */
export const isRevenueCatConfigured = isRevenueCatConfiguredForPlatform(
  Platform.OS,
);
