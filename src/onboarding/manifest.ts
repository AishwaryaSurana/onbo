/**
 * Image manifest for onboarding.
 *
 * These are bundled placeholder photos (assets/onboarding/p01..p16.jpg). Swap any entry
 * for a licensed before/after pair by editing the require() below — no screen code changes
 * (PLAN.md §Assumptions).
 *
 * `SkeletonImage` still renders a shimmer while decoding and a defined fallback if a
 * source is ever missing, so a hero area is never a blank gap (PLAN.md 4.1).
 */
import type { Goal } from '@/store/onboardingStore';

// Static requires so Metro bundles them.
const P = [
  require('@/assets/onboarding/p01.jpg'),
  require('@/assets/onboarding/p02.jpg'),
  require('@/assets/onboarding/p03.jpg'),
  require('@/assets/onboarding/p04.jpg'),
  require('@/assets/onboarding/p05.jpg'),
  require('@/assets/onboarding/p06.jpg'),
  require('@/assets/onboarding/p07.jpg'),
  require('@/assets/onboarding/p08.jpg'),
  require('@/assets/onboarding/p09.jpg'),
  require('@/assets/onboarding/p10.jpg'),
  require('@/assets/onboarding/p11.jpg'),
  require('@/assets/onboarding/p12.jpg'),
  require('@/assets/onboarding/p13.jpg'),
  require('@/assets/onboarding/p14.jpg'),
  require('@/assets/onboarding/p15.jpg'),
  require('@/assets/onboarding/p16.jpg'),
] as const;

export type ImgSource = (typeof P)[number];

export interface StyleOption {
  id: string;
  label: string;
  thumb: ImgSource;
  before: ImgSource;
  after: ImgSource;
}

function opt(id: string, label: string, beforeIdx: number, afterIdx: number): StyleOption {
  return { id, label, thumb: P[afterIdx], before: P[beforeIdx], after: P[afterIdx] };
}

/** Style teaser + result options, keyed by the goal picked in Personalization. */
export const STYLE_SETS: Record<Goal, StyleOption[]> = {
  headshots: [
    opt('hs-exec', 'Executive', 0, 8),
    opt('hs-studio', 'Studio', 1, 9),
    opt('hs-outdoor', 'Outdoor', 2, 10),
    opt('hs-editorial', 'Editorial', 3, 11),
  ],
  dating: [
    opt('dt-golden', 'Golden hour', 4, 12),
    opt('dt-city', 'City', 5, 13),
    opt('dt-casual', 'Casual', 6, 14),
    opt('dt-travel', 'Travel', 7, 15),
  ],
  creative: [
    opt('cr-film', 'Film', 8, 0),
    opt('cr-retro', 'Retro', 9, 1),
    opt('cr-neon', 'Neon', 10, 2),
    opt('cr-paint', 'Painterly', 11, 3),
  ],
  exploring: [
    opt('ex-clean', 'Clean', 12, 4),
    opt('ex-bw', 'Black & white', 13, 5),
    opt('ex-warm', 'Warm', 14, 6),
    opt('ex-bold', 'Bold', 15, 7),
  ],
};

/** Curated stock portrait used when the user declines photo access (PLAN.md 3.5). */
export const STOCK_PORTRAIT = P[6];

/** Resolve the user's source photo to something SkeletonImage can render. */
export function photoImageSource(
  photoUri: string | null,
  photoSource: string | null,
): ImgSource | { uri: string } {
  if (!photoUri || photoSource === 'sample') return STOCK_PORTRAIT;
  return { uri: photoUri };
}

/** Resolve a generated result style id to its "after" image. */
export function resultImageSource(goal: Goal, styleId: string | null): ImgSource {
  const set = STYLE_SETS[goal] ?? STYLE_SETS.exploring;
  return (set.find((s) => s.id === styleId) ?? set[0]).after;
}

/** Hero before/after shown on the Welcome screen. */
export const WELCOME_BEFORE = P[4];
export const WELCOME_AFTER = P[9];

/** Dashboard category tiles (PLAN.md 3.10). */
export const DASHBOARD_TILES: Record<string, ImgSource[]> = {
  'Professional Headshots': [P[8], P[9], P[10]],
  'Dating Photos': [P[12], P[13], P[14]],
  'Creative Styles': [P[0], P[1], P[2]],
  'Background Enhancer': [P[3], P[5], P[7]],
};
