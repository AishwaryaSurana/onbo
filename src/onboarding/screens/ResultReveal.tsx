import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { photoImageSource, resultImageSource } from '@/onboarding/manifest';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Brand, Radii, Spacing, Type } from '@/theme';

/** PLAN.md 3.7 — the aha moment. Full-bleed before/after of the user's OWN photo,
 *  shown BEFORE any signup or paywall. */
export function ResultReveal() {
  const { next, jumpTo } = useSequencer();
  const goal = useOnboardingStore((s) => s.goal) ?? 'exploring';
  const resultStyleId = useOnboardingStore((s) => s.resultStyleId);
  const photoUri = useOnboardingStore((s) => s.photoUri);
  const photoSource = useOnboardingStore((s) => s.photoSource);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.head}>
        <ThemedText style={Type.title}>Here&apos;s your preview</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          Drag to compare. This is a low-res sample — your pack renders in full quality.
        </ThemedText>
      </View>

      <View style={styles.stage}>
        <BeforeAfterSlider
          before={photoImageSource(photoUri, photoSource)}
          after={resultImageSource(goal, resultStyleId)}
          height={460}
          radius={Radii.xl}
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Save this look"
          onPress={next}
          accessibilityHint="Create your account to keep this result"
        />
        <PrimaryButton
          label="Try another style"
          variant="ghost"
          onPress={() => jumpTo('styleTeaser')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.bg, paddingHorizontal: Spacing.lg },
  head: { gap: Spacing.sm, paddingTop: Spacing.sm },
  stage: { flex: 1, justifyContent: 'center', paddingVertical: Spacing.lg },
  footer: { gap: Spacing.sm, paddingBottom: Spacing.sm },
});
