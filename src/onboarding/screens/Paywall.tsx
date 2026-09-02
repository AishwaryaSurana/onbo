import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SkeletonImage } from '@/components/SkeletonImage';
import { ThemedText } from '@/components/ThemedText';
import { flags } from '@/config/flags';
import { useSequencer } from '@/onboarding/SequencerContext';
import { resultImageSource } from '@/onboarding/manifest';
import { StepScaffold } from '@/onboarding/StepScaffold';
import { Events, track } from '@/services/analytics/analytics';
import { billing } from '@/services/billing/billing';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useSessionStore } from '@/store/sessionStore';
import { Brand, Radii, Spacing, Type } from '@/theme';

/** PLAN.md 3.9 — framed around the result the user just generated. Trial + annual
 *  pre-selected, price visible, soft-close on decline, restore available. */
export function Paywall() {
  const { next, goToDashboard } = useSequencer();
  const goal = useOnboardingStore((s) => s.goal) ?? 'exploring';
  const resultStyleId = useOnboardingStore((s) => s.resultStyleId);
  const setEntitlement = useSessionStore((s) => s.setEntitlement);

  const plans = billing.getOfferings();
  const [selected, setSelected] = useState(billing.getDefaultPlanId());
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);

  const buy = async () => {
    setBusy('buy');
    track(Events.trialStarted, { plan: selected });
    try {
      const { entitlement } = await billing.purchase(selected);
      setEntitlement(entitlement);
      next(); // paywall is last -> sequencer routes to dashboard
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

  const activePlan = plans.find((p) => p.id === selected);

  return (
    <StepScaffold
      hideHeader
      footer={
        <View style={{ gap: Spacing.sm }}>
          <PrimaryButton
            label={activePlan?.trialLabel ? 'Start free trial' : 'Continue'}
            onPress={buy}
            loading={busy === 'buy'}
          />
          <ThemedText color="textMuted" style={[Type.caption, styles.legal]}>
            {activePlan?.trialLabel ?? activePlan?.priceLabel} · cancel anytime
          </ThemedText>
          <View style={styles.subRow}>
            {flags.paywallStyle === 'soft' && (
              <Pressable onPress={goToDashboard} hitSlop={8}>
                <ThemedText color="textSecondary" style={Type.caption}>
                  Maybe later
                </ThemedText>
              </Pressable>
            )}
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
        <ThemedText style={Type.hero}>Unlock this look + 200 more</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          Your full pack renders in high resolution, no watermark, ready to download.
        </ThemedText>
      </View>

      <View style={styles.plans}>
        {plans.map((p) => {
          const active = p.id === selected;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              style={[styles.plan, active && styles.planActive]}>
              {p.badge && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{p.badge}</ThemedText>
                </View>
              )}
              <View style={styles.planRow}>
                <View style={[styles.radio, active && styles.radioOn]}>
                  {active && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={Type.bodyStrong}>{p.title}</ThemedText>
                  <ThemedText color="textSecondary" style={Type.caption}>
                    {p.subLabel}
                  </ThemedText>
                </View>
                <ThemedText style={Type.bodyStrong}>{p.priceLabel}</ThemedText>
              </View>
            </Pressable>
          );
        })}
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
  heroImg: { width: 160, height: 160, marginBottom: Spacing.sm },
  plans: { gap: Spacing.md, marginTop: Spacing.lg },
  plan: {
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  planActive: { borderColor: Brand.accent, backgroundColor: Brand.accentSoft },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  badge: { alignSelf: 'flex-start' },
  badgeText: {
    color: Brand.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Brand.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: Brand.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Brand.accent },
  proof: { alignItems: 'center', marginTop: Spacing.lg },
  legal: { textAlign: 'center' },
  subRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xl, paddingTop: Spacing.xs },
});
