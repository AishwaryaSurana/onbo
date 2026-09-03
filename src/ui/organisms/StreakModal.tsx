import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { PrimaryButton } from '@/ui/atoms/PrimaryButton';
import { Sparkle } from '@/ui/atoms/Sparkle';
import { Radii, Spacing } from '@/theme';

const DAYS = [16, 16, 16, 16, 16, 24, 32];

/** Aragon-style daily reward sheet. Rendered in a top-level Modal so it sits ABOVE the
 *  bottom tab bar and status bar. */
export function StreakModal({ onClose, onClaim }: { onClose: () => void; onClaim: () => void }) {
  return (
    <Modal transparent visible statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(180)} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View entering={SlideInDown.duration(280)} style={styles.sheet}>
        <LinearGradient
          colors={['#F5620E', '#8A3E15', '#17171C']}
          locations={[0, 0.32, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <Text style={styles.title}>🏆  1-day streak</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.x}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.coinWrap}>
          <Sparkle style={{ position: 'absolute', top: 10, left: 22 }} size={22} />
          <Sparkle style={{ position: 'absolute', top: 30, left: 6 }} size={13} delay={200} />
          <Sparkle style={{ position: 'absolute', bottom: 20, right: 16 }} size={17} delay={380} />
          <View style={styles.coin}>
            <Text style={styles.coinS}>$</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>1</Text>
          </View>
        </View>

        <Text style={styles.credits}>+16 credits</Text>
        <Text style={styles.subtitle}>Come back everyday for more rewards</Text>

        <View style={styles.daysRow}>
          {DAYS.map((amt, i) => {
            const big = i >= 5;
            return (
              <View key={i} style={[styles.dayPill, big && styles.dayPillBig]}>
                <View style={[styles.dayCoin, big && styles.dayCoinBig]} />
                <Text style={styles.dayAmt}>{amt}</Text>
              </View>
            );
          })}
        </View>

        <PrimaryButton label="Claim" onPress={onClaim} style={styles.claim} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    overflow: 'hidden',
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  title: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  x: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', position: 'absolute', right: 0, top: -2 },
  coinWrap: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.sm,
  },
  coin: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#F5C242',
    borderWidth: 6,
    borderColor: '#E0A32B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinS: { color: '#B47C12', fontSize: 68, fontWeight: '900' },
  badge: {
    position: 'absolute',
    top: 8,
    right: 10,
    minWidth: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E5342B',
    borderWidth: 4,
    borderColor: '#8E1C16',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeTxt: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  credits: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: Spacing.xs },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  daysRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dayPillBig: { backgroundColor: 'rgba(255,255,255,0.16)', paddingVertical: Spacing.md },
  dayCoin: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#F5C242' },
  dayCoinBig: { width: 22, height: 22, borderRadius: 11 },
  dayAmt: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  claim: { alignSelf: 'stretch', marginTop: Spacing.sm },
});
