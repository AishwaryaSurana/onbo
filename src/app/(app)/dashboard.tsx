import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkeletonImage } from '@/components/SkeletonImage';
import { StreakModal } from '@/components/StreakModal';
import { ThemedText } from '@/components/ThemedText';
import { DASHBOARD_TILES } from '@/onboarding/manifest';
import { Events, track } from '@/services/analytics/analytics';
import { useOnboardingStore, type Goal } from '@/store/onboardingStore';
import { safeDisplayName, useSessionStore } from '@/store/sessionStore';
import { Radii, Spacing, Type, UI } from '@/theme';

const ALL_CATEGORIES = Object.keys(DASHBOARD_TILES);

const ORDER_BY_GOAL: Record<Goal, string[]> = {
  reels: ['Reels & TikToks', 'Trending Templates', 'Portraits & Selfies', 'YouTube Thumbnails'],
  portraits: ['Portraits & Selfies', 'Trending Templates', 'Reels & TikToks', 'YouTube Thumbnails'],
  thumbnails: ['YouTube Thumbnails', 'Trending Templates', 'Reels & TikToks', 'Portraits & Selfies'],
  exploring: ALL_CATEGORIES,
};

/** Home. Goal-filtered rows, display-name greeting, ONE gamification element on first load.
 *  Reflects the limited free experience when there's no entitlement (soft-close path). */
export default function Dashboard() {
  const displayName = useSessionStore((s) => s.displayName);
  const entitlement = useSessionStore((s) => s.entitlement);
  const goal = useOnboardingStore((s) => s.goal);

  const categories = useMemo(
    () => (goal && ORDER_BY_GOAL[goal] ? ORDER_BY_GOAL[goal] : ALL_CATEGORIES),
    [goal],
  );
  const isFree = entitlement === 'none';

  useEffect(() => {
    track(Events.dashboardReached, { entitlement, goal: goal ?? 'unset' });
  }, [entitlement, goal]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.pill}>
            <ThemedText style={styles.pillText}>🔥 {isFree ? '16' : '1,200'} credits</ThemedText>
          </View>
          {isFree && (
            <View style={[styles.pill, styles.pillAccent]}>
              <ThemedText style={[styles.pillText, { color: '#FFF' }]}>Upgrade</ThemedText>
            </View>
          )}
        </View>

        <ThemedText style={Type.hero}>Hi {safeDisplayName(displayName)} 👋</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          {isFree
            ? 'Free plan — exports carry a watermark and templates are limited.'
            : `You're on the ${entitlement} plan. Every template, no watermark.`}
        </ThemedText>

        {isFree && (
          <View style={styles.banner}>
            <ThemedText style={Type.bodyStrong}>Remove watermark + unlock 200 templates</ThemedText>
            <ThemedText color="textSecondary" style={Type.caption}>
              Start your 7-day free trial any time.
            </ThemedText>
          </View>
        )}

        {categories.map((cat) => (
          <CategoryRow key={cat} title={cat} tiles={DASHBOARD_TILES[cat]} locked={isFree} />
        ))}
      </ScrollView>

      <GamificationHost />
    </SafeAreaView>
  );
}

function CategoryRow({
  title,
  tiles,
  locked,
}: {
  title: string;
  tiles: (number | { uri: string })[];
  locked?: boolean;
}) {
  return (
    <View style={styles.row}>
      <ThemedText style={Type.subtitle}>{title}</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tiles}>
        {tiles.map((t, i) => (
          <View key={i}>
            <SkeletonImage source={t} style={styles.tile} radius={Radii.lg} fallbackLabel="" />
            {locked && i > 0 && (
              <View style={styles.lock}>
                <ThemedText style={{ fontSize: 14 }}>🔒</ThemedText>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/** Delay after the dashboard mounts before the streak sheet slides up. */
const STREAK_DELAY_MS = 1000;

/** ONE gamification element on first load (the streak reward sheet); a small tip is
 *  staggered later in the session. */
function GamificationHost() {
  const seen = useSessionStore((s) => s.gamificationSeen);
  const markSeen = useSessionStore((s) => s.markGamificationSeen);
  const [tip, setTip] = useState(false);
  const [streakReady, setStreakReady] = useState(false);
  const scheduled = useRef(false);

  const showStreak = !seen.includes('daily_streak');

  useEffect(() => {
    if (!showStreak) return;
    const t = setTimeout(() => setStreakReady(true), STREAK_DELAY_MS);
    return () => clearTimeout(t);
  }, [showStreak]);

  useEffect(() => {
    if (showStreak || seen.includes('tip') || scheduled.current) return;
    scheduled.current = true;
    const t = setTimeout(() => setTip(true), 12000);
    return () => clearTimeout(t);
  }, [showStreak, seen]);

  if (showStreak) {
    if (!streakReady) return null;
    return (
      <StreakModal
        onClose={() => markSeen('daily_streak')}
        onClaim={() => markSeen('daily_streak')}
      />
    );
  }

  if (!tip) return null;

  return (
    <View style={styles.toastWrap} pointerEvents="box-none">
      <View style={styles.toast}>
        <View style={{ flex: 1 }}>
          <ThemedText style={Type.bodyStrong}>1-day streak</ThemedText>
          <ThemedText color="textSecondary" style={Type.caption}>
            Come back tomorrow for +24 credits
          </ThemedText>
        </View>
        <Pressable
          style={styles.toastBtn}
          onPress={() => {
            markSeen('tip');
            setTip(false);
          }}>
          <ThemedText style={styles.toastBtnText}>Nice</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UI.bg },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  headerRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  pill: {
    backgroundColor: UI.surface,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  pillAccent: { backgroundColor: UI.accent },
  pillText: { color: UI.text, fontSize: 13, fontWeight: '700' },
  banner: {
    backgroundColor: UI.accentSoft,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: 2,
    marginTop: Spacing.xs,
  },
  row: { gap: Spacing.sm, marginTop: Spacing.md },
  tiles: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  tile: { width: 128, height: 160 },
  lock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: Radii.lg,
  },
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: UI.surfaceElevated,
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  toastBtn: {
    backgroundColor: UI.accent,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  toastBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
