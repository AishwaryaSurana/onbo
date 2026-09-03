import { useEffect } from 'react';
import { StyleSheet, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SparkleProps {
  /** Positioning / offset overrides applied on top of the base style. */
  style?: TextStyle;
  size?: number;
  /** ms before the twinkle starts — stagger several sparkles for an organic effect. */
  delay?: number;
  color?: string;
}

/** A single ✦ that twinkles forever (looping opacity + scale pulse). */
export function Sparkle({ style, size = 20, delay = 0, color = 'rgba(255,255,255,0.95)' }: SparkleProps) {
  const progress = useSharedValue(0.15);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 650, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [progress, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.65 + progress.value * 0.55 }],
  }));

  return (
    <Animated.Text style={[styles.base, { fontSize: size, color }, style, animatedStyle]}>
      ✦
    </Animated.Text>
  );
}

const styles = StyleSheet.create({ base: {} });
