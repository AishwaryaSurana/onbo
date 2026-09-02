import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SkeletonImage } from '@/components/SkeletonImage';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { STOCK_PORTRAIT } from '@/onboarding/manifest';
import { Events, track } from '@/services/analytics/analytics';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Brand, Radii, Spacing, Type } from '@/theme';

type Mode = 'camera' | 'review';

/**
 * PLAN.md 3.5 + user ask — a real selfie screen. Camera is primary; library and a
 * curated sample photo are always available so the flow never dead-ends.
 */
export function PhotoCapture() {
  const { next } = useSequencer();
  const setPhoto = useOnboardingStore((s) => s.setPhoto);
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const [mode, setMode] = useState<Mode>('camera');
  const [shot, setShot] = useState<{ uri: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) requestPermission();
  }, [permission, requestPermission]);

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
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]?.uri) commit(res.assets[0].uri, 'library');
  };

  const useSample = () => commit('sample://stock-portrait', 'sample');

  // ---- Review captured shot ----
  if (mode === 'review' && shot) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.reviewHead}>
          <ThemedText style={Type.title}>Looking good?</ThemedText>
          <ThemedText color="textSecondary" style={Type.body}>
            Clear, front-facing, one person. You can retake if you want.
          </ThemedText>
        </View>
        <SkeletonImage source={shot} style={styles.reviewImage} radius={Radii.xl} />
        <View style={styles.footer}>
          <PrimaryButton label="Use this photo" onPress={() => commit(shot.uri, 'camera')} />
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
          Face the light. No sunglasses or hats. This is the only photo we need for your
          preview.
        </ThemedText>
      </View>

      <View style={styles.stage}>
        {cameraReady ? (
          <>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
            <View pointerEvents="none" style={styles.guide} />
            {!Device.isDevice && (
              <View pointerEvents="none" style={styles.simHint}>
                <ThemedText style={Type.caption}>
                  Simulator has no camera — use “library” or “sample” below
                </ThemedText>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noCam}>
            <ThemedText style={styles.noCamIcon}>📷</ThemedText>
            <ThemedText color="textSecondary" style={[Type.body, { textAlign: 'center' }]}>
              Camera is off. You can still pick a photo from your library or use a sample.
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
            {busy ? <ActivityIndicator color={Brand.bg} /> : <View style={styles.shutterInner} />}
          </Pressable>
        )}
        <PrimaryButton label="Choose from library" variant="secondary" onPress={pickFromLibrary} />
        <PrimaryButton label="Use a sample photo" variant="ghost" onPress={useSample} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.bg, paddingHorizontal: Spacing.lg },
  head: { gap: Spacing.sm, paddingTop: Spacing.sm },
  reviewHead: { gap: Spacing.sm, paddingTop: Spacing.sm },
  stage: {
    flex: 1,
    marginVertical: Spacing.lg,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guide: {
    width: '62%',
    aspectRatio: 0.78,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  simHint: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Brand.overlay,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: Brand.bg,
    backgroundColor: '#FFFFFF',
  },
});
