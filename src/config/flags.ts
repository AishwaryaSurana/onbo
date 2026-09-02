/**
 * Feature flags — local stub now, swappable for Statsig/LaunchDarkly later (PLAN.md §5).
 * Drives onboarding step composition and paywall behavior without touching screen code.
 */

export type PaywallPlacement = 'post_signup' | 'post_result' | 'day_2';
export type PaywallStyle = 'soft' | 'hard';

export interface Flags {
  /** Where the paywall step sits in the onboarding sequence. 'day_2' removes it from onboarding entirely. */
  paywallPlacement: PaywallPlacement;
  /** 'soft' = decline continues to a reduced dashboard; 'hard' = decline is blocked. */
  paywallStyle: PaywallStyle;
  /** Toggles the goal-personalization step. */
  quizEnabled: boolean;
  /** Force the AI generation mock to fail, to exercise the error/retry path (PLAN.md 4.1). */
  forceGenerationFailure: boolean;
}

export const flags: Flags = {
  paywallPlacement: 'post_signup',
  paywallStyle: 'soft',
  quizEnabled: true,
  forceGenerationFailure: false,
};
