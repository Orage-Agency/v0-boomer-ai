import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearCachedProfile,
  getCachedProfile,
  getDeviceId,
  setCachedProfile,
} from './storage';

describe('device and profile storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('creates a stable device id for this installation', async () => {
    const first = await getDeviceId();
    const second = await getDeviceId();

    expect(first).toMatch(/^device_\d+_[a-z0-9]+$/);
    expect(second).toBe(first);
  });

  it('saves, reads, and clears a cached profile', async () => {
    const profile = { name: 'Sam', stars: 5 };

    await setCachedProfile('device-1', profile);
    expect(await getCachedProfile('device-1')).toEqual(profile);

    await clearCachedProfile('device-1');
    expect(await getCachedProfile('device-1')).toBeNull();
  });
});
