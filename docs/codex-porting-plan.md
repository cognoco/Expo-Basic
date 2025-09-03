# Study Buddy Porting Plan (to Expo Router default app)

This is a staged plan with checklists and acceptance criteria to port the legacy Study Buddy app (in `study-buddy/`) into the root Expo Router app created from the default template. It assumes SDK 53 (per root) and prioritizes a safe, incremental migration while the original app is partially non‑working.

Note: Many native features (RevenueCat, Notifications, Camera, Sentry, PostHog) work best with a Dev Client or EAS builds. This plan accounts for that.


## Stage 0 — Repo Triage & Baseline

Checklist
- [ ] Confirm root SDK, React, RN versions: root and `study-buddy/` both use Expo SDK 53; reconcile minor RN version differences.
- [ ] Decide on dev client usage for local testing of Purchases/Notifications.
- [ ] Collect credentials/secrets for Sentry DSN, PostHog, RevenueCat keys, and EAS Project ID (if available).
- [ ] Create a high‑level route mapping from legacy stack to Expo Router paths.
- [ ] Record current test baseline: run unit tests from `study-buddy/src` (if feasible) to note current failures.

Acceptance Criteria
- Versions and build strategy decided; credentials collected (or noted as pending).
- Route mapping reviewed and agreed.
- Known failing areas tracked as risks.


## Stage 1 — Dependencies & Config

Checklist
- [ ] Add missing runtime dependencies to root `package.json` (versions aligned with SDK 53):
  - `@react-native-async-storage/async-storage`, `lottie-react-native`, `react-native-svg`
  - `expo-av`, `expo-camera`, `expo-crypto`, `expo-file-system`, `expo-haptics`, `expo-keep-awake`, `expo-local-authentication`, `expo-localization`, `expo-notifications`, `expo-speech`
  - `sentry-expo`, `react-native-purchases`, `posthog-react-native`, `zod`
- [ ] Ensure `react-native-reanimated` Babel plugin remains last.
- [ ] Merge `study-buddy/app.json` extras into root `app.json` under `expo.extra`:
  - `revenuecat{ iosApiKey, androidApiKey, entitlementId }`
  - `manageSubscriptions{ ios, android }`
  - `sentry{ dsn }`, `posthog{ apiKey, host }`
  - `remote{ paywall{ sessionsTillPaywall, variants }, surprise{ frequencyMultiplier } }`
  - `urls{ privacyPolicy, termsOfService, support }`
- [ ] Copy iOS `infoPlist` additions and Android `permissions` (Camera, Notifications, Microphone, etc.).
- [ ] Add config plugins as needed (e.g., `"plugins": ["sentry-expo"]`; add RevenueCat plugin if required by version).

Acceptance Criteria
- `npm/yarn/pnpm install` completes and a basic `expo prebuild` or Dev Client build plan is documented.
- Root app can start in development (even if features are disabled by config).


## Stage 2 — Codebase Layout & Aliases

Checklist
- [ ] Create `src/study-buddy/` and move code from `study-buddy/src` preserving structure: `screens`, `components`, `utils`, `ui`, `assets`, `context`, `types`.
- [ ] Update imports to root alias style: prefer `@/study-buddy/...`.
- [ ] Optionally provide a temporary alias shim in TS config to reduce churn during migration.
- [ ] Move animations/media to `assets/study-buddy/...` if appropriate; update imports and any registry code.

Acceptance Criteria
- TypeScript compiles with new import paths.
- No orphan modules; all moved files are referenced from the new location.


## Stage 3 — Routing Migration

Checklist
- [ ] Define pages under `app/(study)/` matching legacy stack routes:
  - `/onboarding` → OnboardingScreen
  - `/mode` → ModeSelectionScreen
  - `/main` → MainScreen
  - `/calm` → CalmModeScreen
  - `/parent-settings` → ParentSettingsScreen
  - `/celebration` → CelebrationScreen
  - `/consent` → ConsentScreen
  - `/paywall` → PaywallScreen (modal presentation)
