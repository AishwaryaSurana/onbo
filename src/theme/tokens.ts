/**
 * Design tokens — the single source of visual truth.
 *
 * The competitor audit (PLAN.md) flagged jarring light → dark → light swings across the
 * funnel, so the app ships ONE light palette used on every screen. Do not branch on the
 * device colour scheme — import from `@/theme`.
 */

/** Light palette: white surfaces, near-black text, warm-orange accent (Aragon-adjacent). */
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

/** 4-based spacing scale. */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Corner radii. `pill` is a large value used for fully-rounded elements. */
export const Radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Type ramp — spread onto a `<Text>`/`ThemedText` style prop. */
export const Type = {
  hero: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 23, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  button: { fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
} as const;
