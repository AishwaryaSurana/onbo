import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { StepScaffold } from '@/onboarding/StepScaffold';
import { Events, track } from '@/services/analytics/analytics';
import { Brand, Radii, Spacing, Type } from '@/theme';

const POINTS = [
  { icon: '📸', text: 'Take a quick selfie or pick a few photos of your face.' },
  { icon: '🔒', text: 'Photos stay on your device until you choose to generate.' },
  { icon: '🗑️', text: 'Delete your photos and results any time.' },
];

/** PLAN.md 3.4 — explain WHY before the OS dialog fires. CTA leads straight into the prompts. */
export function PermissionPrimer() {
  const { next } = useSequencer();
  const [, requestCamera] = useCameraPermissions();
  const [, requestLibrary] = ImagePicker.useMediaLibraryPermissions();

  const handleAllow = async () => {
    const cam = await requestCamera();
    const lib = await requestLibrary();
    const granted = cam?.granted || lib?.granted;
    track(granted ? Events.permissionGranted : Events.permissionDenied, {
      camera: !!cam?.granted,
      library: !!lib?.granted,
    });
    next();
  };

  return (
    <StepScaffold
      footer={
        <View style={{ gap: Spacing.sm }}>
          <PrimaryButton label="Allow access" onPress={handleAllow} />
          <PrimaryButton label="Not now" variant="ghost" onPress={next} />
        </View>
      }>
      <View style={styles.copy}>
        <ThemedText style={Type.hero}>One photo of you is all it takes</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          We use it to render your preview right here on your phone — nothing is uploaded
          without your say-so.
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
  list: { gap: Spacing.md, marginTop: Spacing.lg },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    backgroundColor: Brand.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  icon: { fontSize: 22 },
  rowText: { flex: 1 },
});
