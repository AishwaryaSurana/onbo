# `src/ui` — component library (atomic design)

Presentational building blocks, layered by composition. A component may only import from
its **own layer or below**.

| Layer | What lives here | Rule |
|---|---|---|
| **atoms/** | Indivisible primitives — `ThemedText`, `PrimaryButton`, `Skeleton`, `ProgressBar`, `Sparkle` | No imports from other UI layers |
| **molecules/** | Small compositions of atoms — `SkeletonImage`, `SkipButton`, `ConsentCheckbox`, `RankedBadge`, `Countdown` | May import atoms |
| **organisms/** | Self-contained feature blocks — `BeforeAfterSlider`, `StyleCardCarousel`, `PaywallSheet`, `PaywallModal`, `TabPaywallGate`, `TabScreen`, `StreakModal`, `CreateResultModal` | May import atoms + molecules |
| **templates/** | Page scaffolds — `StepScaffold` (onboarding chrome: back / progress / skip / footer) | May import anything below |

Pages/screens live outside this folder: `src/onboarding/pages/*` and `src/app/**` (routes).

## Imports

- **From outside `src/ui`** — import from the layer barrel: `import { PrimaryButton } from '@/ui/atoms'`.
- **Inside `src/ui`** — import the file directly: `import { Skeleton } from '@/ui/atoms/Skeleton'`
  (barrels within the package can create init cycles).

## Conventions

- Named exports only. One component (plus its private helpers) per file.
- Styles via a local `StyleSheet.create` at the bottom of the file.
- Colours / spacing / radii / type come from `@/theme` — no hard-coded palette values
  except deliberately screen-local ones (e.g. the dark paywall).
- No business logic, navigation, or store access in atoms/molecules; organisms may take
  callbacks and read a store when they own a self-contained feature.