- [ ] Add redirect logic at `/` based on first launch to `/onboarding` or `/mode`.
- [ ] Replace React Navigation types with Expo Router hooks (`useRouter`, `useLocalSearchParams`).
- [ ] Decide param passing strategy: for complex objects prefer transient storage/context over query params.

Acceptance Criteria
- Navigating between pages via Expo Router works, including initial redirect.
- Modal route for Paywall presents as a modal.


## Stage 4 — Providers & Bootstrap

Checklist
- [ ] Create `app/(study)/_layout.tsx` and wrap children in:
  - `GestureHandlerRootView`, `SafeAreaProvider`, theme provider
  - `SubscriptionContext` provider
  - `ErrorBoundary`
- [ ] Port initialization from legacy `study-buddy/App.tsx` into layout effects:
  - KeepAwake activation
  - i18n initialization
  - Photo cleanup routine
  - Storage migrations
  - Notifications setup: channels/categories and response listener (persist `lastNotifAction`)
  - Analytics init (PostHog)
  - RevenueCat configure + initial premium status fetch
- [ ] Preserve production gating screen when required config is missing.

Acceptance Criteria
- App tree mounts and initialization side‑effects run once per app start.
- If critical config is missing in production builds, a “Configuration Required” screen renders.


## Stage 5 — Screen Ports & UI

Checklist
- [ ] Port Onboarding flow; store first‑launch marker in `AsyncStorage`.
- [ ] Port ModeSelection → triggers `/main` with selected subject and optional quick‑start params.
- [ ] Port MainScreen with timers, check‑ins, surprises, adaptive cadence, and study session lifecycle.
- [ ] Port CalmModeScreen.
- [ ] Port ParentSettingsScreen including parent gate (biometrics/PIN/math) and session logs.
- [ ] Port CelebrationScreen; show token awards and totals.
- [ ] Port ConsentScreen.

Acceptance Criteria
- A vertical slice works: Onboarding → Mode → Main → Celebration, without crashes.
- Parent gate can open settings using biometric or fallback.


## Stage 6 — Native Capabilities

Checklist
- [ ] Notifications: ensure permission prompts, channels/categories, background scheduled check‑ins, and action handling (`RESUME`, `BREAK`, `DONE`).
- [ ] Voice/Speech: verify `resolveVoiceForBuddy`, `smartSpeak`, and fallbacks when voices are unavailable.
- [ ] Audio/AV: confirm usage does not conflict (e.g., Speech + Haptics timing) and add defensive catches.
- [ ] Camera flow: permission prompts, capture and save “proof” photo, storage cleanups.
- [ ] FileSystem: confirm any persistence paths and cleanup routines are idempotent.
- [ ] Haptics: ensure calls use supported enums and are conditional where necessary.

Acceptance Criteria
- Permissions are handled gracefully; features no‑op without crashing when denied.
- Background check‑ins schedule and cancel as expected during app state changes.


## Stage 7 — Purchases Integration (RevenueCat)

Checklist
- [ ] Add/configure RevenueCat (API keys from `extra.revenuecat`, entitlement id).
- [ ] Initialize on app start and wire `SubscriptionContext`.
- [ ] Gate premium features via context.
- [ ] Provide development fallback/mocks when keys are absent to keep app navigable.
- [ ] Verify plugin requirements and Dev Client build steps.

Acceptance Criteria
- With valid keys in Dev Client or EAS build, premium state reflects active entitlements.
- Without keys, app still runs with premium = false and no crashes.


## Stage 8 — Analytics & Crash Reporting

Checklist
- [ ] Initialize Sentry early and wrap with `ErrorBoundary` (as in legacy).
- [ ] Initialize PostHog lazily (no‑op when missing keys) and tag basic platform properties.
- [ ] Ensure key events are tracked: session start/end, permission outcomes, paywall views, etc.

