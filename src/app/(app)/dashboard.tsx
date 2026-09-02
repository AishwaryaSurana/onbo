import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkeletonImage } from '@/components/SkeletonImage';
import { ThemedText } from '@/components/ThemedText';
import { DASHBOARD_TILES } from '@/onboarding/manifest';
import { Events, track } from '@/services/analytics/analytics';
import { safeDisplayName, useSessionStore } from '@/store/sessionStore';
import { useOnboardingStore, type Goal } from '@/store/onboardingStore';
import { Brand, Radii, Spacing, Type } from '@/theme';

const ALL_CATEGORIES = Object.keys(DASHBOARD_TILES);

const ORDER_BY_GOAL: Record<Goal, string[]> = {
  headshots: ['Professional Headshots', 'Background Enhancer', 'Dating Photos', 'Creative Styles'],
  dating: ['Dating Photos', 'Professional Headshots', 'Creative Styles', 'Background Enhancer'],
  creative: ['Creative Styles', 'Dating Photos', 'Professional Headshots', 'Background Enhancer'],
  exploring: ALL_CATEGORIES,
};

/** PLAN.md 3.10 / 4.5 / 4.7 — goal-filtered rows, display-name greeting,
 *  exactly ONE gamification element on first load. */
export default function Dashboard() {
  const displayName = useSessionStore((s) => s.displayName);
  const entitlement = useSessionStore((s) => s.entitlement);
  const goal = useOnboardingStore((s) => s.goal);

  const categories = useMemo(
    () => (goal ? ORDER_BY_GOAL[goal] : ALL_CATEGORIES),
    [goal],
  );

  useEffect(() => {
    track(Events.dashboardReached, { entitlement, goal: goal ?? 'unset' });
  }, [entitlement, goal]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.pill}>
            <ThemedText style={styles.pillText}>
              🔥 {entitlement === 'none' ? '16' : entitlement === 'trial' ? '1,200' : '1,200'} credits
            </ThemedText>
          </View>
          {entitlement === 'none' && (
            <View style={[styles.pill, styles.pillAccent]}>
              <ThemedText style={styles.pillText}>Upgrade</ThemedText>
            </View>
          )}
        </View>

        <ThemedText style={Type.hero}>Hi {safeDisplayName(displayName)} 👋</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          {entitlement === 'none'
            ? 'Free preview mode — your first pack is one tap away.'
            : `You're on the ${entitlement} plan. Pick a pack to generate.`}
        </ThemedText>

        {categories.map((cat) => (
          <CategoryRow key={cat} title={cat} tiles={DASHBOARD_TILES[cat]} />
        ))}
      </ScrollView>

      <GamificationHost />
    </SafeAreaView>
  );
}

function CategoryRow({ title, tiles }: { title: string; tiles: { uri: string }[] | number[] }) {
  return (
    <View style={styles.row}>
      <ThemedText style={Type.subtitle}>{title}</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tiles}>
        {(tiles as unknown[]).map((t, i) => (
          <SkeletonImage
            key={i}
            source={t as never}
            style={styles.tile}
            radius={Radii.lg}
            fallbackLabel=""
          />
        ))}
      </ScrollView>
    </View>
  );
}

/** Shows ONE gamification element on first load; schedules the next for later in the session. */
function GamificationHost() {
  const seen = useSessionStore((s) => s.gamificationSeen);
  const markSeen = useSessionStore((s) => s.markGamificationSeen);
  const [visible, setVisible] = useState<string | null>(null);
  const scheduled = useRef(false);

  useEffect(() => {
    if (!seen.includes('daily_credits')) {
      setVisible('daily_credits');
      return;
    }
    if (!seen.includes('streak') && !scheduled.current) {
      scheduled.current = true;
      const t = setTimeout(() => setVisible('streak'), 12000);
      return () => clearTimeout(t);
    }
  }, [seen]);

  if (!visible) return null;

  const copy =
    visible === 'daily_credits'
      ? { title: 'Welcome gift', body: '+16 credits to start your first pack', cta: 'Claim' }
      : { title: '1-day streak', body: 'Come back tomorrow for +24 credits', cta: 'Nice' };

  return (
    <View style={styles.toastWrap} pointerEvents="box-none">
      <View style={styles.toast}>
        <View style={{ flex: 1 }}>
          <ThemedText style={Type.bodyStrong}>{copy.title}</ThemedText>
          <ThemedText color="textSecondary" style={Type.caption}>
            {copy.body}
          </ThemedText>
        </View>
        <Pressable
          style={styles.toastBtn}
          onPress={() => {
            markSeen(visible);
            setVisible(null);
          }}>
          <ThemedText style={styles.toastBtnText}>{copy.cta}</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.bg },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  headerRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  pill: {
    backgroundColor: Brand.surfaceElevated,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  pillAccent: { backgroundColor: Brand.accent },
  pillText: { color: Brand.text, fontSize: 13, fontWeight: '700' },
  row: { gap: Spacing.sm, marginTop: Spacing.md },
  tiles: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  tile: { width: 128, height: 160 },
  toastWrap: { position: 'absolute', left: 0, right: 0, bottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Brand.surfaceElevated,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  toastBtn: {
    backgroundColor: Brand.accent,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  toastBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
