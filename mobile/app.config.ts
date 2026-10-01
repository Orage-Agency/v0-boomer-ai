import type { ConfigContext, ExpoConfig } from 'expo/config';
import {
  defaultDevelopmentApiUrl,
  resolveApiEnvironment,
  resolveApiBaseUrl,
  type RuntimePlatform,
} from './src/config/api-environment.ts';

const PRODUCTION_API_ORIGIN = 'https://boomerai.orage.agency';

export default ({ config }: ConfigContext): ExpoConfig => {
  const easProfile = process.env.EAS_BUILD_PROFILE;
  const environment = resolveApiEnvironment(
    process.env.EXPO_PUBLIC_API_ENV,
    easProfile,
  );
  const platform = resolveBuildPlatform(process.env.EAS_BUILD_PLATFORM);
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const productionUrl =
    (config.extra?.productionApiBaseUrl as string | undefined) ??
    (config.extra?.apiBaseUrl as string | undefined) ??
    PRODUCTION_API_ORIGIN;

  const apiBaseUrl = resolveApiBaseUrl({
    environment,
    platform,
    configuredUrl:
      configuredUrl ??
      (environment === 'development'
        ? undefined
        : (config.extra?.apiBaseUrl as string | undefined)),
    productionUrl,
  });

  return {
    ...config,
    name: config.name ?? 'Boomer AI',
    slug: config.slug ?? 'boomer-ai',
    extra: {
      ...config.extra,
      apiEnvironment: environment,
      apiBaseUrl,
      productionApiBaseUrl: productionUrl,
      defaultDevelopmentApiBaseUrl: defaultDevelopmentApiUrl(platform),
    },
  };
};

function resolveBuildPlatform(value: string | undefined): RuntimePlatform {
  if (value === 'android' || value === 'ios') return value;
  return 'ios';
}
