import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Brand, Spacing, Type } from '@/theme';

export default function Stub() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.center}>
        <ThemedText style={Type.subtitle}>generations</ThemedText>
        <ThemedText color="textMuted" style={Type.caption}>Not part of the onboarding build</ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
});
