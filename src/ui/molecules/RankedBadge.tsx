import { StyleSheet, Text, View } from 'react-native';

const STAR = '#F5A623';

/** "#1 RANKED / AI PHOTO PLATFORM" with gold stars. */
export function RankedBadge() {
  return (
    <View style={styles.wrap}>
      <View style={styles.stars}>
        <Text style={[styles.star, styles.starSm]}>★</Text>
        <Text style={[styles.star, styles.starLg]}>★</Text>
        <Text style={[styles.star, styles.starSm]}>★</Text>
      </View>
      <Text style={styles.rank}>#1 RANKED</Text>
      <Text style={styles.plat}>AI PHOTO PLATFORM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  stars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 4 },
  star: { color: STAR },
  starSm: { fontSize: 20 },
  starLg: { fontSize: 30, marginBottom: 2 },
  rank: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  plat: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 3,
  },
});
