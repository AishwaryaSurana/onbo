import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SkeletonImage } from '@/components/SkeletonImage';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { photoImageSource } from '@/onboarding/manifest';
import { STAGE_COPY, aiGeneration, type GenStage } from '@/services/aiGeneration';
import { Events, track } from '@/services/analytics/analytics';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Brand, Radii, Spacing, Type } from '@/theme';

const STAGES: GenStage[] = ['analyzing', 'styling', 'finishing'];

/** PLAN.md 3.6 — determinate multi-stage status, never a bare spinner on blank.
 *  On failure: a real error + retry state (PLAN.md 4.1). */
export function Generating() {
  const { next } = useSequencer();
  const goal = useOnboardingStore((s) => s.goal) ?? 'exploring';
  const chosenStyleId = useOnboardingStore((s) => s.chosenStyleId);
  const photoUri = useOnboardingStore((s) => s.photoUri);
  const photoSource = useOnboardingStore((s) => s.photoSource);
  const setResultStyle = useOnboardingStore((s) => s.setResultStyle);

  const [stage, setStage] = useState<GenStage>('analyzing');
  const [failed, setFailed] = useState(false);
  const runId = useRef(0);

  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1);
  }, [spin]);
  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));

  const run = () => {
    const id = ++runId.current;
    setFailed(false);
    setStage('analyzing');
    track(Events.generationStarted, { goal, styleId: chosenStyleId ?? 'auto' });
    aiGeneration
      .generate({ photoUri: photoUri ?? '', goal, styleId: chosenStyleId }, (s) => {
        if (runId.current === id) setStage(s);
      })
      .then((out) => {
        if (runId.current !== id) return;
        setResultStyle(out.styleId);
        track(Events.generationCompleted, { styleId: out.styleId });
        next();
      })
      .catch((err: Error) => {
        if (runId.current !== id) return;
        track(Events.generationFailed, { reason: err.message });
        setFailed(true);
      });
  };

  useEffect(run, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ThemedText style={styles.emoji}>😕</ThemedText>
          <ThemedText style={Type.title}>That render didn&apos;t finish</ThemedText>
          <ThemedText color="textSecondary" style={[Type.body, styles.centerText]}>
            Your photo is safe. This usually works on a second try.
          </ThemedText>
        </View>
        <View style={styles.footer}>
          <PrimaryButton label="Try again" onPress={run} />
        </View>
      </SafeAreaView>
    );
  }

  const stageNum = STAGES.indexOf(stage) + 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <View style={styles.thumbWrap}>
          <SkeletonImage
            source={photoImageSource(photoUri, photoSource)}
            style={styles.thumb}
            radius={Radii.xl}
          />
          <Animated.View style={[styles.ring, ring]} />
        </View>

        <ThemedText style={Type.title}>Creating your preview</ThemedText>
        <ThemedText color="textSecondary" style={[Type.body, styles.centerText]}>
          {STAGE_COPY[stage]}
        </ThemedText>

        <View style={styles.dots}>
          {STAGES.map((s, i) => (
            <View key={s} style={[styles.dot, i < stageNum && styles.dotOn]} />
          ))}
        </View>
        <ThemedText color="textMuted" style={Type.caption}>
          Step {stageNum} of {STAGES.length} · about 10 seconds
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.bg, paddingHorizontal: Spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  centerText: { textAlign: 'center' },
  emoji: { fontSize: 44 },
  thumbWrap: { width: 168, height: 168, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 140, height: 140 },
  ring: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 3,
    borderColor: Brand.accent,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  dots: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  dot: { width: 28, height: 4, borderRadius: 2, backgroundColor: Brand.border },
  dotOn: { backgroundColor: Brand.accent },
  footer: { gap: Spacing.sm, paddingBottom: Spacing.sm },
});
