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

/** Welcome (splash) hero before/after slider — [before, after] pairs.
 *  Starts on pair 0; swaps to pair 1 after a delay (see Welcome.tsx). */
export const WELCOME_PAIRS: [ImgSource, ImgSource][] = [
  [require('@/assets/onboarding/hero1.jpg'), require('@/assets/onboarding/hero3.jpg')],
  [require('@/assets/onboarding/hero2.jpg'), require('@/assets/onboarding/hero5.jpg')],
];

/** Full-bleed background for the Sign-in screen. */
export const SIGNIN_BG = P[13];

/** Paywall top carousel cards. */
export const PAYWALL_CARDS: { title: string; sub: string; image: ImgSource }[] = [
  { title: 'Photoshoots', sub: '100+ studio styles', image: P[10] },
  { title: 'Headshots', sub: '100+ studio setups', image: P[8] },
  { title: 'Editing Tools', sub: '100+ AI tools', image: P[3] },
];

/** Avatar strip + reviews on the paywall. */
export const PAYWALL_AVATARS: ImgSource[] = [P[2], P[7], P[11], P[15]];

export const PAYWALL_REVIEWS: { name: string; title: string; body: string }[] = [
  {
    name: 'Julie',
    title: 'Natural results',
    body: "The pictures are really natural looking. I don't look redone or like a stranger — just a nice polished version of myself.",
  },
  {
    name: 'Marcus',
    title: 'Worth it',
    body: 'Had a headshot ready for LinkedIn in ten minutes. Photographer quotes were 20x the price.',
  },
  {
    name: 'Priya',
    title: 'So many looks',
    body: 'I kept generating packs for fun. The outfit and background variety is unreal.',
  },
];

/** Dashboard promo banner carousel. */
export const PROMO_CARDS: { kicker: string; line1: string; line2: string; image: ImgSource }[] = [
  { kicker: 'TRY 100+ PACKS NOW', line1: 'AI Photo', line2: 'GENERATOR', image: P[10] },
  { kicker: 'NEW THIS WEEK', line1: 'Cinematic', line2: 'PORTRAITS', image: P[3] },
  { kicker: 'TRENDING', line1: 'Retro Film', line2: 'LOOKS', image: P[13] },
];

/** Dashboard category tiles, keyed by name. */
export const DASHBOARD_TILES: Record<string, ImgSource[]> = {
  'Professional Headshots': [P[2], P[7], P[10], P[11], P[8]],
  'Dating Photos': [P[3], P[12], P[15], P[4], P[13]],
  'Background Enhancer': [P[0], P[5], P[9], P[1], P[6]],
  'Creative Styles': [P[14], P[1], P[8], P[10], P[7]],
};

/** AI Photos tab content. */
export const AI_PHOTO_CHIPS = ['All', 'New Packs', 'AI Headshots', 'Classy & Formal', 'Outdoor'];
export const AI_PHOTO_SECTIONS: {
  title: string;
  images: ImgSource[];
  cta?: string;
  countdown?: boolean;
}[] = [
  { title: 'New Packs', countdown: true, images: [P[7], P[12], P[15], P[10], P[3]] },
  { title: 'Professional Headshots', cta: 'Create pack', images: [P[2], P[8], P[11], P[7], P[10]] },
  { title: 'Healthcare Headshots', cta: 'Create pack', images: [P[13], P[2], P[11], P[8], P[7]] },
];

/** AI Editor tab content. */
export const AI_EDITOR_CHIPS = ['All', 'Creative & Artsy Filters', 'Face & Body Edits', 'Restore'];
export const AI_EDITOR_SECTIONS: { title: string; images: ImgSource[] }[] = [
  { title: '1990s Camera Filter', images: [P[9], P[10], P[13], P[3], P[12]] },
  { title: 'Decade Portrait Generator', images: [P[1], P[6], P[0], P[5], P[8]] },
  { title: 'Vintage Polaroid Filter', images: [P[4], P[14], P[15], P[13], P[2]] },
];
