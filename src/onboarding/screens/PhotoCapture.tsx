import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SkeletonImage } from '@/components/SkeletonImage';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { Events, track } from '@/services/analytics/analytics';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Radii, Spacing, Type, UI } from '@/theme';

type Mode = 'camera' | 'review';

const ACCESS_POINTS = [
  { icon: '🎨', text: 'We apply the look to a photo you choose.' },
  { icon: '📴', text: 'Nothing is uploaded without your say-so.' },
  { icon: '🗑️', text: 'Delete your photos and results any time.' },
];

/** Aha-moment input. The selfie screen is what you see; a photo-access popup opens over it
 *  first (primes the OS prompt). */
export function PhotoCapture() {
  const { next } = useSequencer();
  const insets = useSafeAreaInsets();
  const setPhoto = useOnboardingStore((s) => s.setPhoto);
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const [mode, setMode] = useState<Mode>('camera');
  const [shot, setShot] = useState<{ uri: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [primer, setPrimer] = useState(true);

  const allowAccess = async () => {
    const cam = await requestPermission();
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    track(cam?.granted || lib.granted ? Events.permissionGranted : Events.permissionDenied, {
      camera: !!cam?.granted,
      library: !!lib.granted,
    });
    setPrimer(false);
  };

  const commit = (uri: string, source: 'camera' | 'library' | 'sample') => {
    setPhoto(uri, source);
    track(Events.photoCaptured, { source });
    next();
  };

  const takeShot = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) {
        setShot({ uri: photo.uri });
        setMode('review');
      }
    } finally {
      setBusy(false);
    }
  };

  const pickFromLibrary = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets[0]?.uri) commit(res.assets[0].uri, 'library');
  };

  const useSample = () => commit('sample://stock-portrait', 'sample');

  if (mode === 'review' && shot) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.head}>
          <ThemedText style={Type.title}>Use this one?</ThemedText>
          <ThemedText color="textSecondary" style={Type.body}>
            Clear and front-facing works best. You can retake.
          </ThemedText>
        </View>
        <SkeletonImage source={shot} style={styles.reviewImage} radius={Radii.xl} />
        <View style={styles.footer}>
          <PrimaryButton label="Apply the look" onPress={() => commit(shot.uri, 'camera')} />
          <PrimaryButton
            label="Retake"
            variant="ghost"
            onPress={() => {
              setShot(null);
              setMode('camera');
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const cameraReady = permission?.granted;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.head}>
        <ThemedText style={Type.title}>Take a selfie</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          Face the light, no sunglasses. We&apos;ll apply your look to it next.
        </ThemedText>
      </View>

      <View style={styles.stage}>
        {cameraReady ? (
          <>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
            <View pointerEvents="none" style={styles.guide} />
            {!Device.isDevice && (
              <View pointerEvents="none" style={styles.simHint}>
                <ThemedText style={[Type.caption, { color: '#FFFFFF' }]}>
                  Simulator has no camera — use “library” or “sample” below
                </ThemedText>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noCam}>
            <ThemedText style={styles.noCamIcon}>📷</ThemedText>
            <ThemedText color="textSecondary" style={[Type.body, { textAlign: 'center' }]}>
              Camera is off. Pick a photo from your library or use a sample.
            </ThemedText>
            {permission && !permission.granted && permission.canAskAgain && (
              <PrimaryButton label="Enable camera" variant="secondary" onPress={requestPermission} />
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {cameraReady && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            onPress={takeShot}
            style={styles.shutter}>
            {busy ? <ActivityIndicator color={UI.accent} /> : <View style={styles.shutterInner} />}
          </Pressable>
        )}
        <PrimaryButton label="Choose from library" variant="secondary" onPress={pickFromLibrary} />
        <PrimaryButton label="Use a sample photo" variant="ghost" onPress={useSample} />
      </View>

      {/* Photo-access popup over the selfie screen */}
      <Modal transparent visible={primer} animationType="slide" onRequestClose={() => setPrimer(false)}>
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.md) + Spacing.sm }]}>
            <ThemedText style={Type.title}>We&apos;ll need access to your photos</ThemedText>
            <ThemedText color="textSecondary" style={Type.body}>
              …to apply this look to one of them. Nothing is uploaded without your say-so.
            </ThemedText>
            <View style={styles.list}>
              {ACCESS_POINTS.map((p) => (
                <View key={p.text} style={styles.row}>
                  <ThemedText style={styles.rowIcon}>{p.icon}</ThemedText>
                  <ThemedText style={[Type.body, { flex: 1 }]}>{p.text}</ThemedText>
                </View>
              ))}
            </View>
            <PrimaryButton label="Allow photo access" onPress={allowAccess} />
            <PrimaryButton label="Not now" variant="ghost" onPress={() => setPrimer(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UI.bg, paddingHorizontal: Spacing.lg },
  head: { gap: Spacing.sm, paddingTop: Spacing.sm },
  stage: {
    flex: 1,
    marginVertical: Spacing.lg,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: UI.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guide: {
    width: '62%',
    aspectRatio: 0.78,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  simHint: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: UI.overlay,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  noCam: { alignItems: 'center', gap: Spacing.md, padding: Spacing.xl },
  noCamIcon: { fontSize: 40 },
  reviewImage: { flex: 1, marginVertical: Spacing.lg },
  footer: { gap: Spacing.sm, paddingBottom: Spacing.sm, alignItems: 'stretch' },
  shutter: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: UI.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: UI.accent },

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: UI.bg,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  list: { gap: Spacing.sm, marginVertical: Spacing.xs },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    backgroundColor: UI.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  rowIcon: { fontSize: 20 },
});
