export type ApiEnvironment = 'development' | 'production';
export type RuntimePlatform = 'ios' | 'android' | 'web';

export type ApiEnvironmentOptions = {
  environment: ApiEnvironment;
  platform: RuntimePlatform;
  configuredUrl?: string;
  productionUrl: string;
};

export function resolveApiEnvironment(
  requested: string | undefined,
  easProfile: string | undefined,
): ApiEnvironment {
  const environment = requested ??
    (easProfile === 'production' || easProfile === 'preview' ? 'production' : 'development');
  if (environment !== 'development' && environment !== 'production') {
    throw new Error('EXPO_PUBLIC_API_ENV must be either "development" or "production".');
  }
  if (easProfile === 'development' && environment !== 'development') {
    throw new Error('The EAS development profile must use the development API.');
  }
  if ((easProfile === 'production' || easProfile === 'preview') && environment !== 'production') {
    throw new Error(`The EAS ${easProfile} profile must use the production API.`);
  }
  return environment;
}

const DEFAULT_PORT = '3000';

export function defaultDevelopmentApiUrl(platform: RuntimePlatform): string {
  return platform === 'android'
    ? `http://10.0.2.2:${DEFAULT_PORT}`
    : `http://localhost:${DEFAULT_PORT}`;
}

export function resolveApiBaseUrl({
  environment,
  platform,
  configuredUrl,
  productionUrl,
}: ApiEnvironmentOptions): string {
  if (environment === 'production') {
    const url = normalizeUrl(configuredUrl ?? productionUrl);
    if (url.protocol !== 'https:' || isLocalHost(url.hostname)) {
      throw new Error('Production API must use a public HTTPS origin. Localhost and private network URLs are not allowed.');
    }
    return stripTrailingSlash(url.toString());
  }

  if (!configuredUrl) return defaultDevelopmentApiUrl(platform);

  const url = normalizeUrl(configuredUrl);
  if (url.protocol !== 'http:' || !isLocalHost(url.hostname)) {
    throw new Error('Development API must use an HTTP localhost or private LAN origin.');
  }
  return stripTrailingSlash(url.toString());
}

function normalizeUrl(value: string): URL {
  try {
    return new URL(value.trim());
  } catch {
    throw new Error(`Invalid API origin: ${value}`);
  }
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function isLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '::1' ||
    host === '0.0.0.0' ||
    host === '10.0.2.2' ||
    host.endsWith('.local') ||
    host.endsWith('.lan')
  ) {
    return true;
  }

  const octets = host.split('.').map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  const [first, second] = octets;
  return (
    first === 10 ||
    first === 127 ||
    first === 192 && second === 168 ||
    first === 172 && second >= 16 && second <= 31 ||
    first === 169 && second === 254
  );
}
