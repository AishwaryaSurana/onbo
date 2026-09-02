import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/ProgressBar';
import { SkipButton } from '@/components/SkipButton';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { Brand, Spacing } from '@/theme';

interface Props {
  children: ReactNode;
  /** Sticky bottom area - usually the primary CTA. */
  footer?: ReactNode;
  /** Hide the top progress/nav row (e.g. immersive Generating / ResultReveal). */
  hideHeader?: boolean;
  /** Scroll the content area (default true). */
  scroll?: boolean;
  /** Lift the footer above the keyboard (screens with text inputs). */
  avoidKeyboard?: boolean;
  contentStyle?: object;
}

/** Shared chrome for every onboarding screen: consistent bg, back, progress, skip, CTA. */
export function StepScaffold({
  children,
  footer,
  hideHeader = false,
  scroll = true,
  avoidKeyboard = false,
  contentStyle,
}: Props) {
  const { back, skip, canGoBack, skippable, progress } = useSequencer();
  const Body = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={avoidKeyboard && Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {!hideHeader ? (
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={back}
              disabled={!canGoBack}
              hitSlop={12}
              style={styles.backBtn}
            >
              <ThemedText color={canGoBack ? 'text' : 'textMuted'} style={styles.backChevron}>
                {'‹'}
              </ThemedText>
            </Pressable>

            <View style={styles.progressWrap}>
              <ProgressBar value={progress} />
            </View>

            <View style={styles.skipSlot}>
              {skippable ? <SkipButton onPress={skip} /> : null}
            </View>
          </View>
        ) : null}

        <Body
          style={styles.body}
          contentContainerStyle={[
            scroll ? styles.bodyContent : styles.bodyContentFlex,
            contentStyle,
          ]}
          {...(scroll ? { keyboardShouldPersistTaps: 'handled' as const } : {})}
        >
          {children}
        </Body>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 30, lineHeight: 30, marginTop: -4 },
  progressWrap: { flex: 1 },
  skipSlot: { minWidth: 44, alignItems: 'flex-end' },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.lg },
  bodyContentFlex: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.border,
    backgroundColor: Brand.bg,
  },
});
