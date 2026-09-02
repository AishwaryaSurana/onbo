import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Brand, Radii, Spacing, Type } from '@/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  accessibilityHint,
}: Props) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && !disabled && { opacity: 0.85 },
        disabled && { opacity: 0.4 },
        style,
      ]}>
      <View style={styles.inner}>
        {loading && <ActivityIndicator color={isPrimary ? Brand.textOnAccent : Brand.text} />}
        <ThemedText
          color={isPrimary ? 'text' : isSecondary ? 'text' : 'textSecondary'}
          style={Type.button}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  primary: { backgroundColor: Brand.accent },
  secondary: { backgroundColor: Brand.surfaceElevated, borderWidth: 1, borderColor: Brand.border },
  ghost: { backgroundColor: 'transparent' },
});
