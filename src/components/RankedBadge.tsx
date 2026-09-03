import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

const LEAF = 'M0,0 C 5,-3 6.5,-11 0,-16 C -6.5,-11 -5,-3 0,0 Z';
const LAUREL = '#D9D9DE';
const STAR = '#F5A623';

/** One curved laurel branch. Mirror horizontally for the other side. */
function LaurelBranch({ size = 92, mirror = false }: { size?: number; mirror?: boolean }) {
  const cx = 54;
  const cy = 46;
  const R = 33;
  const startDeg = 128;
  const endDeg = 355;
  const N = 12;

  const pt = (deg: number, r = R) => {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const [sx, sy] = pt(startDeg, R + 3);
  const [ex, ey] = pt(endDeg, R + 3);
  const stem = `M ${sx.toFixed(1)},${sy.toFixed(1)} A ${R + 3},${R + 3} 0 0 1 ${ex.toFixed(1)},${ey.toFixed(1)}`;

  const leaves = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const deg = startDeg + (endDeg - startDeg) * t;
    const [x, y] = pt(deg, R);
    const scale = 0.62 + 0.55 * Math.sin(Math.PI * Math.min(t * 1.15, 1));
    return { x, y, rot: deg + 90 + 16, scale };
  });

  return (
    <Svg width={size} height={size * 0.95} viewBox="0 0 108 100">
      <G transform={mirror ? 'translate(108,0) scale(-1,1)' : undefined}>
        <Path d={stem} stroke={LAUREL} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        {leaves.map((l, i) => (
          <Path
            key={i}
            d={LEAF}
            fill={LAUREL}
            transform={`translate(${l.x.toFixed(1)},${l.y.toFixed(1)}) rotate(${l.rot.toFixed(1)}) scale(${l.scale.toFixed(2)})`}
          />
        ))}
      </G>
    </Svg>
  );
}

/** "#1 RANKED / AI PHOTO PLATFORM" with gold stars and laurel wreaths. */
export function RankedBadge() {
  return (
    <View style={styles.wrap}>
      <View style={styles.stars}>
        <Text style={[styles.star, styles.starSm]}>★</Text>
        <Text style={[styles.star, styles.starLg]}>★</Text>
        <Text style={[styles.star, styles.starSm]}>★</Text>
      </View>
      <View style={styles.row}>
        <LaurelBranch />
        <View style={styles.text}>
          <Text style={styles.rank}>#1 RANKED</Text>
          <Text style={styles.plat}>AI PHOTO{'\n'}PLATFORM</Text>
        </View>
        <LaurelBranch mirror />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  stars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: -14, zIndex: 2 },
  star: { color: STAR },
  starSm: { fontSize: 20 },
  starLg: { fontSize: 30, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { alignItems: 'center', marginHorizontal: -14 },
  rank: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  plat: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 2,
  },
});
