import { useState } from 'react';

import { PaywallSheet } from '@/ui/organisms';
import { useSequencer } from '@/onboarding/SequencerContext';
import { Events, track } from '@/services/analytics/analytics';
import { billing } from '@/services/billing/billing';
import { useSessionStore } from '@/store/sessionStore';

/** Step 6 — contextual paywall. `PaywallSheet` also powers the AI Photos / AI Editor gate. */
export function Paywall() {
  const { next, goToDashboard } = useSequencer();
  const setEntitlement = useSessionStore((s) => s.setEntitlement);
  const [busy, setBusy] = useState(false);

  const subscribe = async (planId: string) => {
    setBusy(true);
    track(Events.trialStarted, { plan: planId });
    try {
      const { entitlement } = await billing.purchase(planId);
      setEntitlement(entitlement);
      goToDashboard();
    } finally {
      setBusy(false);
    }
  };

  return <PaywallSheet onClose={next} onSubscribe={subscribe} subscribing={busy} />;
}
