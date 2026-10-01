import {
  defaultDevelopmentApiUrl,
  resolveApiBaseUrl,
  resolveApiEnvironment,
} from './api-environment';

const productionUrl = 'https://boomerai.orage.agency';

describe('API environment selection', () => {
  it('uses localhost for iOS and web development, and the Android emulator bridge on Android', () => {
    expect(defaultDevelopmentApiUrl('ios')).toBe('http://localhost:3000');
    expect(defaultDevelopmentApiUrl('web')).toBe('http://localhost:3000');
    expect(defaultDevelopmentApiUrl('android')).toBe('http://10.0.2.2:3000');
  });

  it('accepts a configured private LAN origin for a physical device', () => {
    expect(
      resolveApiBaseUrl({
        environment: 'development',
        platform: 'ios',
        configuredUrl: 'http://192.168.1.24:3000/',
        productionUrl,
      }),
    ).toBe('http://192.168.1.24:3000');
  });

  it('uses the production origin for production builds', () => {
    expect(
      resolveApiBaseUrl({ environment: 'production', platform: 'ios', productionUrl }),
    ).toBe(productionUrl);
  });

  it('pins EAS development builds to development and preview/production builds to production', () => {
    expect(resolveApiEnvironment(undefined, 'development')).toBe('development');
    expect(resolveApiEnvironment(undefined, 'preview')).toBe('production');
    expect(resolveApiEnvironment(undefined, 'production')).toBe('production');
    expect(() => resolveApiEnvironment('production', 'development')).toThrow(/development profile/);
    expect(() => resolveApiEnvironment('development', 'production')).toThrow(/production profile/);
  });

  it.each(['http://localhost:3000', 'http://127.0.0.1:3000', 'http://10.0.2.2:3000', 'http://192.168.1.24:3000'])(
    'rejects a local origin in production: %s',
    (configuredUrl) => {
      expect(() =>
        resolveApiBaseUrl({ environment: 'production', platform: 'ios', configuredUrl, productionUrl }),
      ).toThrow(/public HTTPS origin/);
    },
  );

  it('rejects a public API origin in development to prevent accidental production calls', () => {
    expect(() =>
      resolveApiBaseUrl({
        environment: 'development',
        platform: 'ios',
        configuredUrl: productionUrl,
        productionUrl,
      }),
    ).toThrow(/localhost or private LAN/);
  });
});
