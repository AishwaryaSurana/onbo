import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Spacing, Type, UI } from '@/theme';

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
  const labelColor = isPrimary ? UI.textOnAccent : isSecondary ? UI.text : UI.textSecondary;

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
        {loading && <ActivityIndicator color={labelColor} />}
        <Text style={[Type.button, { color: labelColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  primary: { backgroundColor: UI.accent },
  secondary: { backgroundColor: UI.surfaceElevated, borderWidth: 1.5, borderColor: UI.border },
  ghost: { backgroundColor: 'transparent' },
});
