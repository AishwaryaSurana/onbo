/**
 * Analytics — every event from PLAN.md §6. Console logger now; single swap point for
 * PostHog/Segment later. Screen code and the sequencer only ever call `track()`.
 */

export const Events = {
  onboardingStarted: 'onboarding_started',
  goalSelected: 'goal_selected',
  styleTeaserViewed: 'style_teaser_viewed',
  styleTeaserSkipped: 'style_teaser_skipped',
  permissionPrimerShown: 'permission_primer_shown',
  permissionGranted: 'permission_granted',
  permissionDenied: 'permission_denied',
  photoCaptured: 'photo_captured',
  generationStarted: 'generation_started',
  generationCompleted: 'generation_completed',
  generationFailed: 'generation_failed',
  resultViewed: 'result_viewed',
  signupStarted: 'signup_started',
  signupCompleted: 'signup_completed',
  paywallViewed: 'paywall_viewed',
  trialStarted: 'trial_started',
  trialConvertedToPaid: 'trial_converted_to_paid',
  dashboardReached: 'dashboard_reached',
} as const;

export type AnalyticsEvent = (typeof Events)[keyof typeof Events];

type Props = Record<string, string | number | boolean | null | undefined>;

let sessionStart = Date.now();

export function resetAnalyticsClock() {
  sessionStart = Date.now();
}

export function track(event: AnalyticsEvent, props?: Props) {
  const elapsed = ((Date.now() - sessionStart) / 1000).toFixed(1);
  // eslint-disable-next-line no-console
  console.log(`[analytics +${elapsed}s] ${event}`, props ?? {});
}
