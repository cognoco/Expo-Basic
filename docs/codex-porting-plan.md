# Study Buddy → Root App Porting Plan

Scope: Only port and fix existing functionality from `study-buddy/` into the root blank Expo app. Do not add new features, restructure to Expo Router, or introduce new tooling beyond what the existing app already uses.

Out of scope:
- Expo Router migration or file-based routing.
- New lint/format configs beyond what the app already has.
- Design/UX updates, new screens, or new runtime capabilities.
- CI/CD changes.

Assumptions:
- Root project is the Expo “blank + TypeScript” template on SDK 53.
- We preserve React Navigation stack, module aliases, and existing screens/components as-is.

---

## Stage 0 — Pre‑flight and Backups

- [ ] Confirm Node/npm versions are consistent with current development environment.
- [ ] Ensure `study-buddy/` runs locally today (baseline behavior to compare after port).
- [ ] Create a branch for the port (e.g., `feat/port-study-buddy`).
- [ ] Optional: Tag or archive a backup of the current root app state.

---

## Stage 1 — Align Dependencies and Scripts (port only)

Goal: Add exactly the dependencies required by `study-buddy` to the root project. Do not add extras.

- [ ] Copy dependency versions from `study-buddy/package.json` to root `package.json` (keep existing compatible entries):
  - runtime deps: `@react-navigation/native`, `@react-navigation/stack`, `@react-native-async-storage/async-storage`, `@react-native-community/slider`, `expo`, `expo-av`, `expo-camera`, `expo-crypto`, `expo-file-system`, `expo-haptics`, `expo-keep-awake`, `expo-local-authentication`, `expo-localization`, `expo-notifications`, `expo-speech`, `lottie-react-native`, `react`, `react-native`, `react-native-gesture-handler`, `react-native-purchases`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`, `sentry-expo`, `zod`.
  - dev deps: `@babel/core` (if needed), `@types/jest`, `@types/react`, `jest`, `jest-expo`, `typescript`.
- [ ] Merge/replace scripts from `study-buddy/package.json` into root `package.json` (only ones used by the app):
  - `start`, `android`, `ios`, `web` (already present in blank template).
  - `check:config` (if `scripts/check-config.js` is used).
  - `postinstall`: `npx expo install --fix || true` (helps sync native module versions).
  - `test`: `jest` (and any e2e scripts you actually use).
- [ ] Run `npm install`.

Notes:
- Keep Expo SDK, React, and React Native versions aligned with what `study-buddy` already uses (SDK 53, RN 0.79.x, React 19) to avoid upgrade work.
- Do not introduce additional libraries or major version bumps at this time.

---

## Stage 2 — Port Expo app.json (config only)

Goal: Bring over only the configuration needed for the app to function.

- [ ] Merge `study-buddy/app.json` into root `app.json`:
  - `expo.name`, `expo.slug` (confirm desired identifiers for the root app).
  - `ios.bundleIdentifier`, `ios.buildNumber`, `ios.infoPlist` usage descriptions.
  - `android.package`, `android.versionCode`, `android.permissions` (keep EXACT permissions used by the app: `RECORD_AUDIO`, `VIBRATE`, `CAMERA`, `POST_NOTIFICATIONS`).
  - `plugins`: include `["sentry-expo"]`.
  - `runtimeVersion` and `userInterfaceStyle` as used by the app.
  - `extra`: copy `revenuecat`, `manageSubscriptions`, `sentry`, `posthog`, `remote`, and `urls` as-is.
- [ ] Do not add icons/splash unless the study-buddy app references them at runtime. Keep placeholders commented if not used.

---

## Stage 3 — TypeScript Paths and Babel Aliases

Goal: Preserve study-buddy import aliases so code compiles unchanged.

- [ ] Update root `tsconfig.json`:
  - Ensure `baseUrl: "."`.
  - Add `paths` for: `@screens/*`, `@components/*`, `@utils/*`, `@assets/*`, `@config`, `@config/*`, `@content/*`, `@types/*`, `@context`, `@context/*`, `@ui`, `@ui/*`.
- [ ] Add/replace root `babel.config.js` with study-buddy’s config:
  - `presets: ['babel-preset-expo']`.
  - `plugins`: `module-resolver` with the same aliases; ensure `'react-native-reanimated/plugin'` is LAST.

---

## Stage 4 — Copy App Code and Scripts (1:1)

Goal: Move code without modification, only adjusting import paths if required by root layout.

- [ ] Create `src/` in root and copy study-buddy directories:
  - `src/screens`, `src/components`, `src/context`, `src/utils`, `src/ui`, `src/types`, `src/assets` (and any nested util folders like `utils/intl`, `utils/config`, `utils/content`).
- [ ] Copy `scripts/` directory used by npm scripts (e.g., `scripts/check-config.js`).
- [ ] Search/replace only if necessary for path differences (aliases should avoid this).

---

## Stage 5 — Replace Root App Entrypoint (keep RN Navigation)

Goal: Use study-buddy’s `App.tsx` as the root app while keeping the existing `index.ts` from the blank template.

- [ ] Overwrite root `App.tsx` with `study-buddy/App.tsx`.
- [ ] Ensure the top of `App.tsx` imports `'react-native-gesture-handler'` before anything else.
- [ ] Keep root `index.ts` (registerRootComponent) as-is.
- [ ] Verify `NavigationContainer` and `createStackNavigator` usage remains unchanged.
- [ ] Ensure providers wrap the navigator exactly as in study-buddy: `GestureHandlerRootView`, `SafeAreaProvider`, `SubscriptionContext.Provider`, and `ErrorBoundary`.

---

## Stage 6 — Initialize Native Modules & Services

Goal: Keep the exact runtime behavior and side effects present in study-buddy.

- [ ] Sentry: Initialize with DSN from `app.json.extra.sentry.dsn` (via `Sentry.init(...)`).
- [ ] RevenueCat: Configure `Purchases.configure({ apiKey })` using platform-specific keys from `extra.revenuecat` and keep `checkPremiumStatus` logic.
- [ ] Analytics: Call existing `initAnalytics` and `track` functions from `@utils/analytics` (no changes to provider).
- [ ] KeepAwake: Call `KeepAwake.activateKeepAwakeAsync()`.
- [ ] Localization & Language: call `initializeLanguage()`.
- [ ] Notifications: retain permission flow (`ensureNotificationPermission` or `ensureNotificationsSetup`), categories/channels, and response listener storing last action.
- [ ] Storage migrations: keep `runMigrations()` from `App.tsx` intact.

Notes:
- Do not introduce new analytics/errors providers beyond what the code already uses.

---

## Stage 7 — Assets and Permissions

Goal: Ensure all referenced assets exist and permissions match app behavior.

- [ ] Copy any images, fonts, or Lottie files referenced by the app into `src/assets` (keep same paths).
- [ ] Confirm iOS usage descriptions cover microphone, camera, and photo library if used.
- [ ] Confirm Android `permissions` include only what the app needs (`RECORD_AUDIO`, `CAMERA`, `POST_NOTIFICATIONS`, `VIBRATE`).

---

## Stage 8 — Tests (unit only)

Goal: Run existing unit tests without adding new test frameworks.

- [ ] Add Jest config to root `package.json`: `{ "jest": { "preset": "jest-expo" } }` if not already present.
- [ ] Ensure dev deps include `jest` and `jest-expo` with versions compatible with SDK 53.
- [ ] Run `npm test` and fix only path/alias-related issues (no new tests at this time).

---

## Stage 9 — Runtime Smoke Tests

Goal: Verify parity with study-buddy’s behavior on devices/simulators.

- [ ] `npm run start` → open iOS and Android.
- [ ] On first launch, confirm onboarding appears (or is skipped based on stored value).
- [ ] Validate navigation through: Mode Selection → Main → Calm Mode → Parent Settings → Celebration.
- [ ] Trigger Paywall modal and confirm it renders; verify `isPremium` toggles when entitlements are present (use sandbox/test keys).
- [ ] Confirm notifications permission prompt and category/channel setup (no crashes).
- [ ] Verify Sentry init produces no errors; optionally trigger a handled error to confirm capture in dev.
- [ ] Ensure no red screens related to Reanimated plugin order or missing gesture-handler import.

Web (optional, parity check only):
- [ ] Open web build; expect limited functionality for native-only APIs, but app should not crash.

---

## Stage 10 — Cleanup and Documentation (port-only)

Goal: Remove only files that are now unused; avoid introducing new tooling.

- [ ] Remove leftover sample content from the blank template that is no longer referenced.
- [ ] Keep any placeholder assets commented in `app.json` unless actively used.
- [ ] Update root `README` with minimal run instructions and environment variable/`app.json.extra` requirements (do not add new docs beyond what’s needed to run).

---

## Risk Flags and Quick Fixes

- Reanimated/Metro issues: Ensure `'react-native-reanimated/plugin'` is last in Babel plugins and clear Metro cache if needed.
- Alias resolution in tests: If Jest can’t resolve aliases, add a minimal `moduleNameMapper` mirroring Babel aliases (only if necessary).
- Native module compatibility: If a specific native module fails on the blank template’s newArch setting, temporarily disable New Architecture (do not upgrade/downgrade modules during port unless required to run).
- Production gating: The UI that blocks production when `extra.*` values are missing should remain; use dev mode or sample values during validation.

---

## Completion Criteria

- All study-buddy screens and flows work in the root app without feature loss.
- No new libraries or patterns introduced beyond what study-buddy already used.
- Tests (if present) run and pass, or fail only for known, unchanged cases.
- iOS and Android simulators run without runtime errors or missing permission prompts.

