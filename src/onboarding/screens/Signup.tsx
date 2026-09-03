import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SIGNIN_BG } from '@/onboarding/manifest';
import { useSequencer } from '@/onboarding/SequencerContext';
import { Events, track } from '@/services/analytics/analytics';
import type { AuthMethod } from '@/services/auth/AuthService';
import { mockAuth } from '@/services/auth/mockAuth';
import { useSessionStore } from '@/store/sessionStore';
import { Radii, Spacing, UI } from '@/theme';

const TERMS_URL = 'https://example.com/terms';
const PRIVACY_URL = 'https://example.com/privacy';

/** Step 5 — deferred signup on a full-bleed image background (Aragon style).
 *  Social one-tap primary; email = magic link. Only after the aha moment. */
export function Signup() {
  const { next } = useSequencer();
  const signIn = useSessionStore((s) => s.signIn);

  const [view, setView] = useState<'choices' | 'email' | 'sent'>('choices');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<AuthMethod | null>(null);

  const complete = (method: AuthMethod, displayName: string) => {
    signIn(displayName);
    track(Events.signupCompleted, { method });
    next();
  };

  const withProvider = async (method: 'apple' | 'google' | 'facebook') => {
    if (busy) return;
    setBusy(method);
    track(Events.signupStarted, { method });
    try {
      const user =
        method === 'apple'
          ? await mockAuth.signInWithApple()
          : method === 'google'
            ? await mockAuth.signInWithGoogle()
            : await mockAuth.signInWithFacebook();
      complete(method, user.displayName);
    } finally {
      setBusy(null);
    }
  };

  const sendLink = async () => {
    if (busy || !email.includes('@')) return;
    setBusy('email');
    track(Events.signupStarted, { method: 'email' });
    setView('sent');
    try {
      const user = await mockAuth.signInWithEmailLink(email.trim());
      complete('email', user.displayName);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={SIGNIN_BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.92)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.logo}>
          <Text style={styles.logoGlyph}>🔥</Text>
        </View>

        <KeyboardAvoidingView
          style={styles.bottom}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {view === 'choices' && (
            <>
              <Text style={styles.heading}>Sign in to continue</Text>
              <AuthButton label="Continue with Google" onPress={() => withProvider('google')} busy={busy === 'google'}>
                <Text style={[styles.mark, { color: '#4285F4' }]}>G</Text>
              </AuthButton>
              <AuthButton label="Continue with Facebook" onPress={() => withProvider('facebook')} busy={busy === 'facebook'}>
                <View style={styles.fb}><Text style={styles.fbF}>f</Text></View>
              </AuthButton>
              <AuthButton label="Continue with Apple" onPress={() => withProvider('apple')} busy={busy === 'apple'}>
                <Text style={[styles.mark, { color: '#000' }]}></Text>
              </AuthButton>

              <Text style={styles.or}>OR</Text>

              <AuthButton label="Continue with Email" onPress={() => setView('email')}>
                <Text style={[styles.mark, { color: UI.accent, fontSize: 18 }]}>✉</Text>
              </AuthButton>

              <Text style={styles.legal}>
                By continuing with one of the options above, you agree to our{' '}
                <Text style={styles.link} onPress={() => Linking.openURL(TERMS_URL)}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={styles.link} onPress={() => Linking.openURL(PRIVACY_URL)}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </>
          )}

          {view === 'email' && (
            <>
              <Text style={styles.heading}>What&apos;s your email?</Text>
              <Text style={styles.sub}>We&apos;ll send a magic link — no password, no code to copy.</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor="rgba(255,255,255,0.5)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                style={styles.input}
              />
              <PrimaryButton
                label="Email me a magic link"
                onPress={sendLink}
                loading={busy === 'email'}
                disabled={!email.includes('@')}
              />
              <Pressable onPress={() => setView('choices')} hitSlop={8} style={styles.backBtn}>
                <Text style={styles.backTxt}>Back</Text>
              </Pressable>
            </>
          )}

          {view === 'sent' && (
            <>
              <Text style={styles.heading}>Check your email</Text>
              <Text style={styles.sub}>
                We sent a magic link to {email}. Tap it and you&apos;re in.
              </Text>
              <Text style={[styles.sub, { opacity: 0.6 }]}>(Demo: signing you in automatically…)</Text>
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function AuthButton({
  label,
  onPress,
  busy,
  children,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [styles.authBtn, pressed && { opacity: 0.85 }, busy && { opacity: 0.6 }]}>
      <Text style={styles.authLabel}>{label}</Text>
      <View style={styles.authIcon}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  safe: { flex: 1, justifyContent: 'space-between' },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: UI.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.lg,
    marginTop: Spacing.sm,
  },
  logoGlyph: { fontSize: 22 },
  bottom: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.md },
  heading: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  sub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
  },
  authLabel: { flex: 1, color: '#111', fontSize: 17, fontWeight: '700' },
  authIcon: { width: 28, alignItems: 'center', justifyContent: 'center' },
  mark: { fontSize: 20, fontWeight: '800' },
  fb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fbF: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  or: { color: 'rgba(255,255,255,0.85)', fontWeight: '800', textAlign: 'center', letterSpacing: 1 },
  legal: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  link: { color: '#FFFFFF', textDecorationLine: 'underline', fontWeight: '600' },
  input: {
    height: 54,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  backBtn: { alignSelf: 'center', padding: Spacing.sm },
  backTxt: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
});
