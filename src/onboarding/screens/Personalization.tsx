import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { StepScaffold } from '@/onboarding/StepScaffold';
import { Events, track } from '@/services/analytics/analytics';
import { useOnboardingStore, type Goal } from '@/store/onboardingStore';
import { Brand, Radii, Spacing, Type } from '@/theme';

const OPTIONS: { id: Goal; label: string; blurb: string; emoji: string }[] = [
  { id: 'headshots', label: 'Professional headshots', blurb: 'LinkedIn, resumes, team pages', emoji: '💼' },
  { id: 'dating', label: 'Dating photos', blurb: 'Stand out, look like you', emoji: '💛' },
  { id: 'creative', label: 'Creative styles', blurb: 'Film, retro, painterly, neon', emoji: '🎨' },
  { id: 'exploring', label: 'Just exploring', blurb: 'Show me what it can do', emoji: '✨' },
];

/** PLAN.md 3.2 — single-select, 4 options max, tappable cards (not a dropdown), Skip always visible. */
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
          accessibilityHint="Use your goal to tailor styles"
        />
      }>
      <View style={styles.copy}>
        <ThemedText style={Type.hero}>What do you want to create?</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          We&apos;ll tune your styles and examples around this. You can change it later.
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
    backgroundColor: Brand.surface,
    borderWidth: 1.5,
    borderColor: Brand.border,
  },
  cardActive: { borderColor: Brand.accent, backgroundColor: Brand.accentSoft },
  emoji: { fontSize: 24 },
  cardText: { flex: 1, gap: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radii.pill,
    borderWidth: 2,
    borderColor: Brand.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Brand.accent },
  radioDot: { width: 10, height: 10, borderRadius: Radii.pill, backgroundColor: Brand.accent },
});
