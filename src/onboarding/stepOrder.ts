/**
 * Pure step-ordering logic (no component imports) so the audit invariant is unit-testable.
 * `steps.config.ts` maps these ids to screen components.
 */
import type { Flags } from '@/config/flags';
import { Events, type AnalyticsEvent } from '@/services/analytics/analytics';

export type StepId =
  | 'welcome'
  | 'personalization'
  | 'styleTeaser'
  | 'permissionPrimer'
  | 'photoCapture'
  | 'generating'
  | 'resultReveal'
  | 'signup'
  | 'paywall';

export interface StepMeta {
  id: StepId;
  analyticsKey?: AnalyticsEvent;
  skippable: boolean;
}

const BASE: StepMeta[] = [
  { id: 'welcome', analyticsKey: Events.onboardingStarted, skippable: false },
  { id: 'personalization', skippable: true },
  { id: 'styleTeaser', analyticsKey: Events.styleTeaserViewed, skippable: true },
  { id: 'permissionPrimer', analyticsKey: Events.permissionPrimerShown, skippable: false },
  { id: 'photoCapture', skippable: false },
  { id: 'generating', skippable: false },
  { id: 'resultReveal', analyticsKey: Events.resultViewed, skippable: false },
  { id: 'signup', skippable: false },
  { id: 'paywall', analyticsKey: Events.paywallViewed, skippable: false },
];

export function buildStepOrder(flags: Flags): StepMeta[] {
  let steps = [...BASE];
  if (!flags.quizEnabled) steps = steps.filter((s) => s.id !== 'personalization');
  if (flags.paywallPlacement === 'day_2') steps = steps.filter((s) => s.id !== 'paywall');
  assertOrderInvariant(steps);
  return steps;
}

/** PLAN.md 4.2 — the paywall must never precede the user's own result, or signup. */
export function assertOrderInvariant(steps: Pick<StepMeta, 'id'>[]) {
  const idx = (id: StepId) => steps.findIndex((s) => s.id === id);
  const paywall = idx('paywall');
  if (paywall === -1) return;
  if (paywall < idx('resultReveal') || paywall < idx('signup')) {
    const msg =
      '[stepOrder] Invariant violated: `paywall` must come after `resultReveal` AND `signup` (PLAN.md 4.2).';
    if (typeof __DEV__ !== 'undefined' && __DEV__) throw new Error(msg);
    // eslint-disable-next-line no-console
    console.error(msg);
  }
}
