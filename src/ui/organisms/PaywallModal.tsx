import { useState } from 'react';
import { Modal } from 'react-native';

import { PaywallSheet } from '@/ui/organisms/PaywallSheet';
import { Events, track } from '@/services/analytics/analytics';
import { billing } from '@/services/billing/billing';
import { useSessionStore } from '@/store/sessionStore';

/** The billing screen as a full-screen slide-up Modal. Controlled via `visible`. */
export function PaywallModal({
  visible,
  onClose,
  source = 'modal',
}: {
  visible: boolean;
  onClose: () => void;
  source?: string;
}) {
  const setEntitlement = useSessionStore((s) => s.setEntitlement);
  const [busy, setBusy] = useState(false);

  const subscribe = async (planId: string) => {
    setBusy(true);
    track(Events.trialStarted, { plan: planId, source });
    try {
      const { entitlement } = await billing.purchase(planId);
      setEntitlement(entitlement);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}>
      <PaywallSheet onClose={onClose} onSubscribe={subscribe} subscribing={busy} />
    </Modal>
  );
}
