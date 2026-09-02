# AI Photo/Video App — Onboarding Build Plan
### For: Claude Code | Prepared from: conversion-onboarding framework + Aragon.ai onboarding video audit

---

## 0. What this document is

This is a build spec for a React Native (Expo) AI photo/video app, with the onboarding
flow as the primary focus since it drives trial-to-paid conversion. It combines two inputs:

1. **The conversion framework** — value-before-ask sequencing, goal-based personalization,
   primed permissions, a fast "aha moment," deferred signup, and a contextual paywall.
2. **A competitor audit** (Aragon.ai onboarding recording, round 2) — concrete bugs and
   sequencing mistakes observed in a real shipped flow, captured below as an explicit
   anti-pattern checklist. Section 4 is non-negotiable QA criteria, not a suggestion.

Hand this whole file to Claude Code as project context (e.g. drop it in the repo root
as `PLAN.md` or paste it into the first prompt) and work through Section 7 phase by phase.

---

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| App framework | React Native + **Expo** (managed workflow) | Fast iteration, EAS Build/Submit for release automation |
| Navigation | Expo Router (file-based) | Pairs well with a config-driven step sequencer (Section 5) |
| State | Zustand | Lightweight, no boilerplate for onboarding/session state |
| Auth | Firebase Auth or Supabase Auth — **social-first** (Apple/Google), email **magic link** as fallback (not raw OTP) | Removes the app-switch/manual-code friction found in the audit |
| Subscriptions | RevenueCat | Cross-platform IAP abstraction, trial + entitlement handling |
| AI generation | Abstracted service (`/services/aiGeneration.ts`) with a mock implementation for dev | Lets Claude Code build/test the full flow before a real model endpoint exists |
| Media | `expo-image-picker`, `expo-camera`, `expo-file-system` | Standard Expo media pipeline |
| Analytics | PostHog or Segment | Event-based, needed for funnel metrics (Section 6) |
| Feature flags | Local `flags.ts` stub now, swappable for Statsig/LaunchDarkly later | Enables A/B testing paywall placement without a full rebuild |

---

## 2. Screen flow — build in this exact order

This order deliberately **fixes the sequencing problems found in the competitor audit**:
the AI result now comes before signup, and signup comes before the paywall.

1. **Splash / Welcome** — best-case before/after example, social proof (rating + user count), single CTA
2. **Goal-based personalization** — one tap: "What do you want to create?" (Headshots / Dating photos / Creative styles / Just exploring)
3. **Interactive style teaser carousel** — 3–4 swipeable cards, each with a *working* live preview (see 4.1 — this is the exact screen that was broken in the audited competitor)
4. **Permission priming screen** — explain *why* before the OS dialog fires
5. **OS permission prompt** — native photo library / camera dialog
6. **Photo capture or upload** — user's own photo, or a great stock photo if they decline access
7. **AI generation / processing** — real progress state (see 4.6)
8. **Result reveal** — the aha moment; full-bleed before/after, save/share affordances
9. **Lightweight signup** — triggered only here, after value; social sign-in primary, single consolidated consent (see 4.3)
10. **Contextual paywall** — framed around the result just generated; trial pre-selected, annual default, price visible
11. **Home dashboard** — soft close if declined; gamification elements introduced one at a time, not stacked (see 4.5)

---

## 3. Screen specs

### 3.1 Splash / Welcome
- Auto-playing before/after transformation (real asset, not a placeholder)
- Rating badge + "trusted by N users" stat
- One CTA: "Continue" — no secondary buttons competing for attention

### 3.2 Personalization
- Single-select, 4 options max, tappable cards not a dropdown
- Store selection in Zustand (`onboardingStore.goal`) — used to filter which style-teaser cards and dashboard categories are shown later
- "Skip" always visible, top-right, small type — never forces the tap

