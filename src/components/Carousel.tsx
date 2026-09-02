import { ReactNode, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { Brand, Radii, Spacing } from '@/theme';

interface Props<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onIndexChange?: (index: number) => void;
}

/** Lightweight paged horizontal carousel with dots. */
export function Carousel<T>({ data, renderItem, onIndexChange }: Props<T>) {
  const { width } = useWindowDimensions();
  const pageWidth = width - Spacing.lg * 2;
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    if (next !== index) {
      setIndex(next);
      onIndexChange?.(next);
    }
  };

  return (
    <View>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={pageWidth}
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}>
        {data.map((item, i) => (
          <View key={i} style={{ width: pageWidth }}>
            {renderItem(item, i)}
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {data.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: Spacing.xs, justifyContent: 'center', paddingTop: Spacing.md },
  dot: { width: 6, height: 6, borderRadius: Radii.pill, backgroundColor: Brand.border },
  dotActive: { backgroundColor: Brand.accent, width: 18 },
});