Acceptance Criteria
- Errors captured in Sentry (when DSN present).
- Key events appear in PostHog in test projects (when configured).


## Stage 9 — Assets & i18n

Checklist
- [ ] Move animations/images to root `assets/study-buddy/` (or keep under `src/study-buddy/assets` if imported via bundler) and fix paths.
- [ ] Verify Lottie animations load.
- [ ] Ensure `initializeLanguage` is called and strings resolve; provide defaults where missing.

Acceptance Criteria
- Screens render expected images/animations without redboxes.
- Strings/localization calls succeed with sensible defaults.


## Stage 10 — Testing & QA

Checklist
- [ ] Configure `jest-expo` in root; reuse existing tests from `study-buddy/src` with updated import paths.
- [ ] Add minimal mocks for native modules (`expo-notifications`, `expo-speech`, `react-native-purchases`) to keep unit tests hermetic.
- [ ] Create a manual QA checklist: first launch, session flow, background return, paywall, parent gate, camera.

Acceptance Criteria
- Unit tests run under SDK 53 and pass or have justified skips for known gaps.
- Manual QA list executed on at least one iOS simulator and one Android emulator/device.


## Stage 11 — CI/CD & EAS

Checklist
- [ ] Add/confirm EAS projectId under `expo.extra.eas.projectId` (if available).
- [ ] Define `eas.json` build profiles for `development-client`, `preview`, and `production`.
- [ ] Document local steps: `eas build --profile development-client` and `eas update`/`eas submit` as applicable.

Acceptance Criteria
- Dev Client builds successfully on at least one platform.
- A preview or production build plan is documented and repeatable.


## Stage 12 — Cleanup & Decommission

Checklist
- [ ] Remove `study-buddy/` app shell after migration and verification.
- [ ] Remove legacy `module-resolver` aliasing; standardize on `@/` only.
- [ ] Update README with new structure and run instructions.
- [ ] Ensure lint passes and dead code paths are removed or flagged.

Acceptance Criteria
- Single app remains (Expo Router root) with cohesive structure.
- CI passes with clean lint/test status.


## Stage 13 — Release Readiness

Checklist
- [ ] Fill production `extra` values (no placeholders) for Sentry/PostHog/RevenueCat.
- [ ] Confirm platform permissions text and store metadata compliance.
- [ ] Verify privacy policy/terms/support URLs are correct.
- [ ] Final smoke tests on real devices (Notifications, Camera, Purchases).

Acceptance Criteria
- Production build passes store reviews’ basic automated checks.
- No runtime “Configuration Required” gating in production.


## Risks & Mitigations

- RevenueCat integration requires Dev Client / EAS: build early; mock in dev when keys absent.
- Expo Notifications differ on emulators (Android 13+ runtime permission): test on real devices.
- Large navigation params unsuitable for URLs: use storage/context; validate serialization.
- Lottie and Reanimated versions: keep plugin last; confirm animation renders; verify babel config.
- Alias churn: provide temporary TS path shims; refactor incrementally.


## Rollback Plan

- Keep `study-buddy/` app intact until Stage 10 success; branch changes.
- If a stage fails critically, revert to last green commit; resume with smaller increments.


## Deliverables & Definition of Done

- A single Expo Router app hosting all Study Buddy features.
- Working vertical slice: Onboarding → Mode → Main → Celebration with notifications and speech.
- Purchases integrated with graceful fallback.
- Sentry/PostHog wired with environment‑based controls.
- Tests and basic CI configured; README updated.


## Suggested Implementation Order (Milestones)

1) Dependencies & Config (Stages 1–2)
2) Routing + Providers + Basic Screens (Stages 3–5, vertical slice working)
3) Native Capabilities (Stage 6)
4) Purchases (Stage 7)
5) Analytics & Crash (Stage 8)
6) Assets & i18n polish (Stage 9)
7) Testing/QA and Dev Client builds (Stages 10–11)
8) Cleanup and Release Readiness (Stages 12–13)

