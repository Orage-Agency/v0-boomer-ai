import Constants from 'expo-constants';

/**
 * Centralized runtime configuration.
 *
 * Values come from `app.json` -> `expo.extra`, which can in turn be wired to
 * EAS secrets / environment variables for different build profiles.
 *
 * TODO(owner): Replace `apiBaseUrl` with the real Vercel PRODUCTION URL for
 * the v0-boomer-ai deployment (e.g. https://boomer-ai.vercel.app). The web app
 * uses relative `/api/*` paths, so the mobile app simply needs the origin.
 * Find it in Vercel dashboard -> v0-boomer-ai project -> Domains.
 *
 * TODO(owner): Replace the RevenueCat keys once a RevenueCat account exists.
 * iOS keys start with `appl_`, Android keys start with `goog_`.
 */

type Extra = {
  apiBaseUrl?: string;
  revenueCatApiKeyIos?: string;
  revenueCatApiKeyAndroid?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

const PLACEHOLDER_API = 'https://CHANGE-ME.vercel.app';

export const env = {
  /** Origin of the hosted Next.js backend that serves /api/* routes. */
  apiBaseUrl: extra.apiBaseUrl ?? PLACEHOLDER_API,
  revenueCat: {
    iosApiKey: extra.revenueCatApiKeyIos ?? 'appl_PLACEHOLDER',
    androidApiKey: extra.revenueCatApiKeyAndroid ?? 'goog_PLACEHOLDER',
  },
};

/** True when the API base URL has not yet been configured by the owner. */
export const isApiConfigured = !env.apiBaseUrl.includes('CHANGE-ME');

/** True when a real RevenueCat key has been supplied. */
export const isRevenueCatConfigured =
  !env.revenueCat.iosApiKey.includes('PLACEHOLDER') ||
  !env.revenueCat.androidApiKey.includes('PLACEHOLDER');
