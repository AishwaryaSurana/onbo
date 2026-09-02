/**
 * AI generation service (PLAN.md §1, §3.6).
 *
 * Screens depend only on `aiGeneration` (the interface). This file ships a MOCK
 * implementation: a staged delay with status callbacks and an optional forced failure.
 * Swap `aiGeneration` for a real endpoint client later — no screen changes.
 */
import { flags } from '@/config/flags';
import { STYLE_SETS } from '@/onboarding/manifest';
import type { Goal } from '@/store/onboardingStore';

export type GenStage = 'analyzing' | 'styling' | 'finishing';

export const STAGE_COPY: Record<GenStage, string> = {
  analyzing: 'Analyzing your photo…',
  styling: 'Applying the style…',
  finishing: 'Finishing touches…',
};

export interface GenerateInput {
  photoUri: string;
  goal: Goal;
  /** Preferred style; falls back to the first style for the goal. */
  styleId?: string | null;
}

export interface GenerateOutput {
  /** Style the result was rendered in — the image is derived from the manifest. */
  styleId: string;
}

export interface AiGenerationService {
  generate(
    input: GenerateInput,
    onStage?: (stage: GenStage) => void,
  ): Promise<GenerateOutput>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

class MockAiGeneration implements AiGenerationService {
  async generate(input: GenerateInput, onStage?: (s: GenStage) => void): Promise<GenerateOutput> {
    const styles = STYLE_SETS[input.goal] ?? STYLE_SETS.exploring;
    const styleId =
      styles.find((s) => s.id === input.styleId)?.id ?? styles[0].id;

    onStage?.('analyzing');
    await wait(2800);

    if (flags.forceGenerationFailure) {
      throw new Error('generation_failed: model timeout (mock)');
    }

    onStage?.('styling');
    await wait(3600);

    onStage?.('finishing');
    await wait(2600);

    return { styleId };
  }
}

export const aiGeneration: AiGenerationService = new MockAiGeneration();
