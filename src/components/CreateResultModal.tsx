import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radii, Spacing } from '@/theme';

type Src = number | { uri: string };
type Stage = 'generating' | 'preview' | 'purchasing' | 'unlocked';

const UNLOCK_PRICE = '$0.99';
const GEN_MS = 2200;
const PREVIEW_BLUR = 90; // heavy (~70%) — enough that detail is unreadable

/**
 * Tap a tile on the AI tabs -> fake "generating" -> blurred preview -> a nominal
 * one-time unlock to "download" the full-res image. Nothing is actually generated.
 */
export function CreateResultModal({ image, onClose }: { image: Src | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<Stage>('generating');

  useEffect(() => {
    if (!image) return;
    setStage('generating');
    const t = setTimeout(() => setStage('preview'), GEN_MS);
    return () => clearTimeout(t);
  }, [image]);

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
          {stage === 'generating' ? (
            <View style={styles.center}>
              <ActivityIndicator color="#F5620E" size="large" />
              <Text style={styles.h}>Creating your image…</Text>
              <Text style={styles.sub}>Applying the style and rendering details</Text>
            </View>
          ) : (
            <View style={styles.center}>
              {image != null && (
                <View style={styles.imgWrap}>
                  <Image
                    source={image}
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
            ) : stage !== 'generating' ? (
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

        {/* rendered last so it always sits on top and stays tappable */}
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
  ctaTxt: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  legal: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' },
});
