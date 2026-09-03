# AI Photo/Video App — Onboarding Prototype

A React Native (Expo) prototype of an AI photo app's onboarding, rebuilt around a
**value-before-ask** flow and styled after the Aragon.ai reference. Every backend
(AI generation, auth, subscriptions, analytics) is **mocked behind an interface** so the
whole thing runs in a simulator with no keys.

The full product spec this was built from is in [`PLAN.md`](./PLAN.md).

---

## Quick start

```bash
npm install
npx expo start        # then press "i" for iOS simulator, "a" for Android
```

- **Node:** use 20 or 22 LTS (`.nvmrc` pins 22). Node 24 hangs Jest's file crawler.
- **Simulator has no camera** — on the selfie screen use *Choose from library* / *Use a sample photo*.
- Expo **SDK 57** · React Native **0.86** · React **19.2** · Expo Router (file-based).

```bash
npm test              # jest, runs with --watchman=false
npx tsc --noEmit      # typecheck
```

---

## Onboarding flow

Config-driven by [`src/onboarding/stepOrder.ts`](./src/onboarding/stepOrder.ts); the
`OnboardingSequencer` renders one step at a time and owns `next / back / skip`.

| # | Step | Notes |
|---|------|-------|
| 1 | **Welcome** | Full-screen auto-sweeping before/after of a template result. Swaps to a second image pair after 5 s. One CTA: *"Try it on your photo."* No pitch, no signup, no permission prompt. |
| 2 | *Personalization* | "What do you want to create?" — **disabled** via `flags.quizEnabled = false`; screen kept for re-enable. |
| 3 | **PhotoCapture** | The selfie screen. A photo-access **bottom-sheet popup** opens over it first (primes the OS prompt). Camera / library / sample — never dead-ends. |
| 4 | **Generating** | Staged status ("Analyzing… Applying style… Finishing touches"), ~9 s mock, real error + retry state. |
| 5 | **ResultReveal** | The aha moment — before/after of the user's **own photo**, *before* any signup/paywall. "Save this look" → signup. |
| 6 | **Signup** | Full-bleed image background. Apple / Google / Facebook one-tap primary, email = magic link, single consent line. |
| 7 | **Paywall** (`PaywallSheet`) | Dark, scrollable: coverflow style-card carousel, feature chips, 4 radio plans (Yearly Pro / *25% DISCOUNT* preselected), #1-RANKED social proof, scrolling reviews, sticky **Continue**. Dismiss soft-closes to the dashboard. |

Invariant enforced + unit-tested: the **paywall never precedes the result or signup**
(`assertOrderInvariant`).

### After onboarding — `(app)` tabs

- **Dashboard** — brand logo, trophy / credits+Upgrade / avatar bar, swipeable promo
  carousel, category rows. **Every 3rd row** is auto-sweeping before/after tiles that
  only animate while on screen. The **StreakModal** ("1-day streak, +16 credits", twinkling
  sparkles) slides up ~1 s after mount. *Upgrade* opens the paywall.
- **AI Photos / AI Editor** — `TabScreen` (credits toast, filter chips, sections with a live
  countdown + "Create pack"). `TabPaywallGate` shows the paywall as a full-screen modal on
  every focus for non-subscribers; dismissing reveals the browse screen. Tapping a tile opens
  `CreateResultModal`: **ask for a selfie/upload → fake generate → blur that photo ~80% →
  $0.99 one-time unlock** to "download".

---

## Project structure

```
src/
  app/                      expo-router routes
    _layout.tsx             providers, splash gate, light nav theme
    index.tsx               redirect: subscribed → dashboard, else → onboarding
    onboarding.tsx          hosts <OnboardingSequencer/>
    (app)/                  tab navigator: dashboard, photos, editor, generations
  onboarding/
    stepOrder.ts            pure step list + audit invariant (unit-tested)
    steps.config.ts         step id → screen component
    OnboardingSequencer.tsx renders current step, next/back/skip, analytics on enter
    StepScaffold.tsx        shared chrome (back / progress / skip / footer CTA)
    manifest.ts             all bundled image references (swap require()s for real assets)
    screens/                Welcome, Personalization, PhotoCapture, Generating,
                            ResultReveal, Signup, Paywall
  components/               BeforeAfterSlider, SkeletonImage, PaywallSheet/Modal,
                            StreakModal, StyleCardCarousel, TabScreen, TabPaywallGate,
                            CreateResultModal, RankedBadge, PrimaryButton, …
  services/
    aiGeneration.ts         interface + staged mock (forceGenerationFailure flag)
    auth/                   AuthService interface + mockAuth (Supabase-shaped)
    billing/billing.ts      RevenueCat-shaped offline stub (4 plans, purchase/restore)
    analytics/analytics.ts  Events map + console logger (single swap point)
  store/
    onboardingStore.ts      goal, photo, chosen style, result (zustand + AsyncStorage, v2 migrate)
    sessionStore.ts         authed, displayName, entitlement, gamification-seen
  config/flags.ts           paywallPlacement / paywallStyle / quizEnabled / forceGenerationFailure
  theme/index.ts            single light UI palette + spacing / radii / type scale
assets/onboarding/          p01–p16 (placeholder portraits) + hero1–5 (Welcome slider)
```

### Design guarantees (from the audit in `PLAN.md`)

- `SkeletonImage` is the only image renderer in onboarding — shimmer while loading, defined
  fallback on error, **never a blank hero**.
- One consent control on Signup; email is a **magic link**, never a typed OTP.
- Greetings use a display name, asserted not to be an email.
- One theme end-to-end (light) — no mid-flow light/dark swaps.

---

## Swapping mocks for real services

Each service is an interface with a mock impl; screens only import the interface.

| Concern | Interface | Mock | Real target |
|---|---|---|---|
| AI generation | `AiGenerationService` | staged delay | your model endpoint |
| Auth | `AuthService` | instant `displayName` | Supabase Auth (Apple/Google + magic link) |
| Subscriptions | `BillingService` | grants entitlement | RevenueCat |
| Analytics | `track()` | `console.log` | PostHog / Segment |

Real images: replace the `require()`s in `src/onboarding/manifest.ts` — no screen changes.

---

## Known issues / TODO

- **Generating loader** — the custom rotating arc can appear stuck on device; needs the
  Reanimated spin replaced with `ActivityIndicator` or a re-worked `withRepeat` rotation.
- **StreakModal timing** — currently ~1 s after dashboard mount; verify it fires reliably.
- **Credits after Claim** — dashboard still shows `0` credits after the streak reward is
  claimed; should reflect `16`.
- Real Supabase / RevenueCat / PostHog wiring (needs a dev-client build for native auth + IAP).
- `expo-notifications` is installed but unused (the notification-priming screen was removed).
