import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreateResultModal } from '@/ui/organisms/CreateResultModal';
import { Countdown } from '@/ui/molecules/Countdown';
import { SkeletonImage } from '@/ui/molecules/SkeletonImage';
import { ThemedText } from '@/ui/atoms/ThemedText';
import { Radii, Spacing, Type, UI } from '@/theme';

type Src = number | { uri: string };

export interface TabSection {
  title: string;
  images: Src[];
  cta?: string;
  countdown?: boolean;
}

interface Props {
  subtitle: string;
  chips: string[];
  sections: TabSection[];
}

/** Shared "browse" screen for the AI Photos / AI Editor tabs (revealed when the paywall
 *  modal is dismissed). */
export function TabScreen({ subtitle, chips, sections }: Props) {
  const insets = useSafeAreaInsets();
  const [activeChip, setActiveChip] = useState(0);
  const [toast, setToast] = useState(true);
  const [picked, setPicked] = useState<Src | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setToast(false), 4500);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText color="textSecondary" style={[Type.body, styles.subtitle]}>
          {subtitle}
        </ThemedText>

        <View style={styles.chipRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <View style={styles.search}>
              <Text style={{ fontSize: 15 }}>🔍</Text>
            </View>
            {chips.map((c, i) => {
              const on = i === activeChip;
              return (
                <Pressable
                  key={c}
                  onPress={() => setActiveChip(i)}
                  style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{c}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {sections.map((s) => (
          <Section key={s.title} section={s} onPick={setPicked} />
        ))}
      </ScrollView>

      <CreateResultModal image={picked} onClose={() => setPicked(null)} />

      {toast && (
        <Pressable
          style={[styles.toast, { top: insets.top + Spacing.sm }]}
          onPress={() => setToast(false)}>
          <Text style={styles.toastCheck}>✓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitle}>You&apos;ve been given 16 credits!</Text>
            <Text style={styles.toastBody}>Come back tomorrow to keep your streak going.</Text>
          </View>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

function Section({ section, onPick }: { section: TabSection; onPick: (img: Src) => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
        {section.countdown && <Countdown />}
        {section.cta && (
          <Pressable style={styles.createBtn} onPress={() => onPick(section.images[0])}>
            <Text style={styles.createTxt}>{section.cta}</Text>
          </Pressable>
        )}
      </View>
      {section.countdown && (
        <ThemedText color="textMuted" style={Type.caption}>
          Next drop in
        </ThemedText>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tiles}>
        {section.images.map((img, i) => (
          <Pressable key={i} onPress={() => onPick(img)}>
            <SkeletonImage source={img} style={styles.tile} radius={Radii.md} fallbackLabel="" />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UI.bg },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.sm },
  subtitle: { marginTop: Spacing.xs },

  chipRow: { marginTop: Spacing.sm, marginHorizontal: -Spacing.lg },
  chips: { gap: Spacing.sm, paddingHorizontal: Spacing.lg, alignItems: 'center' },
  search: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: UI.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: UI.border,
  },
  chipOn: { backgroundColor: '#0B0B0F', borderColor: '#0B0B0F' },
  chipTxt: { color: UI.text, fontSize: 14, fontWeight: '700' },
  chipTxtOn: { color: '#FFFFFF' },

  section: { gap: Spacing.sm, marginTop: Spacing.lg },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: UI.text, flexShrink: 1 },
  createBtn: {
    marginLeft: 'auto',
    backgroundColor: UI.accent,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  createTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  tiles: { gap: Spacing.sm, paddingVertical: 2 },
  tile: { width: 150, height: 190 },







  toast: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  toastCheck: {
    color: UI.success,
    fontSize: 18,
    fontWeight: '900',
    borderWidth: 2,
    borderColor: UI.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  toastTitle: { color: UI.text, fontSize: 15, fontWeight: '800' },
  toastBody: { color: UI.textSecondary, fontSize: 13, marginTop: 2 },
});
