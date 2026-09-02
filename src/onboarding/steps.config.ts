import type { ComponentType } from 'react';

import { flags } from '@/config/flags';
import { buildStepOrder, type StepId, type StepMeta } from '@/onboarding/stepOrder';

import { Generating } from './screens/Generating';
import { Paywall } from './screens/Paywall';
import { PermissionPrimer } from './screens/PermissionPrimer';
import { Personalization } from './screens/Personalization';
import { PhotoCapture } from './screens/PhotoCapture';
import { ResultReveal } from './screens/ResultReveal';
import { Signup } from './screens/Signup';
import { StyleTeaser } from './screens/StyleTeaser';
import { Welcome } from './screens/Welcome';

export type StepDef = StepMeta & { component: ComponentType };

const COMPONENTS: Record<StepId, ComponentType> = {
  welcome: Welcome,
  personalization: Personalization,
  styleTeaser: StyleTeaser,
  permissionPrimer: PermissionPrimer,
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
