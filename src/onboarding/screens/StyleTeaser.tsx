import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { Carousel } from '@/components/Carousel';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SkeletonImage } from '@/components/SkeletonImage';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { StepScaffold } from '@/onboarding/StepScaffold';
import { STYLE_SETS, type StyleOption } from '@/onboarding/manifest';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Brand, Radii, Spacing, Type } from '@/theme';

/** PLAN.md 3.3 — swipeable cards, each with label + thumb selector + a hero preview
 *  rendered through SkeletonImage (never a blank gap). */
export function StyleTeaser() {
  const { next } = useSequencer();
  const goal = useOnboardingStore((s) => s.goal) ?? 'exploring';
  const setChosenStyle = useOnboardingStore((s) => s.setChosenStyle);
  const sets = STYLE_SETS[goal];

  const [cardIndex, setCardIndex] = useState(0);

  return (
    <StepScaffold
      scroll={false}
      footer={
        <PrimaryButton
          label="Next"
          onPress={() => {
            setChosenStyle(sets[cardIndex].id);
            next();
          }}
        />
      }>
      <View style={styles.copy}>
        <ThemedText style={Type.title}>A look for every reason</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          Swipe through a few. Pick a favorite to preview on your photo next.
        </ThemedText>
      </View>

      <Carousel<StyleOption>
        data={sets}
        onIndexChange={setCardIndex}
        renderItem={(item) => <StyleCard option={item} />}
      />
    </StepScaffold>
  );
}

function StyleCard({ option }: { option: StyleOption }) {
  const [variant, setVariant] = useState(0);
  // A tiny thumb strip to make the card feel interactive (all point at the same pair here).
  const thumbs = [option.thumb, option.thumb, option.thumb, option.thumb];

  return (
    <View style={styles.card}>
      <ThemedText style={Type.subtitle}>{option.label}</ThemedText>
      <BeforeAfterSlider before={option.before} after={option.after} height={360} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbRow}>
        {thumbs.map((t, i) => (
          <Pressable key={i} onPress={() => setVariant(i)}>
            <SkeletonImage
              source={t}
              style={[styles.thumb, variant === i && styles.thumbActive]}
              radius={Radii.md}
              fallbackLabel=""
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { gap: Spacing.sm },
  card: { gap: Spacing.md },
  thumbRow: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  thumb: { width: 56, height: 56, borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: Brand.accent },
});
