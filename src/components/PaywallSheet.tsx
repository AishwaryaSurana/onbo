import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkeletonImage } from '@/components/SkeletonImage';
import { StyleCardCarousel } from '@/components/StyleCardCarousel';
import { PAYWALL_AVATARS, PAYWALL_CARDS, PAYWALL_REVIEWS } from '@/onboarding/manifest';
import { billing } from '@/services/billing/billing';
import { Radii, Spacing } from '@/theme';

// Intentionally DARK (matches the video paywall), regardless of app theme.
const D = {
  text: '#FFFFFF',
  dim: 'rgba(255,255,255,0.66)',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.14)',
  accent: '#F5620E',
  accentSoft: 'rgba(245,98,14,0.16)',
  green: '#3FBF73',
};

const FEATURE_CARDS = [
  ['Ultra HD quality', 'No watermarks'],
  ['Every template', 'Priority renders'],
  ['Cancel anytime', 'Keep your credits'],
];

interface Props {
  onClose: () => void;
  onSubscribe: (planId: string) => void;
  subscribing?: boolean;
}

/** The Aragon-style paywall UI. Reused by the onboarding step and the tab gate. */
export function PaywallSheet({ onClose, onSubscribe, subscribing }: Props) {
  const insets = useSafeAreaInsets();
  const plans = billing.getOfferings();
  const [selected, setSelected] = useState(billing.getDefaultPlanId());

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#3A2140', '#241a2e', '#141019']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.safe}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top, 24) + 44 }]}
          showsVerticalScrollIndicator={false}>
          <StyleCardCarousel cards={PAYWALL_CARDS} />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featRow}>
            {FEATURE_CARDS.map((lines, i) => (
              <View key={i} style={styles.featCard}>
                {lines.map((l) => (
                  <View key={l} style={styles.featLine}>
                    <Text style={styles.check}>✓</Text>
                    <Text style={styles.featText}>{l}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <Text style={styles.h2}>Pick the plan to suit your needs</Text>
          <View style={{ gap: Spacing.md }}>
            {plans.map((p) => {
              const active = p.id === selected;
              return (
                <View key={p.id}>
                  {p.badge && active && (
                    <View style={styles.discountTab}>
                      <Text style={styles.discountTxt}>♥ {p.badge}</Text>
                    </View>
                  )}
                  <Pressable
                    onPress={() => setSelected(p.id)}
                    style={[styles.plan, active && styles.planActive, p.badge && active && styles.planWithTab]}>
                    <View style={[styles.radio, active && styles.radioOn]}>
                      {active && <View style={styles.radioDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planTitle}>{p.title}</Text>
                      <Text style={styles.planSub}>{p.subLabel}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.planPrice}>{p.priceLabel}</Text>
                      <Text style={styles.planPeriod}>{p.pricePeriod}</Text>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={styles.rankBlock}>
            <Text style={styles.stars}>★ ★ ★</Text>
            <View style={styles.rankRow}>
              <Text style={styles.laurelL}>🌿</Text>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.rankBig}>#1 RANKED</Text>
                <Text style={styles.rankSmall}>AI PHOTO PLATFORM</Text>
              </View>
              <Text style={styles.laurelR}>🌿</Text>
            </View>
            <Text style={styles.lovedBy}>Loved by millions worldwide</Text>
            <View style={styles.avatars}>
              {PAYWALL_AVATARS.map((a, i) => (
                <SkeletonImage
                  key={i}
                  source={a}
                  style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10 }]}
                  radius={20}
                  fallbackLabel=""
                />
              ))}
            </View>
            <Text style={styles.trusted}>Trusted by 2,683,000+ users</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={280}
            decelerationRate="fast"
            contentContainerStyle={styles.reviewRow}>
            {PAYWALL_REVIEWS.map((r) => (
              <View key={r.name} style={styles.review}>
                <Text style={styles.reviewTitle}>{r.title}</Text>
                <Text style={styles.reviewBody}>{r.body}</Text>
                <View style={styles.reviewFoot}>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <Text style={styles.gLogo}>G</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.ratings}>
            <Text style={styles.ratingLine}>
              <Text style={styles.gLogoInline}>G </Text>Google Reviews 4.8 ★★★★★
            </Text>
            <Text style={styles.ratingLine}>
              <Text style={{ color: '#00B67A' }}>★ </Text>Trustpilot 4.8 ★★★★★
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Pressable onPress={() => onSubscribe(selected)} disabled={subscribing} style={styles.cta}>
            <Text style={styles.ctaTxt}>{subscribing ? 'Processing…' : 'Continue'}</Text>
          </Pressable>
          <View style={styles.legalRow}>
            <Text style={styles.legal}>Terms &amp; Conditions</Text>
            <Text style={styles.legal}> · </Text>
            <Text style={styles.legal}>Privacy</Text>
          </View>
        </View>

        {/* rendered last so it always sits on top and stays tappable */}
        <Pressable
          onPress={onClose}
          hitSlop={16}
          style={[styles.close, { top: Math.max(insets.top, 24) }]}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <Text style={styles.closeX}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#141019' },
  safe: { flex: 1 },
  close: {
    position: 'absolute',
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  closeX: { color: D.text, fontSize: 17, fontWeight: '800' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.lg },

  cardsRow: { gap: Spacing.md, paddingRight: Spacing.lg },
  card: { width: 200, height: 300, borderRadius: Radii.xl, overflow: 'hidden', backgroundColor: D.card },
  cardCenter: { width: 224, height: 330 },
  cardText: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md },
  cardTitle: { color: D.text, fontSize: 22, fontWeight: '800' },
  cardSub: { color: D.dim, fontSize: 13, marginTop: 2 },

  featRow: { gap: Spacing.md, paddingRight: Spacing.lg },
  featCard: {
    width: 240,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: D.border,
    backgroundColor: D.card,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  featLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  check: { color: D.green, fontSize: 15, fontWeight: '900' },
  featText: { color: D.text, fontSize: 15, fontWeight: '600' },

  h2: { color: D.text, fontSize: 19, fontWeight: '800', textAlign: 'center', marginTop: Spacing.sm },
  discountTab: {
    alignSelf: 'flex-start',
    backgroundColor: D.accent,
    borderTopLeftRadius: Radii.md,
    borderTopRightRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  discountTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: D.border,
    backgroundColor: D.card,
    padding: Spacing.lg,
  },
  planActive: { borderColor: D.accent, backgroundColor: D.accentSoft },
  planWithTab: { borderTopLeftRadius: 0 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: D.dim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: D.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: D.accent },
  planTitle: { color: D.text, fontSize: 16, fontWeight: '800' },
  planSub: { color: D.dim, fontSize: 12, marginTop: 2 },
  planPrice: { color: D.text, fontSize: 20, fontWeight: '900' },
  planPeriod: { color: D.dim, fontSize: 11 },

  rankBlock: { alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  stars: { color: D.accent, fontSize: 16, letterSpacing: 2 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  laurelL: { fontSize: 34, transform: [{ scaleX: -1 }] },
  laurelR: { fontSize: 34 },
  rankBig: { color: D.text, fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  rankSmall: { color: D.dim, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  lovedBy: { color: D.text, fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: Spacing.xs },
  avatars: { flexDirection: 'row', marginTop: Spacing.xs },
  avatar: { width: 40, height: 40, borderWidth: 2, borderColor: '#241a2e' },
  trusted: { color: D.dim, fontSize: 13 },

  reviewRow: { gap: Spacing.md, paddingRight: Spacing.lg },
  review: {
    width: 264,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: D.border,
    backgroundColor: D.card,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  reviewTitle: { color: D.text, fontSize: 16, fontWeight: '800' },
  reviewBody: { color: D.dim, fontSize: 13, lineHeight: 19 },
  reviewFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  reviewName: { color: D.text, fontSize: 13, fontWeight: '700' },
  gLogo: { color: '#4285F4', fontSize: 18, fontWeight: '900' },
  gLogoInline: { color: '#4285F4', fontWeight: '900' },
  ratings: { alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.sm },
  ratingLine: { color: D.text, fontSize: 14, fontWeight: '700' },

  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: 'rgba(20,16,25,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: D.border,
  },
  cta: { height: 56, borderRadius: Radii.pill, backgroundColor: D.accent, alignItems: 'center', justifyContent: 'center' },
  ctaTxt: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  legalRow: { flexDirection: 'row', justifyContent: 'center' },
  legal: { color: D.dim, fontSize: 12, fontWeight: '600' },
});
