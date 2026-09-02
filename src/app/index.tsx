import { Redirect } from 'expo-router';

import { useSessionStore } from '@/store/sessionStore';

/** Entry: returning subscribers go straight to the app; everyone else starts onboarding. */
export default function Index() {
  const authed = useSessionStore((s) => s.authed);
  const entitlement = useSessionStore((s) => s.entitlement);

  if (authed && entitlement !== 'none') {
    return <Redirect href="/(app)/dashboard" />;
  }
  return <Redirect href="/onboarding" />;
}
