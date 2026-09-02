import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { WELCOME_AFTER, WELCOME_BEFORE } from '@/onboarding/manifest';
import { useSequencer } from '@/onboarding/SequencerContext';
import { Spacing } from '@/theme';

/**
 * PLAN.md 3.1 — open straight on the OUTCOME. A full-screen auto-sliding before/after
 * of a template result and one CTA. No pitch, no signup wall, no permission prompt yet.
 */
export function Welcome() {
  const { next } = useSequencer();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <View style={styles.root}>
      <BeforeAfterSlider
        before={WELCOME_BEFORE}
        after={WELCOME_AFTER}
        afterTint="#F0A45E"
        sweep={[0.18, 0.82]}
        height={height}
        radius={0}
        autoPlay
      />

      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.5, 1]}
        style={styles.scrim}
      />

      <View style={[styles.bottom, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Text style={styles.kicker}>4.8 ★   ·   2,683,000+ photos created</Text>
        <Text style={styles.headline}>Studio-quality photos{'\n'}from a few selfies</Text>
        <PrimaryButton
          label="Try it on your photo"
          onPress={next}
          style={styles.cta}
          accessibilityHint="Start with your own photo"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '58%' },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  kicker: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  cta: { alignSelf: 'stretch' },
});
