/**
 * Auth interface (PLAN.md §1, §3.8). Target provider: Supabase Auth
 * (Apple/Google one-tap + email magic link). This pass uses `mockAuth`.
 *
 * IMPORTANT (PLAN.md 4.4): the email path is a MAGIC LINK, never a manually typed OTP —
 * the user never has to leave the app to read a code.
 */

export type AuthMethod = 'apple' | 'google' | 'facebook' | 'email';

export interface AuthUser {
  id: string;
  /** First name / display name — NEVER an email (PLAN.md 4.7). */
  displayName: string;
}

export interface AuthService {
  signInWithApple(): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  signInWithFacebook(): Promise<AuthUser>;
  /** Sends a magic link; resolves when the link is "followed" (mock auto-follows). */
  signInWithEmailLink(email: string): Promise<AuthUser>;
}
