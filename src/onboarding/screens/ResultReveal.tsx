import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { photoImageSource, resultImageSource, STYLE_SETS } from '@/onboarding/manifest';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Radii, Spacing, Type, UI } from '@/theme';

/** Step 4 (payoff) — the aha moment. Before/after of the user's OWN photo, shown BEFORE
 *  any signup or paywall. */
export function ResultReveal() {
  const { next, jumpTo } = useSequencer();
  const goal = useOnboardingStore((s) => s.goal) ?? 'exploring';
  const resultStyleId = useOnboardingStore((s) => s.resultStyleId);
  const setChosenStyle = useOnboardingStore((s) => s.setChosenStyle);
  const photoUri = useOnboardingStore((s) => s.photoUri);
  const photoSource = useOnboardingStore((s) => s.photoSource);

  const tryAnother = () => {
    const set = STYLE_SETS[goal];
    const i = set.findIndex((s) => s.id === resultStyleId);
    setChosenStyle(set[(i + 1) % set.length].id);
    jumpTo('generating');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.head}>
        <ThemedText style={Type.title}>Whoa — that&apos;s you</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          Drag to compare. Preview is low-res; your full render is crisp and watermark-free.
        </ThemedText>
      </View>

      <View style={styles.stage}>
        <BeforeAfterSlider
          before={photoImageSource(photoUri, photoSource)}
          after={resultImageSource(goal, resultStyleId)}
          height={460}
          radius={Radii.xl}
          autoPlay
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Save this look"
          onPress={next}
          accessibilityHint="Create an account to keep this result"
        />
        <PrimaryButton label="Try a different look" variant="ghost" onPress={tryAnother} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UI.bg, paddingHorizontal: Spacing.lg },
  head: { gap: Spacing.sm, paddingTop: Spacing.sm },
  stage: { flex: 1, justifyContent: 'center', paddingVertical: Spacing.lg },
  footer: { gap: Spacing.sm, paddingBottom: Spacing.sm },
});
