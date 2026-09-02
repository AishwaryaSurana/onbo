/**
 * Image manifest for onboarding.
 *
 * Bundled placeholder photos (assets/onboarding/p01..p16.jpg). Swap any require() for a
 * licensed asset — no screen code changes. `SkeletonImage` shimmers while decoding and
 * shows a defined fallback if a source is missing, so a hero area is never blank.
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
  before: ImgSource;
  after: ImgSource;
}

function opt(id: string, label: string, beforeIdx: number, afterIdx: number): StyleOption {
  return { id, label, before: P[beforeIdx], after: P[afterIdx] };
}

/** Result options keyed by the goal picked in Personalization — drives the aha-moment edit. */
export const STYLE_SETS: Record<Goal, StyleOption[]> = {
  reels: [
    opt('rl-vibrant', 'Vibrant pop', 0, 8),
    opt('rl-cinema', 'Cinematic', 1, 9),
    opt('rl-neon', 'Neon night', 2, 10),
  ],
  portraits: [
    opt('pt-studio', 'Studio', 2, 10),
    opt('pt-golden', 'Golden hour', 3, 11),
    opt('pt-editorial', 'Editorial', 4, 12),
  ],
  thumbnails: [
    opt('th-bold', 'Bold & punchy', 5, 13),
    opt('th-clean', 'Clean', 6, 14),
    opt('th-contrast', 'High contrast', 7, 15),
  ],
  exploring: [
    opt('ex-clean', 'Clean', 12, 4),
    opt('ex-warm', 'Warm', 13, 5),
    opt('ex-bw', 'Black & white', 14, 6),
  ],
};

/** Curated stock portrait used when the user declines photo access (PLAN.md 3.5). */
export const STOCK_PORTRAIT = P[2];

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

/** Template result shown full-screen on the Welcome screen (same subject, polished grade). */
export const WELCOME_BEFORE = P[10];
export const WELCOME_AFTER = P[10];

/** Dashboard category tiles, keyed by name. Ordering per goal lives in the dashboard. */
export const DASHBOARD_TILES: Record<string, ImgSource[]> = {
  'Reels & TikToks': [P[8], P[9], P[10]],
  'Portraits & Selfies': [P[10], P[11], P[2]],
  'YouTube Thumbnails': [P[13], P[14], P[15]],
  'Trending Templates': [P[0], P[1], P[3]],
};