### 3.3 Style teaser carousel
- Each card: label + swatch/thumbnail selector + a hero preview image that updates on selection
- **Must** ship a skeleton loader while the preview image loads, and a defined fallback state if it fails to load — never an empty white gap (this exact bug shipped in the audited competitor across 5 consecutive screens)
- "Skip" available throughout

### 3.4 Permission priming
- Plain-language explanation before firing the native dialog: what's being accessed and why, one line reassuring nothing uploads without consent
- CTA leads directly into the native OS prompt

### 3.5 Photo capture/upload
- Camera or library, user's choice
- If permission was declined at 3.4/3.5, fall through to a curated stock photo so the demo still works — don't dead-end the flow

### 3.6 AI generation
- Real determinate progress (%, or at minimum a multi-stage label: "Analyzing photo… Applying style… Finishing touches") — not an indefinite spinner on a blank screen
- Target: under 15s perceived wait; if the real model takes longer, show incremental status text to keep the screen from reading as broken

### 3.7 Result reveal
- Full-bleed result, before/after slider or toggle
- Primary CTA: "Save this look" → routes into signup (3.8)
- Secondary: "Try another style" → loops back to 3.3 without losing the uploaded photo

### 3.8 Signup
- Apple / Google one-tap as the default, single visually primary path
- Email fallback uses a **magic link**, not a manually-typed OTP — if OTP is unavoidable, it must autofill via `textContentType="oneTimeCode"` (iOS) / SMS Retriever (Android); never require the user to leave the app to read a code
- **One** consent checkbox: "I'm 18+ and agree to the [Terms] and [Privacy Policy]" with the detail linked, not three separate checkboxes with policy-section citations inline

### 3.9 Paywall
- Appears immediately after signup, framed with the actual result just generated ("Unlock this style + 200 more")
- Trial toggle pre-selected, annual default with visible discount, real price shown up front
- Decline → soft-close into the dashboard at reduced feature set (watermark / limited styles), never a hard lock screen

### 3.10 Dashboard / home
- Greeting uses the user's **display name**, never a raw email string
- Category rows (Headshots, Dating Photos, Background Enhancer, etc.) filtered by the goal selected in 3.2
- Gamification elements (daily credits, streaks, sale banners, countdown timers) — introduce **one** on first load, stagger the rest across the first session (see 4.5)

---

## 4. Anti-pattern checklist — QA against this before calling any screen done

Each item below is a specific failure observed in the competitor audit. Treat this as literal acceptance criteria, not general advice.

- [ ] **4.1** No screen ever renders a blank/empty hero preview area — always a skeleton loader or a defined error/fallback state
- [ ] **4.2** No discount offer or paywall touchpoint appears before the user has seen at least one AI result generated from their own photo
- [ ] **4.3** Legal consent is a single checkbox with linked full text — not 3+ separate checkboxes, and no inline citations to specific policy sections in the tappable label
- [ ] **4.4** If email OTP exists anywhere as a fallback, the code autofills from the keyboard/notification — the user is never required to background the app to read their email manually
- [ ] **4.5** No more than one promotional/gamification element (streak toast, sale banner, countdown timer) fires on the very first dashboard load — sequence them across the session instead
- [ ] **4.6** Every screen and tab transition shows real content or a skeleton within ~300ms — no prolonged blank white screen with only a spinner
- [ ] **4.7** Post-signup greetings and any personalization copy use a display name or first name — never a fallback to the raw email address
- [ ] **4.8** Auth screens are internally consistent — don't show a password-first screen and an OTP-first screen for the same "sign in" action; pick one default path and offer the other as a clearly labeled secondary option

---

## 5. State & config architecture

- **Config-driven onboarding sequencer**: define onboarding as an ordered array —
  `{ id, component, analyticsKey, skippable }` — rendered by a single `<OnboardingSequencer />`.
  This lets a step be reordered, removed, or A/B tested (e.g. paywall placement, quiz on/off)
  without touching navigation code elsewhere.
- **Zustand stores**:
  - `onboardingStore` — current step index, selected goal, uploaded photo URI, generated result URI
  - `sessionStore` — auth state, entitlement status (from RevenueCat), display name
