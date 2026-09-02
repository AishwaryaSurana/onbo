import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Entitlement = 'none' | 'trial' | 'paid';

interface SessionState {
  _hasHydrated: boolean;
  authed: boolean;
  /** First name / display name — NEVER a raw email (PLAN.md 4.7). */
  displayName: string | null;
  entitlement: Entitlement;
  /** Gamification elements already surfaced this install, so we stagger the rest (PLAN.md 4.5). */
  gamificationSeen: string[];

  signIn: (displayName: string) => void;
  signOut: () => void;
  setEntitlement: (e: Entitlement) => void;
  markGamificationSeen: (id: string) => void;
}

/** Guards against an email ever landing in a greeting. */
export function safeDisplayName(name: string | null): string {
  if (!name || name.includes('@') || name.trim() === '') return 'there';
  return name.trim().split(' ')[0];
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      authed: false,
      displayName: null,
      entitlement: 'none',
      gamificationSeen: [],

      signIn: (displayName) =>
        set({ authed: true, displayName: displayName.includes('@') ? null : displayName }),
      signOut: () => set({ authed: false, displayName: null, entitlement: 'none' }),
      setEntitlement: (entitlement) => set({ entitlement }),
      markGamificationSeen: (id) =>
        set({ gamificationSeen: Array.from(new Set([...get().gamificationSeen, id])) }),
    }),
    {
      name: 'session-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ _hasHydrated, ...rest }) => rest,
    },
  ),
);

useSessionStore.persist.onFinishHydration(() => {
  useSessionStore.setState({ _hasHydrated: true });
});
