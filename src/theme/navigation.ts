import { UI } from '@/theme/tokens';

/** React Navigation theme (passed to expo-router's ThemeProvider) — light, matches `UI`. */
export const navTheme = {
  dark: false,
  colors: {
    primary: UI.accent,
    background: UI.bg,
    card: UI.bg,
    text: UI.text,
    border: UI.border,
    notification: UI.accent,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};
