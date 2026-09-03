import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { SkeletonImage } from '@/components/SkeletonImage';
import { Radii } from '@/theme';

type Src = number | { uri: string };
export interface StyleCard {
  title: string;
  sub: string;
  image: Src;
}

const CARD_W = 210;
const CARD_H = 300;
const GAP = 14;
const ITEM_W = CARD_W + GAP;
const AUTOPLAY_MS = 2600;

/** Coverflow-style deck: upright center card, tilted cards peeking left/right.
 *  Auto-scrolls and is swipeable; loops infinitely. */
export function StyleCardCarousel({ cards }: { cards: StyleCard[] }) {
  const { width } = useWindowDimensions();
  const ref = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  const loop = [...cards, ...cards, ...cards];
  const start = cards.length; // begin in the middle copy
  const indexRef = useRef(start);
  const draggingRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sidePad = (width - CARD_W) / 2;

  useEffect(() => {
    // jump to the middle copy without animation on mount
    const t = setTimeout(() => ref.current?.scrollTo({ x: start * ITEM_W, animated: false }), 0);
    return () => clearTimeout(t);
  }, [start]);

  useEffect(() => {
    const id = setInterval(() => {
      if (draggingRef.current) return;
      indexRef.current += 1;
      ref.current?.scrollTo({ x: indexRef.current * ITEM_W, animated: true });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const recenter = (offsetX: number) => {
    const i = Math.round(offsetX / ITEM_W);
    indexRef.current = i;
    if (i < cards.length || i >= cards.length * 2) {
      const next = (((i % cards.length) + cards.length) % cards.length) + cards.length;
      indexRef.current = next;
      ref.current?.scrollTo({ x: next * ITEM_W, animated: false });
    }
  };

  return (
    <Animated.ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_W}
      decelerationRate="fast"
      disableIntervalMomentum
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingHorizontal: sidePad - GAP / 2 }}
      onScrollBeginDrag={() => {
        draggingRef.current = true;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
      }}
      onScrollEndDrag={() => {
        resumeTimer.current = setTimeout(() => (draggingRef.current = false), 1800);
      }}
      onMomentumScrollEnd={(e) => recenter(e.nativeEvent.contentOffset.x)}
      style={styles.scroll}>
      {loop.map((c, i) => (
        <Card key={i} card={c} index={i} scrollX={scrollX} />
      ))}
    </Animated.ScrollView>
  );
}

function Card({
  card,
  index,
  scrollX,
}: {
  card: StyleCard;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const animStyle = useAnimatedStyle(() => {
    const p = scrollX.value / ITEM_W - index; // -1 left, 0 centered, 1 right
    return {
      transform: [
        { perspective: 800 },
        { scale: interpolate(p, [-1, 0, 1], [0.82, 1, 0.82], Extrapolation.CLAMP) },
        { translateY: interpolate(p, [-1, 0, 1], [30, 0, 30], Extrapolation.CLAMP) },
        { rotateZ: `${interpolate(p, [-1, 0, 1], [-12, 0, 12], Extrapolation.CLAMP)}deg` },
      ],
      opacity: interpolate(p, [-1.4, -1, 0, 1, 1.4], [0.2, 0.5, 1, 0.5, 0.2], Extrapolation.CLAMP),
    };
  });

  return (
    <View style={styles.slot}>
      <Animated.View style={[styles.card, animStyle]}>
        <SkeletonImage source={card.image} style={StyleSheet.absoluteFill} radius={Radii.xl} fallbackLabel="" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
        <View style={styles.text}>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.sub}>{card.sub}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { height: CARD_H + 60, overflow: 'visible' },
  slot: { width: ITEM_W, height: CARD_H + 60, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  text: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
});
