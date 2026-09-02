import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal } from 'react-native';

import { PaywallSheet } from '@/components/PaywallSheet';
import { Events, track } from '@/services/analytics/analytics';
import { billing } from '@/services/billing/billing';
import { useSessionStore } from '@/store/sessionStore';

/**
 * Drop into a tab screen to gate it behind the paywall for non-subscribers.
 * Shows the PaywallSheet (in a top-level Modal) every time the tab gains focus while
 * there's no entitlement; dismissing just reveals the tab's browse screen behind it.
 */
export function TabPaywallGate() {
  const entitlement = useSessionStore((s) => s.entitlement);
  const setEntitlement = useSessionStore((s) => s.setEntitlement);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (entitlement === 'none') {
        setOpen(true);
        track(Events.paywallViewed, { source: 'tab_gate' });
      }
      return () => setOpen(false);
    }, [entitlement]),
  );

  const close = () => setOpen(false);

  const subscribe = async (planId: string) => {
    setBusy(true);
    track(Events.trialStarted, { plan: planId, source: 'tab_gate' });
    try {
      const { entitlement: ent } = await billing.purchase(planId);
      setEntitlement(ent);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal transparent visible={open} statusBarTranslucent animationType="slide" onRequestClose={close}>
      <PaywallSheet onClose={close} onSubscribe={subscribe} subscribing={busy} />
    </Modal>
  );
}
