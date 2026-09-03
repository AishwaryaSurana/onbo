import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/ui/atoms';
import { Spacing, Type, UI } from '@/theme';

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
  safe: { flex: 1, backgroundColor: UI.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
});
