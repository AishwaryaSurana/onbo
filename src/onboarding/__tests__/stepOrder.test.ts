import type { Flags } from '@/config/flags';
import { assertOrderInvariant, buildStepOrder } from '@/onboarding/stepOrder';

const base: Flags = {
  paywallPlacement: 'post_signup',
  paywallStyle: 'soft',
  quizEnabled: true,
  forceGenerationFailure: false,
};

describe('buildStepOrder', () => {
  it('keeps the audit invariant: paywall after resultReveal AND signup (PLAN.md 4.2)', () => {
    const steps = buildStepOrder(base);
    const id = (s: string) => steps.findIndex((x) => x.id === s);
    expect(id('paywall')).toBeGreaterThan(id('resultReveal'));
    expect(id('paywall')).toBeGreaterThan(id('signup'));
  });

  it('aha moment precedes auth: resultReveal before signup', () => {
    const steps = buildStepOrder(base);
    const id = (s: string) => steps.findIndex((x) => x.id === s);
    expect(id('resultReveal')).toBeGreaterThan(-1);
    expect(id('resultReveal')).toBeLessThan(id('signup'));
  });

  it('drops personalization when quizEnabled is false', () => {
    expect(buildStepOrder({ ...base, quizEnabled: false }).some((s) => s.id === 'personalization')).toBe(
      false,
    );
  });

  it('removes the paywall from onboarding when paywallPlacement is day_2', () => {
    const steps = buildStepOrder({ ...base, paywallPlacement: 'day_2' });
    expect(steps.some((s) => s.id === 'paywall')).toBe(false);
    expect(steps[steps.length - 1].id).toBe('signup');
  });

  it('assertOrderInvariant throws in __DEV__ when paywall is misplaced', () => {
    const bad = [{ id: 'paywall' }, { id: 'resultReveal' }, { id: 'signup' }] as const;
    expect(() => assertOrderInvariant([...bad])).toThrow(/Invariant violated/);
  });
});
