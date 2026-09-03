import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STOCK_PORTRAIT } from '@/onboarding/manifest';
import { Radii, Spacing } from '@/theme';

type Src = number | { uri: string };
type Stage = 'pick' | 'generating' | 'preview' | 'purchasing' | 'unlocked';

const UNLOCK_PRICE = '$0.99';
const GEN_MS = 1800;
const PREVIEW_BLUR = 100; // ~80% — detail is unreadable

/**
 * Tap a tile on the AI tabs -> ask for a selfie / upload -> fake "generating" ->
 * blurred preview of THAT photo -> a nominal one-time unlock to "download" it.
 * Nothing is actually generated.
 */
export function CreateResultModal({ image, onClose }: { image: Src | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<Stage>('pick');
  const [photo, setPhoto] = useState<Src | null>(null);

  useEffect(() => {
    if (image == null) return;
    setStage('pick');
    setPhoto(null);
  }, [image]);

  const start = (src: Src) => {
    setPhoto(src);
    setStage('generating');
    setTimeout(() => setStage('preview'), GEN_MS);
  };

  const takeSelfie = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      const res = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        quality: 0.7,
      });
      if (!res.canceled && res.assets[0]?.uri) start({ uri: res.assets[0].uri });
    } catch {
      /* simulator / no camera — user can upload or use a sample */
    }
  };

  const upload = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets[0]?.uri) start({ uri: res.assets[0].uri });
  };

  const buy = () => {
    setStage('purchasing');
    setTimeout(() => setStage('unlocked'), 900);
  };

  const locked = stage === 'preview' || stage === 'purchasing';
  const topPad = Math.max(insets.top, 24);
  const botPad = Math.max(insets.bottom, 16);

  return (
    <Modal
      transparent
      visible={image != null}
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.root}>
        <LinearGradient colors={['#1b1420', '#0e0b12']} style={StyleSheet.absoluteFill} />

        <View style={[styles.body, { paddingTop: topPad + 44, paddingBottom: botPad }]}>
          {stage === 'pick' && (
            <View style={styles.center}>
              <Text style={styles.emoji}>📸</Text>
              <Text style={styles.h}>Add your photo</Text>
              <Text style={styles.sub}>We&apos;ll apply this style to a photo of you.</Text>
              <View style={styles.pickBtns}>
                <Pressable style={styles.cta} onPress={takeSelfie}>
                  <Text style={styles.ctaTxt}>Take a selfie</Text>
                </Pressable>
                <Pressable style={[styles.cta, styles.ctaAlt]} onPress={upload}>
                  <Text style={[styles.ctaTxt, { color: '#fff' }]}>Upload a photo</Text>
                </Pressable>
                <Pressable style={styles.ghost} onPress={() => start(STOCK_PORTRAIT)}>
                  <Text style={styles.ghostTxt}>Use a sample photo</Text>
                </Pressable>
              </View>
            </View>
          )}

          {stage === 'generating' && (
            <View style={styles.center}>
              <ActivityIndicator color="#F5620E" size="large" />
              <Text style={styles.h}>Creating your image…</Text>
              <Text style={styles.sub}>Applying the style and rendering details</Text>
            </View>
          )}

          {(stage === 'preview' || stage === 'purchasing' || stage === 'unlocked') && (
            <View style={styles.center}>
              {photo != null && (
                <View style={styles.imgWrap}>
                  <Image
                    source={photo}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    blurRadius={locked ? PREVIEW_BLUR : 0}
                    transition={250}
                  />
                  {locked && (
                    <>
                      <View pointerEvents="none" style={styles.previewScrim} />
                      <View style={styles.chip}>
                        <Text style={styles.chipTxt}>🔒 Preview</Text>
                      </View>
                    </>
                  )}
                  {stage === 'unlocked' && (
                    <View style={[styles.chip, styles.chipOk]}>
                      <Text style={styles.chipTxt}>✓ Saved to Photos</Text>
                    </View>
                  )}
                </View>
              )}
              <Text style={styles.h}>
                {stage === 'unlocked' ? 'Downloaded in full quality' : 'Your image is ready'}
              </Text>
              <Text style={styles.sub}>
                {stage === 'unlocked'
                  ? 'Watermark-free, full resolution.'
                  : 'Unlock to remove the blur and save the full-res file.'}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            {stage === 'unlocked' ? (
              <Pressable style={styles.cta} onPress={onClose}>
                <Text style={styles.ctaTxt}>Done</Text>
              </Pressable>
            ) : stage === 'preview' || stage === 'purchasing' ? (
              <>
                <Pressable style={styles.cta} onPress={buy} disabled={stage === 'purchasing'}>
                  <Text style={styles.ctaTxt}>
                    {stage === 'purchasing'
                      ? 'Processing…'
                      : `Download full quality · ${UNLOCK_PRICE}`}
                  </Text>
                </Pressable>
                <Text style={styles.legal}>One-time unlock for this image · no subscription</Text>
              </>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={onClose}
          hitSlop={16}
          style={[styles.close, { top: topPad }]}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <Text style={styles.x}>✕</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e0b12' },
  body: { flex: 1, paddingHorizontal: Spacing.lg },
  close: {
    position: 'absolute',
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  x: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md },
  emoji: { fontSize: 40 },
  pickBtns: { alignSelf: 'stretch', gap: Spacing.sm, marginTop: Spacing.lg },
  imgWrap: {
    width: 300,
    height: 380,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: '#231b2a',
    marginBottom: Spacing.lg,
  },
  chip: {
    position: 'absolute',
    bottom: Spacing.md,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  previewScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20,16,25,0.18)',
  },
  chipOk: { backgroundColor: 'rgba(31,169,113,0.92)' },
  chipTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  h: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center' },
  footer: { gap: Spacing.xs },
  cta: {
    height: 56,
    borderRadius: Radii.pill,
    backgroundColor: '#F5620E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaAlt: { backgroundColor: 'rgba(255,255,255,0.14)' },
  ctaTxt: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  ghost: { height: 44, alignItems: 'center', justifyContent: 'center' },
  ghostTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '600' },
  legal: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' },
});