- **Feature flags** (`flags.ts` stub, swappable later): `paywallPlacement` (`post_result` | `post_signup` | `day_2`), `paywallStyle` (`hard` | `soft`), `quizEnabled` (bool)

---

## 6. Analytics events to instrument

| Event | Fired when | Feeds |
|---|---|---|
| `onboarding_started` | App first opened | Funnel top |
| `goal_selected` | Personalization tap | Persona-based retention cuts |
| `style_teaser_viewed` / `style_teaser_skipped` | Each teaser card | Screen-level drop-off |
| `permission_primer_shown` / `permission_granted` / `permission_denied` | 3.4 → OS result | Primed vs. cold accept rate |
| `photo_captured` | 3.5 complete | Activation input |
| `generation_started` / `generation_completed` / `generation_failed` | 3.6 | Time-to-first-result, reliability |
| `result_viewed` | 3.7 | **Activation** (north-star: % reaching this) |
| `signup_started` / `signup_completed` (with method) | 3.8 | Signup conversion, method mix |
| `paywall_viewed` | 3.9 shown | Paywall reach |
| `trial_started` | Trial CTA tapped | Paywall → trial conversion |
| `trial_converted_to_paid` | Billing event | Trial → paid conversion |
| `dashboard_reached` | 3.10 | Full-funnel completion |

Target metrics to track from these: time-to-first-result (<60s), activation rate,
permission accept rate (primed vs. cold), paywall→trial rate, trial→paid rate, D1/D7 retention cut by selected goal.

---

## 7. Build phases for Claude Code

Work through these in order; each phase should be independently runnable/testable.

- **Phase 0 — Scaffold**: Expo app, file-based routing, design tokens (colors/type/spacing), Zustand wired up empty
- **Phase 1 — Onboarding shell**: `<OnboardingSequencer />` + config array + Welcome, Personalization, Style Teaser screens with mock/local image assets and real skeleton-loading states (test against 4.1 immediately)
- **Phase 2 — Permissions & capture**: primer screen, native permission calls, camera/library capture, stock-photo fallback path
- **Phase 3 — Generation service**: `aiGeneration.ts` interface + mock implementation (simulated delay + staged status text) + Result reveal screen
- **Phase 4 — Auth**: social sign-in, magic-link email fallback, single consolidated consent screen
- **Phase 5 — Paywall**: RevenueCat sandbox integration, trial toggle UI, soft-close fallback path for decliners
- **Phase 6 — Dashboard**: category rows filtered by stored goal, staggered gamification elements, display-name greeting
- **Phase 7 — Analytics**: instrument every event in Section 6
- **Phase 8 — QA pass**: walk every item in Section 4 against the running app before calling onboarding complete

---

## 8. Definition of done (onboarding flow)

- Full flow (Welcome → Dashboard) completes end-to-end with no blank/broken screens
- A generated result is shown before any signup or paywall prompt
- All 8 items in Section 4 pass
- All events in Section 6 fire correctly and appear in the analytics dashboard
- Time from app open to first generated result is under 60 seconds in a normal run

# Onboarding prototype — build notes

- Full flow: Welcome → Personalization → Style teaser → Permission primer → **Selfie capture** → Generating → **Result reveal (AHA, pre-login)** → Signup → Paywall → Dashboard
- All backend services mocked behind interfaces: `src/services/{aiGeneration,auth,billing,analytics}`
- Config-driven sequence: `src/onboarding/stepOrder.ts` (+ jest invariant test)
- Feature flags: `src/config/flags.ts` (paywall placement/style, quiz on/off, forceGenerationFailure)
- Run: `npx expo start --port 8083` then `i`. Tests: `npm test`.
- Node 24 hangs jest's file crawler; `npm test` passes `--watchman=false`. Prefer Node 22 (`.nvmrc`).
- Simulator has no camera — use "library" / "sample" on the selfie screen.
