/** Profile contract persisted by both the web and native clients. */
export type UserProfile = {
  persona: string | null;
  age: string | null;
  aiLevel: number;
  userTitle: string | null;
  avatarSrc: string | null;
  level: string | null;
  /** Legacy fields retained so older saved profiles can round-trip unchanged. */
  stars: number;
  streak: number;
  badges: string[];
  lessonsCompleted: string[];
  userName: string | null;
  name?: string;
  deviceId: string | null;
  dailyArtCount: number;
  lastArtDate: string | null;
  pinnedFeatures: string[];
  email: string | null;
  isLoggedIn: boolean;
};

export const DEFAULT_PROFILE: UserProfile = {
  persona: null,
  age: null,
  aiLevel: 0,
  userTitle: null,
  avatarSrc: null,
  level: null,
  stars: 0,
  streak: 0,
  badges: [],
  lessonsCompleted: [],
  userName: null,
  deviceId: null,
  dailyArtCount: 0,
  lastArtDate: null,
  pinnedFeatures: [],
  email: null,
  isLoggedIn: false,
};
