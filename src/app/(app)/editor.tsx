import { TabPaywallGate, TabScreen } from '@/ui/organisms';
import { AI_EDITOR_CHIPS, AI_EDITOR_SECTIONS } from '@/onboarding/manifest';

export default function AIEditor() {
  return (
    <>
      <TabScreen
        subtitle="Edit your photos to perfection with advanced AI."
        chips={AI_EDITOR_CHIPS}
        sections={AI_EDITOR_SECTIONS}
      />
      <TabPaywallGate />
    </>
  );
}
