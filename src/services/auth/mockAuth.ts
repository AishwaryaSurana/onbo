import type { AuthService, AuthUser } from '@/services/auth/AuthService';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** In-memory stand-in for Supabase Auth. Resolves instantly-ish with a display name. */
class MockAuth implements AuthService {
  async signInWithApple(): Promise<AuthUser> {
    await wait(600);
    return { id: `mock-apple-${Date.now()}`, displayName: 'Alex' };
  }

  async signInWithGoogle(): Promise<AuthUser> {
    await wait(600);
    return { id: `mock-google-${Date.now()}`, displayName: 'Alex' };
  }

  async signInWithEmailLink(email: string): Promise<AuthUser> {
    // Simulate: send link -> user taps it in their mail app -> deep link returns here.
    await wait(1400);
    const guess = email.split('@')[0]?.replace(/[^a-zA-Z]/g, '') || 'there';
    const displayName = guess.charAt(0).toUpperCase() + guess.slice(1, 12);
    return { id: `mock-email-${Date.now()}`, displayName };
  }
}

export const mockAuth: AuthService = new MockAuth();
