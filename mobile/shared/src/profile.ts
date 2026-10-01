/** Profile contract persisted by both the web and native clients. */
export type UserProfile = {
  persona: string | null;
  age: string | null;
  aiLevel: number;
  userTitle: string | null;
  avatarSrc: string | null;
  assistantSrc: string | null;
  avatarBackground: string | null;
  assistantBackground: string | null;
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
  assistantSrc: null,
  avatarBackground: 'peach',
  assistantBackground: 'sky',
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

/** Shared, restrained gradient choices for profile and assistant portraits. */
export const PROFILE_BACKGROUNDS = [
  { id: 'peach', label: 'Peach', colors: ['#FCE7D8', '#F8D6C5'], css: 'linear-gradient(135deg, #FCE7D8, #F8D6C5)' },
  { id: 'sky', label: 'Sky', colors: ['#DCEFFA', '#C9E2F4'], css: 'linear-gradient(135deg, #DCEFFA, #C9E2F4)' },
  { id: 'sage', label: 'Sage', colors: ['#E2EEDF', '#CDDFC9'], css: 'linear-gradient(135deg, #E2EEDF, #CDDFC9)' },
  { id: 'lavender', label: 'Lavender', colors: ['#EAE3F4', '#D9CEEB'], css: 'linear-gradient(135deg, #EAE3F4, #D9CEEB)' },
  { id: 'sand', label: 'Sand', colors: ['#F3EBD9', '#E9DDBD'], css: 'linear-gradient(135deg, #F3EBD9, #E9DDBD)' },
  { id: 'rose', label: 'Rose', colors: ['#F5E1E5', '#EBCBD3'], css: 'linear-gradient(135deg, #F5E1E5, #EBCBD3)' },
] as const;
