import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollageMarquee } from '@/components/CollageMarquee';
import { Laurels } from '@/components/Laurels';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useSequencer } from '@/onboarding/SequencerContext';
import { Radii, Spacing } from '@/theme';

// This screen intentionally matches the video's LIGHT welcome screen.
const LIGHT = {
  bg: '#FFFFFF',
  text: '#0B0B0F',
  secondary: '#5B5B66',
  muted: '#8A8A94',
};

/** PLAN.md 3.1 — sliding collage of AI photos, laurel social proof, ONE CTA. */
export function Welcome() {
  const { next } = useSequencer();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: LIGHT.bg }]}>
      <CollageMarquee fadeColor={LIGHT.bg} style={styles.collage} />

      <View style={[styles.card, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={styles.stats}>
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: LIGHT.secondary }]}>Average rating</Text>
            <Laurels size={38}>
              <Text style={[styles.statValue, { color: LIGHT.text }]}>4.8</Text>
              <Text style={styles.stars}>★★★★★</Text>
            </Laurels>
          </View>

          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: LIGHT.secondary }]}>Trusted by over</Text>
            <Laurels size={38}>
              <Text
                style={[styles.statValue, styles.statValueNum, { color: LIGHT.text }]}
                numberOfLines={1}>
                2,683,000
              </Text>
              <Text style={[styles.statSub, { color: LIGHT.muted }]}>professionals</Text>
            </Laurels>
          </View>
        </View>

        <Text style={[styles.title, { color: LIGHT.text }]}>Welcome to Aragon</Text>
        <Text style={[styles.subtitle, { color: LIGHT.secondary }]}>
          Stunning photos, videos, edits,{'\n'}and perfect headshots.
        </Text>

        <PrimaryButton
          label="Continue"
          onPress={next}
          style={styles.cta}
          accessibilityHint="Start setting up your AI photos"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  collage: { flex: 1 },
  card: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  statCol: { alignItems: 'center', gap: 3, flexShrink: 1 },
  statLabel: { fontSize: 12, fontWeight: '500' },
  statValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  statValueNum: { fontSize: 17 },
  stars: { fontSize: 10, color: '#F5A623', letterSpacing: 1 },
  statSub: { fontSize: 11, fontWeight: '500' },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 16, lineHeight: 22, textAlign: 'center' },
  cta: { alignSelf: 'stretch', borderRadius: Radii.pill, marginTop: Spacing.xs },
});
