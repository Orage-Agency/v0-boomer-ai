import { mergeUserProfiles } from '../../shared/src/progress';
import { DEFAULT_PROFILE } from '../../shared/src/profile';

describe('mergeUserProfiles', () => {
  it('preserves local progress while preferring account identity and preferences', () => {
    const merged = mergeUserProfiles(
      {
        ...DEFAULT_PROFILE,
        deviceId: 'local-device',
        userName: 'Local name',
        level: 'Beginner',
        lessonsCompleted: ['lesson-local'],
        pinnedFeatures: ['chat'],
        badges: ['legacy-local'],
      },
      {
        ...DEFAULT_PROFILE,
        isLoggedIn: true,
        email: 'learner@example.com',
        userName: 'Account name',
        level: 'Intermediate',
        lessonsCompleted: ['lesson-account'],
        pinnedFeatures: ['lessons'],
        badges: ['legacy-account'],
      },
    );

    expect(merged.userName).toBe('Account name');
    expect(merged.level).toBe('Intermediate');
    expect(merged.deviceId).toBe('local-device');
    expect(merged.isLoggedIn).toBe(true);
    expect(merged.lessonsCompleted).toEqual(['lesson-local', 'lesson-account']);
    expect(merged.pinnedFeatures).toEqual(['chat', 'lessons']);
    expect(merged.badges).toEqual(['legacy-local', 'legacy-account']);
  });
});
