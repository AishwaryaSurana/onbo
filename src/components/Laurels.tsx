import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, G, Path } from 'react-native-svg';

const GOLD = '#D9A441';

/** One laurel sprig curving upward; mirror horizontally for the other side. */
function Sprig({ size, mirror }: { size: number; mirror?: boolean }) {
  const leaves = [
    { cx: 20, cy: 46, rot: 20 },
    { cx: 15, cy: 36, rot: 5 },
    { cx: 13, cy: 26, rot: -12 },
    { cx: 15, cy: 16, rot: -30 },
    { cx: 21, cy: 8, rot: -48 },
  ];
  return (
    <Svg width={size} height={size} viewBox="0 0 40 52">
      <G scaleX={mirror ? -1 : 1} originX={20} originY={0}>
        <Path
          d="M24 50 C 12 42, 8 28, 14 10"
          stroke={GOLD}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        {leaves.map((l, i) => (
          <Ellipse
            key={i}
            cx={l.cx}
            cy={l.cy}
            rx={6}
            ry={3.4}
            fill={GOLD}
            originX={l.cx}
            originY={l.cy}
            rotation={l.rot}
          />
        ))}
      </G>
    </Svg>
  );
}

/** Content flanked by two gold laurel sprigs, like the Aragon welcome screen. */
export function Laurels({ children, size = 40 }: { children: ReactNode; size?: number }) {
  return (
    <View style={styles.row}>
      <Sprig size={size} />
      <View style={styles.center}>{children}</View>
      <Sprig size={size} mirror />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', paddingHorizontal: 6 },
});
