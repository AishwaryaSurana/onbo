import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SkeletonImage } from '@/components/SkeletonImage';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { resultImageSource } from '@/onboarding/manifest';
import { StepScaffold } from '@/onboarding/StepScaffold';
import { Events, track } from '@/services/analytics/analytics';
import { billing } from '@/services/billing/billing';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useSessionStore } from '@/store/sessionStore';
import { Radii, Spacing, Type, UI } from '@/theme';

/** Step 6 — contextual paywall. Framed on what they just did. Annual + free-trial
 *  pre-selected via a single TOGGLE (not two competing buttons); real price shown. */
export function Paywall() {
  const { next, goToDashboard } = useSequencer();
  const goal = useOnboardingStore((s) => s.goal) ?? 'exploring';
  const resultStyleId = useOnboardingStore((s) => s.resultStyleId);
  const setEntitlement = useSessionStore((s) => s.setEntitlement);

  const annual = billing.getOfferings().find((p) => p.id === 'annual') ?? billing.getOfferings()[0];
  const [trial, setTrial] = useState(true); // free trial pre-selected
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);

  const buy = async () => {
    setBusy('buy');
    track(Events.trialStarted, { plan: annual.id, trial });
    try {
      const { entitlement } = await billing.purchase(annual.id);
      setEntitlement(trial ? entitlement : 'paid');
      goToDashboard(); // full experience — skip notification priming
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    setBusy('restore');
    try {
      const { entitlement } = await billing.restore();
      if (entitlement !== 'none') {
        setEntitlement(entitlement);
        goToDashboard();
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <StepScaffold
      hideHeader
      footer={
        <View style={{ gap: Spacing.sm }}>
          <PrimaryButton
            label={trial ? 'Start 7-day free trial' : `Subscribe · ${annual.priceLabel}`}
            onPress={buy}
            loading={busy === 'buy'}
          />
          <ThemedText color="textMuted" style={[Type.caption, styles.legal]}>
            {trial ? `Free for 7 days, then ${annual.priceLabel}` : annual.priceLabel} ·{' '}
            {annual.subLabel} · cancel anytime
          </ThemedText>
          <View style={styles.subRow}>
            <Pressable onPress={next} hitSlop={8}>
              <ThemedText color="textSecondary" style={Type.caption}>
                Maybe later
              </ThemedText>
            </Pressable>
            <Pressable onPress={restore} hitSlop={8}>
              <ThemedText color="textSecondary" style={Type.caption}>
                Restore purchases
              </ThemedText>
            </Pressable>
          </View>
        </View>
      }>
      <View style={styles.hero}>
        <SkeletonImage
          source={resultImageSource(goal, resultStyleId)}
          style={styles.heroImg}
          radius={Radii.xl}
        />
        <ThemedText style={Type.hero}>Unlock this style + 200 more</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          Full-resolution renders, no watermark, every template — ready to export.
        </ThemedText>
      </View>

      <View style={styles.planCard}>
        <View style={styles.planTop}>
          <View style={{ flex: 1 }}>
            <ThemedText style={Type.bodyStrong}>{annual.title} · {annual.priceLabel}</ThemedText>
            <ThemedText color="textSecondary" style={Type.caption}>
              {annual.subLabel}
            </ThemedText>
          </View>
          {annual.badge ? (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{annual.badge}</ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.trialRow}>
          <View style={{ flex: 1 }}>
            <ThemedText style={Type.bodyStrong}>Free trial</ThemedText>
            <ThemedText color="textSecondary" style={Type.caption}>
              7 days free — we&apos;ll remind you before it ends
            </ThemedText>
          </View>
          <Switch
            value={trial}
            onValueChange={setTrial}
            trackColor={{ true: UI.accent, false: UI.border }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.proof}>
        <ThemedText color="textSecondary" style={Type.caption}>
          ★★★★★  4.8 average · 2,683,000+ people
        </ThemedText>
      </View>
    </StepScaffold>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.sm, alignItems: 'center', marginTop: Spacing.sm },
  heroImg: { width: 150, height: 150, marginBottom: Spacing.sm },
  planCard: {
    marginTop: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: UI.accent,
    backgroundColor: UI.accentSoft,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  planTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  badge: {
    backgroundColor: UI.accent,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  trialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: UI.border,
    paddingTop: Spacing.md,
  },
  proof: { alignItems: 'center', marginTop: Spacing.lg },
  legal: { textAlign: 'center' },
  subRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xl, paddingTop: Spacing.xs },
});
