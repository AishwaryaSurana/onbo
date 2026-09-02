import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProgressBar } from '@/components/ProgressBar';
import { SkeletonImage } from '@/components/SkeletonImage';
import { useSequencer } from '@/onboarding/SequencerContext';
import { STYLE_SETS, TEASERS, TEASER_BASE, TEASER_VARIANTS } from '@/onboarding/manifest';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Radii, Spacing } from '@/theme';

// Matches the video's LIGHT teaser screens.
const LIGHT = { bg: '#FFFFFF', text: '#0B0B0F', muted: '#8A8A94', accent: '#F5620E' };
const SWEEP: [number, number] = [0.36, 0.64]; // keep the divider near centre like the video
const AUTO_MS = 2000;

/** PLAN.md 3.3 — one portrait, auto-sliding before/after; the AFTER side cycles through
 *  looks / outfits / backgrounds / art styles to match each heading (video parity). */
export function StyleTeaser() {
  const { next, back, skip, progress, total } = useSequencer();
  const goal = useOnboardingStore((s) => s.goal) ?? 'exploring';
  const setChosenStyle = useOnboardingStore((s) => s.setChosenStyle);
  const styleSet = STYLE_SETS[goal];

  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(1);
  const teaser = TEASERS[idx];
  const pair = styleSet[idx % styleSet.length];
  const isLast = idx === TEASERS.length - 1;

  const isSwatchMode = idx === 0;
  const base = TEASER_BASE[idx];
  const variants = TEASER_VARIANTS[idx];
  const optionCount = isSwatchMode ? teaser.swatches.length : variants.length;

  // Auto-advance the selection so the AFTER side keeps restyling on its own.
  useEffect(() => {
    setSel(isSwatchMode ? 1 : 0);
    const id = setInterval(() => setSel((s) => (s + 1) % optionCount), AUTO_MS);
    return () => clearInterval(id);
  }, [idx, isSwatchMode, optionCount]);

  const afterImage = isSwatchMode ? base : variants[Math.min(sel, variants.length - 1)];
  const afterTint = isSwatchMode ? teaser.swatches[Math.min(sel, teaser.swatches.length - 1)] : undefined;

  const onBack = () => (idx > 0 ? setIdx(idx - 1) : back());
  const onNext = () => {
    if (!isLast) {
      setIdx(idx + 1);
      return;
    }
    setChosenStyle(pair.id);
    next();
  };

  const stepSpan = total > 1 ? 1 / (total - 1) : 0;
  const barValue = Math.min(1, progress + (idx / TEASERS.length) * stepSpan);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: LIGHT.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={[styles.chevron, { color: LIGHT.text }]}>‹</Text>
        </Pressable>
        <View style={styles.progressWrap}>
          <ProgressBar value={barValue} />
        </View>
        <Pressable onPress={skip} hitSlop={12} accessibilityRole="button">
          <Text style={[styles.skip, { color: LIGHT.muted }]}>SKIP</Text>
        </Pressable>
      </View>

      <Text style={[styles.title, { color: LIGHT.text }]}>{teaser.headline}</Text>

      <View style={styles.stage}>
        <BeforeAfterSlider
          key={idx}
          before={base}
          after={afterImage}
          afterTint={afterTint}
          sweep={SWEEP}
          height={430}
          radius={Radii.lg}
          minimal
          autoPlay
        />
      </View>

      {isSwatchMode ? (
        <View style={styles.swatches}>
          {teaser.swatches.map((color, i) => {
            const active = sel === i;
            return (
              <Pressable
                key={color}
                onPress={() => setSel(i)}
                style={[styles.swatchRing, active && { borderColor: LIGHT.accent }]}>
                <View style={[styles.swatch, { backgroundColor: color }]}>
                  {active && <Text style={styles.check}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbs}>
          {variants.map((img, i) => {
            const active = sel === i;
            return (
              <Pressable key={i} onPress={() => setSel(i)} style={styles.thumbWrap}>
                <SkeletonImage
                  source={img}
                  style={[styles.thumb, active && { borderColor: LIGHT.accent }]}
                  radius={Radii.md}
                  fallbackLabel=""
                />
                {active && (
                  <View style={styles.thumbCheck}>
                    <Text style={styles.thumbCheckTxt}>✓</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <PrimaryButton label="Next" onPress={onNext} style={styles.cta} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  chevron: { fontSize: 30, lineHeight: 30, marginTop: -4 },
  progressWrap: { flex: 1 },
  skip: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  swatches: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  swatchRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  thumbs: { gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  thumbWrap: { width: 74, height: 74 },
  thumb: { width: 74, height: 74, borderWidth: 2.5, borderColor: 'transparent' },
  thumbCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5620E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  thumbCheckTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  cta: { alignSelf: 'stretch' },
});
