import { StyleSheet, View } from 'react-native';

import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { StepScaffold } from '@/onboarding/StepScaffold';
import { WELCOME_AFTER, WELCOME_BEFORE } from '@/onboarding/manifest';
import { Brand, Radii, Spacing, Type } from '@/theme';

const RATING = '4.8';
const USERS = '2,683,000';

/** PLAN.md 3.1 — auto-playing before/after, social proof, ONE CTA (no competing buttons). */
export function Welcome() {
  const { next } = useSequencer();

  return (
    <StepScaffold
      hideHeader
      scroll={false}
      footer={
        <PrimaryButton
          label="Continue"
          onPress={next}
          accessibilityHint="Start setting up your AI photos"
        />
      }>
      <View style={styles.hero}>
        <BeforeAfterSlider before={WELCOME_BEFORE} after={WELCOME_AFTER} height={420} autoPlay />
      </View>

      <View style={styles.proofRow}>
        <View style={styles.proofItem}>
          <ThemedText style={Type.title}>{RATING}★</ThemedText>
          <ThemedText color="textSecondary" style={Type.caption}>
            Average rating
          </ThemedText>
        </View>
        <View style={styles.divider} />
        <View style={styles.proofItem}>
          <ThemedText style={Type.title}>{USERS}</ThemedText>
          <ThemedText color="textSecondary" style={Type.caption}>
            Photos created for people
          </ThemedText>
        </View>
      </View>

      <View style={styles.copy}>
        <ThemedText style={Type.hero}>Studio-quality photos of you</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          Upload a few selfies. Get professional headshots and more in minutes.
        </ThemedText>
      </View>
    </StepScaffold>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: Spacing.sm },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    backgroundColor: Brand.surface,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.md,
  },
  proofItem: { alignItems: 'center', gap: 2, flex: 1 },
  divider: { width: StyleSheet.hairlineWidth, height: 36, backgroundColor: Brand.border },
  copy: { gap: Spacing.sm, marginTop: 'auto' },
});
