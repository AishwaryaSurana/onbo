import { TabPaywallGate, TabScreen } from '@/ui/organisms';
import { AI_PHOTO_CHIPS, AI_PHOTO_SECTIONS } from '@/onboarding/manifest';

export default function AIPhotos() {
  return (
    <>
      <TabScreen
        subtitle="Create stunning AI photos in seconds."
        chips={AI_PHOTO_CHIPS}
        sections={AI_PHOTO_SECTIONS}
      />
      <TabPaywallGate />
    </>
  );
}
