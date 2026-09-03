import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaywallModal } from '@/components/PaywallModal';
import { SkeletonImage } from '@/components/SkeletonImage';
import { StreakModal } from '@/components/StreakModal';
import { ThemedText } from '@/components/ThemedText';
import { DASHBOARD_TILES, PROMO_CARDS } from '@/onboarding/manifest';
import { Events, track } from '@/services/analytics/analytics';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useSessionStore } from '@/store/sessionStore';
import { Radii, Spacing, Type, UI } from '@/theme';

const CATEGORIES = Object.keys(DASHBOARD_TILES);

export default function Dashboard() {
  const displayName = useSessionStore((s) => s.displayName);
  const entitlement = useSessionStore((s) => s.entitlement);
  const goal = useOnboardingStore((s) => s.goal);

  const firstName =
    displayName && !displayName.includes('@') ? displayName.trim().split(' ')[0] : null;
  const initial = (firstName ?? 'A').charAt(0).toUpperCase();
  const credits = entitlement === 'none' ? '0' : '1,200';
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    track(Events.dashboardReached, { entitlement, goal: goal ?? 'unset' });
  }, [entitlement, goal]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topbar}>
          <View style={styles.logo}>
            <Text style={styles.logoGlyph}>🔥</Text>
          </View>
          <View style={styles.trophyPill}>
            <Text style={styles.trophyTxt}>🏆 1</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable style={styles.creditsPill} onPress={() => setPayOpen(true)}>
            <Text style={styles.creditsTxt}>🪙 {credits} · </Text>
            <Text style={[styles.creditsTxt, { color: UI.accent }]}>Upgrade</Text>
          </Pressable>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initial}</Text>
          </View>
        </View>

        <ThemedText style={styles.title}>Dashboard</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          {firstName ? `Welcome back, ${firstName}.` : 'Welcome back.'}
        </ThemedText>

        <PromoCarousel />

        {CATEGORIES.map((cat) => (
          <CategoryRow key={cat} title={cat} tiles={DASHBOARD_TILES[cat]} />
        ))}
      </ScrollView>

      <GamificationHost />
      <PaywallModal visible={payOpen} onClose={() => setPayOpen(false)} source="dashboard_upgrade" />
    </SafeAreaView>
  );
}

function PromoCarousel() {
  const { width } = useWindowDimensions();
  const cardW = width - Spacing.lg * 2;
  const [idx, setIdx] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIdx(Math.round(e.nativeEvent.contentOffset.x / (cardW + Spacing.md)));
  };

  return (
    <View style={styles.promoWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardW + Spacing.md}
        decelerationRate="fast"
        onMomentumScrollEnd={onScroll}
        contentContainerStyle={styles.promoRow}>
        {PROMO_CARDS.map((c) => (
          <View key={c.kicker} style={[styles.promo, { width: cardW }]}>
            <SkeletonImage source={c.image} style={StyleSheet.absoluteFill} radius={Radii.lg} fallbackLabel="" />
            <LinearGradient
              colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.15)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.promoText}>
              <Text style={styles.promoKicker}>{c.kicker}</Text>
              <Text style={styles.promoLine1}>{c.line1}</Text>
              <Text style={styles.promoLine2}>{c.line2}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {PROMO_CARDS.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

function CategoryRow({ title, tiles }: { title: string; tiles: (number | { uri: string })[] }) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.rowTitle}>{title}</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tiles}>
        {tiles.map((t, i) => (
          <SkeletonImage key={i} source={t} style={styles.tile} radius={Radii.md} fallbackLabel="" />
        ))}
      </ScrollView>
    </View>
  );
}

const STREAK_DELAY_MS = 1000;

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
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.xs },

  topbar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: UI.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: { fontSize: 20 },
  trophyPill: {
    flexDirection: 'row',
    backgroundColor: UI.surface,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  trophyTxt: { color: UI.text, fontSize: 13, fontWeight: '700' },
  creditsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.accentSoft,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
  },
  creditsTxt: { color: UI.text, fontSize: 13, fontWeight: '700' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C0182B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  title: { fontSize: 34, fontWeight: '900', letterSpacing: -0.5, color: UI.text, marginTop: Spacing.xs },

  promoWrap: { marginTop: Spacing.md, gap: Spacing.sm },
  promoRow: { gap: Spacing.md },
  promo: { height: 150, borderRadius: Radii.lg, overflow: 'hidden', justifyContent: 'center' },
  promoText: { paddingLeft: Spacing.lg, gap: 2 },
  promoKicker: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  promoLine1: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 4 },
  promoLine2: { color: UI.accent, fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  dots: { flexDirection: 'row', gap: 5, justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: UI.border },
  dotOn: { backgroundColor: UI.accent, width: 18 },

  row: { gap: Spacing.sm, marginTop: Spacing.lg },
  rowTitle: { fontSize: 20, fontWeight: '800', color: UI.text },
  tiles: { gap: Spacing.sm, paddingVertical: 2 },
  tile: { width: 138, height: 174 },

  toastWrap: { position: 'absolute', left: 0, right: 0, bottom: Spacing.lg, paddingHorizontal: Spacing.lg },
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
