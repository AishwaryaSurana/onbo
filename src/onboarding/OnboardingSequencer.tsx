import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { SequencerContext, type SequencerApi } from '@/onboarding/SequencerContext';
import { buildSteps } from '@/onboarding/steps.config';
import { track } from '@/services/analytics/analytics';
import { useOnboardingStore } from '@/store/onboardingStore';

/**
 * Config-driven onboarding host (PLAN.md §5). Renders the current step component,
 * owns next/back/skip, fires each step's analyticsKey on enter, and hands off to
 * the dashboard at the end. Steps do NOT navigate via the router.
 */
export function OnboardingSequencer() {
  const steps = useMemo(() => buildSteps(), []);
  const router = useRouter();

  const stepIndex = useOnboardingStore((s) => s.stepIndex);
  const setStepIndex = useOnboardingStore((s) => s.setStepIndex);
  const safeIndex = Math.min(Math.max(stepIndex, 0), steps.length - 1);
  const step = steps[safeIndex];

  const firedFor = useRef<string | null>(null);
  useEffect(() => {
    if (firedFor.current === step.id) return;
    firedFor.current = step.id;
    if (step.analyticsKey) track(step.analyticsKey, { step: step.id, index: safeIndex });
  }, [step.id, step.analyticsKey, safeIndex]);

  const goToDashboard = useCallback(() => {
    router.replace('/(app)/dashboard');
  }, [router]);

  const next = useCallback(() => {
    if (safeIndex >= steps.length - 1) {
      goToDashboard();
      return;
    }
    setStepIndex(safeIndex + 1);
  }, [safeIndex, steps.length, setStepIndex, goToDashboard]);

  const back = useCallback(() => {
    if (safeIndex <= 0) return;
    setStepIndex(safeIndex - 1);
  }, [safeIndex, setStepIndex]);

  const skip = useCallback(() => next(), [next]);

  const jumpTo = useCallback(
    (stepId: string) => {
      const target = steps.findIndex((s) => s.id === stepId);
      if (target >= 0) setStepIndex(target);
    },
    [steps, setStepIndex],
  );

  const api: SequencerApi = useMemo(
    () => ({
      next,
      back,
      skip,
      jumpTo,
      goToDashboard,
      stepId: step.id,
      index: safeIndex,
      total: steps.length,
      canGoBack: safeIndex > 0,
      skippable: step.skippable,
      progress: steps.length > 1 ? safeIndex / (steps.length - 1) : 1,
    }),
    [next, back, skip, jumpTo, goToDashboard, step.id, step.skippable, safeIndex, steps.length],
  );

  const Screen = step.component;

  return (
    <SequencerContext.Provider value={api}>
      <Screen />
    </SequencerContext.Provider>
  );
}
