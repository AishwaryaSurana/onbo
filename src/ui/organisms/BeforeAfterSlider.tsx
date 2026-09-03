import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { SkeletonImage } from '@/ui/molecules/SkeletonImage';
import { ThemedText } from '@/ui/atoms/ThemedText';
import { UI, Radii, Spacing, Type } from '@/theme';

type Source = number | { uri: string } | null | undefined;

interface Props {
  before: Source;
  after: Source;
  height?: number;
  radius?: number;
  /** Ping-pong the divider automatically until the user drags it. */
  autoPlay?: boolean;
  /** Thin divider line only — no knob, no BEFORE/AFTER tags (matches the video). */
  minimal?: boolean;
  /** Color-grade the AFTER side (pass the same image to `before`/`after` for a
   *  "same photo, different coloring" effect). */
  afterTint?: string;
  /** Zoned grade on the AFTER side — `top` tints the hair region, `bottom` the face/makeup. */
  afterZones?: { top?: string; bottom?: string };
  /** Auto-sweep bounds for the divider (0..1). Defaults to a wide sweep. */
  sweep?: [number, number];
}

export function BeforeAfterSlider({
  before,
  after,
  height = 380,
  radius = Radii.lg,
  autoPlay = false,
  minimal = false,
  afterTint,
  afterZones,
  sweep = [0.22, 0.82],
}: Props) {
  const [boxWidth, setBoxWidth] = useState(0);
  const widthSV = useSharedValue(0);
  const divider = useSharedValue(0.5); // 0..1
  const interacted = useSharedValue(false);

  const [sweepLo, sweepHi] = sweep;
  useEffect(() => {
    if (!autoPlay) return;
    divider.value = sweepLo;
    divider.value = withRepeat(
      withTiming(sweepHi, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(divider);
  }, [autoPlay, divider, sweepLo, sweepHi]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    widthSV.value = w;
    setBoxWidth(w);
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      interacted.value = true;
      cancelAnimation(divider); // hand control to the user, stop the auto sweep
    })
    .onUpdate((e) => {
      if (widthSV.value <= 0) return;
      divider.value = Math.max(0.04, Math.min(0.96, e.x / widthSV.value));
    });

  // Clip the "after" layer to a pixel width; the inner image stays full box width so it never squishes.
  const afterClip = useAnimatedStyle(() => ({ width: divider.value * widthSV.value }));
  const handleStyle = useAnimatedStyle(() => ({ left: divider.value * widthSV.value }));

  return (
    <GestureDetector gesture={pan}>
      <View onLayout={onLayout} style={[styles.wrap, { height, borderRadius: radius }]}>
        {/* BEFORE fills the whole box */}
        <SkeletonImage source={before} style={StyleSheet.absoluteFill} radius={radius} />
        {!minimal && (
          <View style={styles.beforeTag}>
            <ThemedText style={Type.caption}>BEFORE</ThemedText>
          </View>
        )}

        {/* AFTER clipped from the left */}
        <Animated.View style={[styles.afterLayer, afterClip]}>
          <View style={{ width: boxWidth || '100%', height: '100%' }}>
            <SkeletonImage source={after} style={StyleSheet.absoluteFill} radius={0} />
            {afterTint ? (
              <>
                <View
                  pointerEvents="none"
                  style={[StyleSheet.absoluteFill, { backgroundColor: afterTint, opacity: 0.26 }]}
                />
                <View
                  pointerEvents="none"
                  style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF', opacity: 0.05 }]}
                />
              </>
            ) : null}
            {afterZones ? (
              <>
                {afterZones.top ? (
                  <View
                    pointerEvents="none"
                    style={[styles.zoneTop, { backgroundColor: afterZones.top }]}
                  />
                ) : null}
                {afterZones.bottom ? (
                  <View
                    pointerEvents="none"
                    style={[styles.zoneBottom, { backgroundColor: afterZones.bottom }]}
                  />
                ) : null}
                <View
                  pointerEvents="none"
                  style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF', opacity: 0.05 }]}
                />
              </>
            ) : null}
          </View>
          {!minimal && (
            <View style={styles.afterTag}>
              <ThemedText style={Type.caption}>AFTER</ThemedText>
            </View>
          )}
        </Animated.View>

        <Animated.View style={[styles.handle, handleStyle]}>
          <View style={styles.handleLine} />
          {!minimal && (
            <View style={styles.handleKnob}>
              <ThemedText style={styles.knobGlyph}>⇔</ThemedText>
            </View>
          )}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', backgroundColor: UI.skeletonBase },
  afterLayer: { position: 'absolute', top: 0, bottom: 0, left: 0, overflow: 'hidden' },
  zoneTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '44%', opacity: 0.32 },
  zoneBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '58%', opacity: 0.24 },
  beforeTag: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    backgroundColor: UI.overlay,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  afterTag: {
    position: 'absolute',
    left: Spacing.md,
    bottom: Spacing.md,
    backgroundColor: UI.overlay,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  handle: { position: 'absolute', top: 0, bottom: 0, width: 2, marginLeft: -1 },
  handleLine: { flex: 1, width: 2, backgroundColor: '#FFFFFF' },
  handleKnob: {
    position: 'absolute',
    top: '50%',
    left: -18,
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobGlyph: { color: '#000', fontSize: 16, fontWeight: '700' },
});
