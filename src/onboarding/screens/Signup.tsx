import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ConsentCheckbox } from '@/components/ConsentCheckbox';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { useSequencer } from '@/onboarding/SequencerContext';
import { StepScaffold } from '@/onboarding/StepScaffold';
import { Events, track } from '@/services/analytics/analytics';
import type { AuthMethod } from '@/services/auth/AuthService';
import { mockAuth } from '@/services/auth/mockAuth';
import { useSessionStore } from '@/store/sessionStore';
import { Radii, Spacing, Type, UI } from '@/theme';

type View_ = 'choices' | 'email' | 'sent';

/** Step 5 — deferred, lightweight signup. Apple/Google one-tap primary (not a form),
 *  email as a magic link, one consent checkbox. Only after the aha moment. */
export function Signup() {
  const { next } = useSequencer();
  const signIn = useSessionStore((s) => s.signIn);

  const [view, setView] = useState<View_>('choices');
  const [consent, setConsent] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<AuthMethod | null>(null);

  const complete = (method: AuthMethod, displayName: string) => {
    signIn(displayName);
    track(Events.signupCompleted, { method });
    next();
  };

  const withProvider = async (method: 'apple' | 'google') => {
    if (!consent || busy) return;
    setBusy(method);
    track(Events.signupStarted, { method });
    try {
      const user =
        method === 'apple' ? await mockAuth.signInWithApple() : await mockAuth.signInWithGoogle();
      complete(method, user.displayName);
    } finally {
      setBusy(null);
    }
  };

  const sendLink = async () => {
    if (!consent || busy || !email.includes('@')) return;
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

  if (view === 'sent') {
    return (
      <StepScaffold>
        <View style={styles.center}>
          <ThemedText style={styles.emoji}>📩</ThemedText>
          <ThemedText style={Type.title}>Check your email</ThemedText>
          <ThemedText color="textSecondary" style={[Type.body, styles.centerText]}>
            We sent a magic link to {email}. Tap it and you&apos;re in — no codes to copy.
          </ThemedText>
          <ThemedText color="textMuted" style={Type.caption}>
            (Demo: signing you in automatically…)
          </ThemedText>
        </View>
      </StepScaffold>
    );
  }

  return (
    <StepScaffold
      avoidKeyboard
      footer={
        <View style={{ gap: Spacing.md }}>
          <ConsentCheckbox checked={consent} onChange={setConsent} />
          {view === 'choices' ? (
            <>
              <PrimaryButton
                label=" Continue with Apple"
                onPress={() => withProvider('apple')}
                loading={busy === 'apple'}
                disabled={!consent}
              />
              <PrimaryButton
                label="Continue with Google"
                variant="secondary"
                onPress={() => withProvider('google')}
                loading={busy === 'google'}
                disabled={!consent}
              />
              <PrimaryButton
                label="Use email instead"
                variant="ghost"
                onPress={() => setView('email')}
                disabled={!consent}
              />
            </>
          ) : (
            <>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor={UI.textMuted}
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
                disabled={!consent || !email.includes('@')}
              />
              <PrimaryButton label="Back" variant="ghost" onPress={() => setView('choices')} />
            </>
          )}
        </View>
      }>
      <View style={styles.copy}>
        <ThemedText style={Type.hero}>Save this and keep editing</ThemedText>
        <ThemedText color="textSecondary" style={Type.body}>
          Create a free account to keep your result and pick up where you left off.
        </ThemedText>
      </View>
    </StepScaffold>
  );
}

const styles = StyleSheet.create({
  copy: { gap: Spacing.sm, marginTop: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  centerText: { textAlign: 'center' },
  emoji: { fontSize: 44 },
  input: {
    height: 52,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: UI.border,
    backgroundColor: UI.surface,
    color: UI.text,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
});
