import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Spacing, Type } from '@/theme';

/** Small, top-right, never forces the tap (PLAN.md 3.2). */
export function SkipButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}>
      <ThemedText color="textMuted" style={[Type.caption, styles.label]}>
        SKIP
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
  label: { letterSpacing: 1 },
});
