import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Brand, Radii, Spacing, Type } from '@/theme';

const TERMS_URL = 'https://example.com/terms';
const PRIVACY_URL = 'https://example.com/privacy';

/**
 * PLAN.md 4.3 — exactly ONE consent control. Age + Terms + Privacy in a single line,
 * full text linked out. No stacked checkboxes, no inline policy-section citations.
 */
export function ConsentCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={styles.row}>
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked && <ThemedText style={styles.check}>✓</ThemedText>}
      </View>
      <ThemedText color="textSecondary" style={[Type.caption, styles.text]}>
        I&apos;m 18+ and agree to the{' '}
        <ThemedText color="accent" style={Type.caption} onPress={() => Linking.openURL(TERMS_URL)}>
          Terms
        </ThemedText>{' '}
        and{' '}
        <ThemedText color="accent" style={Type.caption} onPress={() => Linking.openURL(PRIVACY_URL)}>
          Privacy Policy
        </ThemedText>
        .
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  box: {
    width: 22,
    height: 22,
    borderRadius: Radii.sm,
    borderWidth: 2,
    borderColor: Brand.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: Brand.accent, borderColor: Brand.accent },
  check: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', lineHeight: 16 },
  text: { flex: 1 },
});
