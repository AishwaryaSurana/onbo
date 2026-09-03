import { Text, type TextProps } from 'react-native';

import { UI } from '@/theme';

type BrandColor = 'text' | 'textSecondary' | 'textMuted' | 'accent' | 'danger' | 'success';

export interface ThemedTextProps extends TextProps {
  color?: BrandColor;
}

/** Single-theme text. No color-scheme branching anywhere in the app (PLAN.md §Architecture). */
export function ThemedText({ color = 'text', style, ...rest }: ThemedTextProps) {
  return <Text style={[{ color: UI[color] }, style]} {...rest} />;
}
