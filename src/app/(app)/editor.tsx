import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TabPaywallGate } from '@/components/TabPaywallGate';
import { ThemedText } from '@/components/ThemedText';
import { Spacing, Type, UI } from '@/theme';

export default function AIEditor() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.center}>
        <ThemedText style={Type.subtitle}>AI Editor</ThemedText>
        <ThemedText color="textMuted" style={Type.caption}>Retouch and restyle any photo</ThemedText>
      </View>
      <TabPaywallGate />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UI.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
});
