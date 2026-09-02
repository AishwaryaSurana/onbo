import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radii, Spacing } from '@/theme';

type Src = number | { uri: string };
type Stage = 'generating' | 'preview' | 'purchasing' | 'unlocked';

const UNLOCK_PRICE = '$0.99';
const GEN_MS = 2200;

/**
 * Tap a tile on the AI tabs -> fake "generating" -> blurred preview -> a nominal
 * one-time unlock to "download" the full-res image. Nothing is actually generated.
 */
export function CreateResultModal({ image, onClose }: { image: Src | null; onClose: () => void }) {
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

  return (
    <Modal
      transparent
      visible={image != null}
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.root}>
        <LinearGradient colors={['#1b1420', '#0e0b12']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Pressable style={styles.close} onPress={onClose} hitSlop={12}>
            <Text style={styles.x}>✕</Text>
          </Pressable>

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
                    blurRadius={locked ? 24 : 0}
                    transition={250}
                  />
                  {locked && (
                    <View style={styles.chip}>
                      <Text style={styles.chipTxt}>🔒 Preview</Text>
                    </View>
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
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e0b12' },
  safe: { flex: 1 },
  close: { position: 'absolute', right: Spacing.lg, top: Spacing.sm, zIndex: 5, padding: 6 },
  x: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl },
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
    left: '50%',
    transform: [{ translateX: -70 }],
    minWidth: 140,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  chipOk: { backgroundColor: 'rgba(31,169,113,0.9)' },
  chipTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  h: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center' },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: Spacing.xs },
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
