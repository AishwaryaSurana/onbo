import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { StepScaffold } from '@/onboarding/StepScaffold';
import { Events, track } from '@/services/analytics/analytics';
import { useOnboardingStore, type Goal } from '@/store/onboardingStore';
import { Radii, Spacing, Type, UI } from '@/theme';

const OPTIONS: { id: Goal; label: string; blurb: string; emoji: string }[] = [
  { id: 'reels', label: 'Reels & TikToks', blurb: 'Scroll-stopping short video', emoji: '🎬' },
  { id: 'portraits', label: 'Portraits & Selfies', blurb: 'Studio-quality photos of you', emoji: '📸' },
  { id: 'thumbnails', label: 'YouTube thumbnails', blurb: 'Higher click-through, on brand', emoji: '▶️' },
  { id: 'exploring', label: 'Just exploring', blurb: 'Show me what it can do', emoji: '✨' },
];

/** Step 2 — one tappable screen. Feels like progress; tailors later content + recs. */
export function Personalization() {
  const { next } = useSequencer();
  const storedGoal = useOnboardingStore((s) => s.goal);
  const setGoal = useOnboardingStore((s) => s.setGoal);
  const [selected, setSelected] = useState<Goal | null>(storedGoal);

  const choose = (g: Goal) => {
    setSelected(g);
    setGoal(g);
    track(Events.goalSelected, { goal: g });
  };

  return (
    <StepScaffold
      footer={
        <PrimaryButton
          label="Continue"
          onPress={next}
          disabled={!selected}
          accessibilityHint="Tailor the app to your goal"
        />
      }>
      <View style={styles.copy}>
        <ThemedText style={Type.hero}>What do you want to create?</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          Takes 3 seconds. We&apos;ll tune your examples and templates around it.
        </ThemedText>
      </View>

      <View style={styles.list}>
        {OPTIONS.map((o) => {
          const active = selected === o.id;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => choose(o.id)}
              style={[styles.card, active && styles.cardActive]}>
              <ThemedText style={styles.emoji}>{o.emoji}</ThemedText>
              <View style={styles.cardText}>
                <ThemedText style={Type.bodyStrong}>{o.label}</ThemedText>
                <ThemedText color="textSecondary" style={Type.caption}>
                  {o.blurb}
                </ThemedText>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </StepScaffold>
  );
}

const styles = StyleSheet.create({
  copy: { gap: Spacing.sm },
  list: { gap: Spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    backgroundColor: UI.surface,
    borderWidth: 1.5,
    borderColor: UI.border,
  },
  cardActive: { borderColor: UI.accent, backgroundColor: UI.accentSoft },
  emoji: { fontSize: 24 },
  cardText: { flex: 1, gap: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radii.pill,
    borderWidth: 2,
    borderColor: UI.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: UI.accent },
  radioDot: { width: 10, height: 10, borderRadius: Radii.pill, backgroundColor: UI.accent },
});
