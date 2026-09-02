import { createContext, useContext } from 'react';

export interface SequencerApi {
  /** Advance to the next step; on the last step, routes to the dashboard. */
  next: () => void;
  /** Go back one step (no-op on the first step). */
  back: () => void;
  /** Skip the current step (only meaningful when `skippable`). */
  skip: () => void;
  /** Jump to a named step (e.g. ResultReveal -> "Try another style" -> styleTeaser). */
  jumpTo: (stepId: string) => void;
  /** Jump straight to the dashboard (paywall decline / soft-close). */
  goToDashboard: () => void;

  stepId: string;
  index: number;
  total: number;
  canGoBack: boolean;
  skippable: boolean;
  /** 0..1 overall progress for the ProgressBar. */
  progress: number;
}

export const SequencerContext = createContext<SequencerApi | null>(null);

export function useSequencer(): SequencerApi {
  const ctx = useContext(SequencerContext);
  if (!ctx) throw new Error('useSequencer must be used inside <OnboardingSequencer>');
  return ctx;
}
