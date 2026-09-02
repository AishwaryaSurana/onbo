import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Goal = 'reels' | 'portraits' | 'thumbnails' | 'exploring';

interface OnboardingState {
  _hasHydrated: boolean;
  stepIndex: number;
  goal: Goal | null;
  chosenStyleId: string | null;
  /** User's source photo, OR the bundled stock portrait if photo access was declined. */
  photoUri: string | null;
  photoIsFallback: boolean;
  /** How the source photo was obtained — for analytics + the fallback banner. */
  photoSource: 'camera' | 'library' | 'sample' | null;
  /** The style the aha-moment result was generated in (image derived from the manifest). */
  resultStyleId: string | null;

  setStepIndex: (i: number) => void;
  setGoal: (g: Goal) => void;
  setChosenStyle: (id: string) => void;
  setPhoto: (uri: string, source: 'camera' | 'library' | 'sample') => void;
  setResultStyle: (styleId: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      stepIndex: 0,
      goal: null,
      chosenStyleId: null,
      photoUri: null,
      photoIsFallback: false,
      photoSource: null,
      resultStyleId: null,

      setStepIndex: (i) => set({ stepIndex: i }),
      setGoal: (goal) => set({ goal }),
      setChosenStyle: (chosenStyleId) => set({ chosenStyleId }),
      setPhoto: (photoUri, source) =>
        set({ photoUri, photoSource: source, photoIsFallback: source === 'sample' }),
      setResultStyle: (resultStyleId) => set({ resultStyleId }),
      reset: () =>
        set({
          stepIndex: 0,
          goal: null,
          chosenStyleId: null,
          photoUri: null,
          photoIsFallback: false,
          photoSource: null,
          resultStyleId: null,
        }),
    }),
    {
      name: 'onboarding-store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // Persist the collected data, NOT the cursor: a cold start always resumes at step 0
      // (avoids reopening on "Generating"/paywall, and keeps demo runs predictable).
      partialize: ({ _hasHydrated, stepIndex, ...rest }) => rest,
      migrate: (persisted) => {
        const valid = ['reels', 'portraits', 'thumbnails', 'exploring'];
        const p = (persisted ?? {}) as Record<string, unknown>;
        if (typeof p.goal !== 'string' || !valid.includes(p.goal)) p.goal = null;
        return p as never;
      },
    },
  ),
);

useOnboardingStore.persist.onFinishHydration(() => {
  useOnboardingStore.setState({ _hasHydrated: true });
});
