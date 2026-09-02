import { useEffect, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { SkeletonImage } from '@/components/SkeletonImage';
import { COLLAGE_IMAGES } from '@/onboarding/manifest';
import { Radii } from '@/theme';

const GAP = 8;

// Per-tile aspect ratios (w / h) — mix of portrait, square and landscape for a masonry feel.
const ASPECTS = [0.74, 1.0, 1.4, 0.82, 1.25, 0.95, 1.55, 0.7];

interface RowConfig {
  height: number;
  direction: 1 | -1;
  speedPxPerSec: number;
}

const ROWS: RowConfig[] = [
  { height: 132, direction: -1, speedPxPerSec: 22 },
  { height: 188, direction: 1, speedPxPerSec: 30 },
  { height: 150, direction: -1, speedPxPerSec: 26 },
];

interface Props {
  /** Solid color the edges fade into (screen background). */
  fadeColor: string;
  style?: StyleProp<ViewStyle>;
}

/** Continuously sliding masonry of AI photos with variable-sized tiles (Aragon welcome hero). */
export function CollageMarquee({ fadeColor, style }: Props) {
  const rows = useMemo(() => {
    // Deal images across the rows round-robin, each row keeps its own repeating strip.
    const buckets: (typeof COLLAGE_IMAGES)[] = ROWS.map(() => []);
    COLLAGE_IMAGES.forEach((img, i) => buckets[i % ROWS.length].push(img));
    return buckets;
  }, []);

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.stack}>
        {ROWS.map((cfg, i) => (
          <Row key={i} images={rows[i]} offset={i} {...cfg} />
        ))}
      </View>

      <LinearGradient
        pointerEvents="none"
        colors={[fadeColor, rgba(fadeColor, 0)]}
        style={[styles.fade, styles.fadeTop]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[rgba(fadeColor, 0), fadeColor]}
        style={[styles.fade, styles.fadeBottom]}
      />
      <LinearGradient
        pointerEvents="none"
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        colors={[fadeColor, rgba(fadeColor, 0), rgba(fadeColor, 0), fadeColor]}
        locations={[0, 0.08, 0.92, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function Row({
  images,
  height,
  direction,
  speedPxPerSec,
  offset,
}: RowConfig & { images: typeof COLLAGE_IMAGES; offset: number }) {
  const widths = useMemo(
    () => images.map((_, i) => Math.round(height * ASPECTS[(i + offset) % ASPECTS.length])),
    [images, height, offset],
  );
  const setWidth = widths.reduce((sum, w) => sum + w + GAP, 0);
  const tx = useSharedValue(0);

  useEffect(() => {
    const duration = (setWidth / speedPxPerSec) * 1000;
    tx.value = 0;
    tx.value = withRepeat(
      withTiming(direction === -1 ? -setWidth : setWidth, { duration, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(tx);
  }, [setWidth, speedPxPerSec, direction, tx]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: direction === -1 ? tx.value : tx.value - setWidth }],
  }));

  const doubled = [...images, ...images];

  return (
    <View style={{ height, overflow: 'hidden' }}>
      <Animated.View style={[styles.rowInner, animStyle]}>
        {doubled.map((src, i) => (
          <SkeletonImage
            key={i}
            source={src}
            style={{ width: widths[i % widths.length], height, marginRight: GAP }}
            radius={Radii.md}
            fallbackLabel=""
          />
        ))}
      </Animated.View>
    </View>
  );
}

function rgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  stack: { gap: GAP, paddingTop: GAP },
  rowInner: { flexDirection: 'row' },
  fade: { position: 'absolute', left: 0, right: 0 },
  fadeTop: { top: 0, height: 88 },
  fadeBottom: { bottom: 0, height: 160 },
});
