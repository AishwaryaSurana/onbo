import { useEffect } from 'react';

import { OnboardingSequencer } from '@/onboarding/OnboardingSequencer';
import { resetAnalyticsClock } from '@/services/analytics/analytics';

export default function OnboardingRoute() {
  useEffect(() => {
    resetAnalyticsClock();
  }, []);

  return <OnboardingSequencer />;
}
