import { Image, type ImageContentFit } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Skeleton } from '@/ui/atoms/Skeleton';
import { ThemedText } from '@/ui/atoms/ThemedText';
import { UI, Radii, Spacing, Type } from '@/theme';

type Source = number | { uri: string } | null | undefined;

interface Props {
  source: Source;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  radius?: number;
  /** Shown in the error/empty fallback. Empty string hides the label (icon only). */
  fallbackLabel?: string;
  accessibilityLabel?: string;
}

/**
 * The ONLY image renderer allowed inside onboarding screens (PLAN.md 4.1).
 * Guarantees: a visible shimmer + spinner while loading, and a defined fallback if the
 * source is missing or fails — a hero area is NEVER a blank gap.
 */
export function SkeletonImage({
  source,
  style,
  contentFit = 'cover',
  radius = Radii.md,
  fallbackLabel = 'Preview unavailable',
  accessibilityLabel,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const showFallback = errored || source == null;

  return (
    <View style={[styles.container, { borderRadius: radius }, style]}>
      {!showFallback && (
        <Image
          source={source ?? undefined}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          transition={220}
          accessibilityLabel={accessibilityLabel}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}

      {!showFallback && !loaded && (
        <View style={StyleSheet.absoluteFill}>
          <Skeleton style={StyleSheet.absoluteFill} radius={radius} />
          <View style={styles.center}>
            <ActivityIndicator color={UI.textSecondary} />
          </View>
        </View>
      )}

      {showFallback && (
        <View style={styles.center}>
          <ThemedText style={styles.fallbackIcon}>🖼️</ThemedText>
          {fallbackLabel ? (
            <ThemedText color="textMuted" style={Type.caption}>
              {fallbackLabel}
            </ThemedText>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: UI.skeletonBase,
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  fallbackIcon: { fontSize: 28 },
});
