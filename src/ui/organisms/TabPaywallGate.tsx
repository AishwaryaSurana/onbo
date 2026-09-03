import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { PaywallModal } from '@/ui/organisms/PaywallModal';
import { Events, track } from '@/services/analytics/analytics';
import { useSessionStore } from '@/store/sessionStore';

/**
 * Drop into a tab screen: the billing screen appears as a full-screen Modal every time
 * the tab gains focus (unless the user has already subscribed). Dismissing just reveals
 * the tab's browse screen behind it.
 */
export function TabPaywallGate() {
  const entitlement = useSessionStore((s) => s.entitlement);
  const [open, setOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (entitlement === 'paid') return; // already fully subscribed — no gate
      setOpen(true);
      track(Events.paywallViewed, { source: 'tab_gate' });
      return () => setOpen(false);
    }, [entitlement]),
  );

  return <PaywallModal visible={open} onClose={() => setOpen(false)} source="tab_gate" />;
}
