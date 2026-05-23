/**
 * Boomer AI mobile theme.
 *
 * Approximates the web look: a clean white surface with a near-black
 * "ink" primary (the web app's `--primary` is oklch(0.205 0 0)), plus the
 * colorful gradients used on home feature tiles.
 *
 * Accessibility for older adults is a first-class concern:
 *  - Large base font sizes (16px is the FLOOR, not the ceiling).
 *  - High-contrast text on light surfaces.
 *  - Generous touch targets (minimum 44pt, see `layout.touchTarget`).
 */

export const colors = {
  // Core surfaces (B&W base)
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9', // slate-100
  surfaceSubtle: '#F8FAFC', // slate-50
  ink: '#0F172A', // slate-900 / web --primary equivalent, also auth bg
  border: '#E2E8F0', // slate-200

  // Text
  textPrimary: '#0F172A', // slate-900
  textSecondary: '#475569', // slate-600
  textMuted: '#94A3B8', // slate-400
  textOnDark: '#FFFFFF',

  // Accents (mirror web)
  primary: '#2563EB', // blue-600 (primary action buttons)
  primaryDark: '#1D4ED8', // blue-700
  primarySoft: '#DBEAFE', // blue-100
  purple: '#9333EA',
  pink: '#EC4899',
  green: '#16A34A',
  greenSoft: '#DCFCE7',
  amber: '#F59E0B',
  amberSoft: '#FEF3C7',
  star: '#EAB308', // yellow-500
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
} as const;

// Gradient pairs used for feature tiles (start -> end).
export const gradients = {
  chat: ['#2563EB', '#1D4ED8'] as const,
  voice: ['#9333EA', '#7C3AED'] as const,
  lessons: ['#F97316', '#EF4444'] as const,
  tips: ['#F59E0B', '#F97316'] as const,
  art: ['#A855F7', '#EC4899'] as const,
  games: ['#22D3EE', '#14B8A6'] as const,
  brand: ['#2563EB', '#9333EA'] as const,
} as const;

// Font sizes tuned for older adults — larger than typical mobile defaults.
export const fontSize = {
  xs: 14,
  sm: 16, // floor for body text
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 30,
  display: 36,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '800',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const layout = {
  // Apple HIG / Material minimum tappable size; we keep it generous.
  touchTarget: 56,
  maxContentWidth: 480,
} as const;

export const theme = {
  colors,
  gradients,
  fontSize,
  fontWeight,
  spacing,
  radius,
  layout,
} as const;

export type Theme = typeof theme;
