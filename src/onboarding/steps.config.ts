import type { ComponentType } from 'react';

import { flags } from '@/config/flags';
import { buildStepOrder, type StepId, type StepMeta } from '@/onboarding/stepOrder';

import { Generating } from './pages/Generating';
import { Paywall } from './pages/Paywall';
import { Personalization } from './pages/Personalization';
import { PhotoCapture } from './pages/PhotoCapture';
import { ResultReveal } from './pages/ResultReveal';
import { Signup } from './pages/Signup';
import { Welcome } from './pages/Welcome';

export type StepDef = StepMeta & { component: ComponentType };

const COMPONENTS: Record<StepId, ComponentType> = {
  welcome: Welcome,
  personalization: Personalization,
  photoCapture: PhotoCapture,
  generating: Generating,
  resultReveal: ResultReveal,
  signup: Signup,
  paywall: Paywall,
};

/** Active step list = flag-composed order (stepOrder.ts) + component mapping. */
export function buildSteps(): StepDef[] {
  return buildStepOrder(flags).map((s) => ({ ...s, component: COMPONENTS[s.id] }));
}
