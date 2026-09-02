/**
 * SINGLE source of visual truth for the entire app.
 *
 * The competitor audit (PLAN.md) flagged jarring light -> dark -> light swings across
 * the onboarding funnel. We deliberately ship ONE palette and use it on every screen.
 * Do not branch on color scheme in onboarding or (app) screens - import from here.
 */

export const Brand = {
  // Surfaces (dark-first: hero imagery, results and paywall read best on near-black)
  bg: '#0B0B0F',
  surface: '#141419',
  surfaceElevated: '#1C1C23',
  surfaceSelected: '#26262F',
  border: '#2A2A33',
  overlay: 'rgba(0,0,0,0.6)',

  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A0AB',
  textMuted: '#6C6C78',
  textOnAccent: '#FFFFFF',

  // Accent (Aragon-adjacent warm orange)
  accent: '#F5620E',
  accentPressed: '#D8530A',
  accentSoft: 'rgba(245,98,14,0.14)',

  // Status
  success: '#2FBF71',
  danger: '#FF5A5A',
  warning: '#F5B62E',

  // Skeleton shimmer (kept clearly distinct so a loading gap never reads as "broken")
  skeletonBase: '#1F1F27',
  skeletonHighlight: '#3C3C48',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const Type = {
  hero: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 23, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  button: { fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
} as const;

/**
 * Light UI palette — the theme the Aragon video uses for the onboarding funnel
 * (white surfaces, near-black text, orange accent). Onboarding screens use this.
 */
export const UI = {
  bg: '#FFFFFF',
  surface: '#F5F5F7',
  surfaceElevated: '#FFFFFF',
  surfaceSelected: '#FDEEE4',
  border: '#E5E5EA',
  text: '#0B0B0F',
  textSecondary: '#5B5B66',
  textMuted: '#8A8A94',
  textOnAccent: '#FFFFFF',
  accent: '#F5620E',
  accentPressed: '#D8530A',
  accentSoft: 'rgba(245,98,14,0.10)',
  success: '#1FA971',
  danger: '#E0413E',
  overlay: 'rgba(0,0,0,0.55)',
  skeletonBase: '#ECECEF',
  skeletonHighlight: '#DCDCE1',
} as const;

/** Light navigation theme matching the onboarding UI. */
export const navTheme = {
  dark: false,
  colors: {
    primary: UI.accent,
    background: UI.bg,
    card: UI.bg,
    text: UI.text,
    border: UI.border,
    notification: UI.accent,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};
