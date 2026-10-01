import type { UserProfile } from './profile';

/**
 * Merge anonymous device progress with a signed-in profile without dropping
 * completed lessons, pinned tools, or legacy reward history.
 */
export function mergeUserProfiles(local: UserProfile, account: UserProfile): UserProfile {
  return {
    ...local,
    ...account,
    persona: account.persona ?? local.persona,
    age: account.age ?? local.age,
    aiLevel: Math.max(local.aiLevel, account.aiLevel),
    userTitle: account.userTitle ?? local.userTitle,
    avatarSrc: account.avatarSrc ?? local.avatarSrc,
    assistantSrc: account.assistantSrc ?? local.assistantSrc,
    avatarBackground: account.avatarBackground ?? local.avatarBackground,
    assistantBackground: account.assistantBackground ?? local.assistantBackground,
    level: account.level ?? local.level,
    stars: Math.max(local.stars, account.stars),
    streak: Math.max(local.streak, account.streak),
    badges: mergeUnique(local.badges, account.badges),
    lessonsCompleted: mergeUnique(local.lessonsCompleted, account.lessonsCompleted),
    userName: account.userName ?? local.userName,
    name: account.name ?? local.name,
    deviceId: local.deviceId ?? account.deviceId,
    dailyArtCount: Math.max(local.dailyArtCount, account.dailyArtCount),
    lastArtDate: latestDate(local.lastArtDate, account.lastArtDate),
    pinnedFeatures: mergeUnique(local.pinnedFeatures, account.pinnedFeatures),
    email: account.email ?? local.email,
    isLoggedIn: account.isLoggedIn,
  };
}

function mergeUnique(first: string[] | undefined, second: string[] | undefined): string[] {
  return [...new Set([...(first ?? []), ...(second ?? [])])];
}

function latestDate(first: string | null, second: string | null): string | null {
  if (!first) return second;
  if (!second) return first;
  return first.localeCompare(second) >= 0 ? first : second;
}
