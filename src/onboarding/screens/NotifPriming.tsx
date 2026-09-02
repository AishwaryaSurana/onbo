import * as Notifications from 'expo-notifications';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { StepScaffold } from '@/onboarding/StepScaffold';
import { Events, track } from '@/services/analytics/analytics';
import { Radii, Spacing, Type, UI } from '@/theme';

const POINTS = [
  { icon: '📤', text: 'Know the moment your export is ready.' },
  { icon: '🎁', text: 'First dibs on new templates and free credits.' },
  { icon: '🔕', text: 'No spam — turn it off any time in Settings.' },
];

/** Step 7 — soft close. Paywall was declined; the user still lands in the app (limited).
 *  Ask for push here, framed around value — not on launch. */
export function NotifPriming() {
  const { goToDashboard } = useSequencer();

  const allow = async () => {
    try {
      const res = await Notifications.requestPermissionsAsync();
      track(res.granted ? Events.permissionGranted : Events.permissionDenied, { kind: 'push' });
    } catch {
      track(Events.permissionDenied, { kind: 'push' });
    }
    goToDashboard();
  };

  return (
    <StepScaffold
      hideHeader
      footer={
        <View style={{ gap: Spacing.sm }}>
          <PrimaryButton label="Turn on notifications" onPress={allow} />
          <PrimaryButton label="Not now" variant="ghost" onPress={goToDashboard} />
        </View>
      }>
      <View style={styles.copy}>
        <ThemedText style={styles.emoji}>🔔</ThemedText>
        <ThemedText style={Type.hero}>Get notified when your export is ready</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          You&apos;re in — on the free plan for now (watermark, fewer templates). We&apos;ll ping you
          when renders finish so you don&apos;t have to wait around.
        </ThemedText>
      </View>

      <View style={styles.list}>
        {POINTS.map((p) => (
          <View key={p.text} style={styles.row}>
            <ThemedText style={styles.icon}>{p.icon}</ThemedText>
            <ThemedText style={[Type.body, styles.rowText]}>{p.text}</ThemedText>
          </View>
        ))}
      </View>
    </StepScaffold>
  );
}

const styles = StyleSheet.create({
  copy: { gap: Spacing.sm, marginTop: Spacing.sm },
  emoji: { fontSize: 44 },
  list: { gap: Spacing.md, marginTop: Spacing.lg },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    backgroundColor: UI.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  icon: { fontSize: 22 },
  rowText: { flex: 1 },
});
