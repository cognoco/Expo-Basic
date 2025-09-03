# Study Buddy → Root App Joint Porting Plan
*Hybrid approach combining Codex's structure with Claude's automation and validation*

## Scope & Philosophy
**Objective**: Port existing functionality from `study-buddy/` into root blank Expo app with sub-agent automation and structured validation.

**Port-Only Philosophy**: Do not add new features, restructure to Expo Router, or introduce new tooling beyond what the existing app already uses.

Out of scope:
- Expo Router migration or file-based routing.
- New lint/format configs beyond what the app already has.
- Design/UX updates, new screens, or new runtime capabilities.
- CI/CD changes.

Assumptions:
- Root project is the Expo "blank + TypeScript" template on SDK 53.
- We preserve React Navigation stack, module aliases, and existing screens/components as-is.
- **Claude sub-agents** will handle complex tasks (dependencies, file operations, testing).
- **Structured rollback procedures** provide safety nets throughout.

---

## Stage 0 — Pre‑flight and Backups
**Agent**: Manual validation | **Duration**: 10 minutes

- [ ] Confirm Node/npm versions are consistent with current development environment.
- [ ] **Baseline validation**: Ensure `study-buddy/` runs locally today (establishes known-good behavior for comparison).
- [ ] Create a branch for the port (e.g., `feat/port-study-buddy-joint`).
- [ ] **Safety checkpoint**: Tag current root app state for rollback capability.

**Rollback capability**: Branch created, original state preserved.

---

## Stage 1 — Align Dependencies and Scripts
**Agent**: general-purpose sub-agent | **Duration**: 30 minutes

**Goal**: Add exactly the dependencies required by `study-buddy` with automated conflict resolution.

### 1.1 Dependency Analysis & Merging (Sub-agent task)
- [ ] **Sub-agent**: Analyze study-buddy/package.json and root package.json for version conflicts
- [ ] **Critical version resolution**:
  - Keep root `react-native@0.79.6` (newer than study-buddy's 0.79.5)
  - Align Expo SDK, React versions (both use compatible versions)
- [ ] **Sub-agent**: Merge dependencies from study-buddy into root package.json:
  - Runtime deps: `@react-navigation/native`, `@react-navigation/stack`, `@react-native-async-storage/async-storage`, `@react-native-community/slider`, `expo-av`, `expo-camera`, `expo-crypto`, `expo-file-system`, `expo-haptics`, `expo-keep-awake`, `expo-local-authentication`, `expo-localization`, `expo-notifications`, `expo-speech`, `lottie-react-native`, `react-native-gesture-handler`, `react-native-purchases`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`, `sentry-expo`, `zod`
  - Dev deps: `@types/jest`, `jest`, `jest-expo`, `detox`

### 1.2 Scripts Integration
- [ ] **Sub-agent**: Add study-buddy scripts to root package.json:
  - `check:config`: `node ./scripts/check-config.js`
  - `postinstall`: `npx expo install --fix || true`
  - `test`: `jest`
  - `test:e2e:ios`: `detox test -c ios.sim.debug`
  - `test:e2e:android`: `detox test -c android.emu.debug`
- [ ] **Sub-agent**: Add Jest configuration: `{ "jest": { "preset": "jest-expo" } }`

### 1.3 Installation & Validation
- [ ] Run `npm install`
- [ ] Run `npx expo install --fix` (auto-fix Expo SDK compatibility)

**Validation checkpoint**: Dependencies install without conflicts.
**Rollback**: Restore original package.json and package-lock.json if conflicts arise.

---

## Stage 2 — Port Expo app.json Configuration
**Agent**: general-purpose sub-agent | **Duration**: 15 minutes

**Goal**: Bring over only the configuration needed for the app to function.

- [ ] **Sub-agent**: Merge study-buddy/app.json into root app.json, preserving:
  - `expo.name`: "Study Buddy", `expo.slug`: "study-buddy"
  - `ios.bundleIdentifier`: "com.focusflow.studybuddy", `ios.buildNumber`, `ios.infoPlist` usage descriptions
  - `android.package`: "com.focusflow.studybuddy", `android.versionCode`, `android.permissions`: `["RECORD_AUDIO", "VIBRATE", "CAMERA", "POST_NOTIFICATIONS"]`
  - `plugins`: `["sentry-expo"]`
  - `runtimeVersion`: `{ "policy": "sdkVersion" }`, `userInterfaceStyle`: "light"
  - `extra`: Complete copy of revenuecat, manageSubscriptions, sentry, posthog, remote, urls configuration
- [ ] Keep placeholder assets commented if not used by study-buddy

**Validation checkpoint**: app.json structure validates with Expo CLI.
**Rollback**: Restore original app.json if validation fails.

---

## Stage 3 — TypeScript Paths and Babel Aliases
**Agent**: general-purpose sub-agent | **Duration**: 20 minutes

**Goal**: Preserve study-buddy import aliases so code compiles unchanged.

### 3.1 TypeScript Configuration
- [ ] **Sub-agent**: Update root tsconfig.json with study-buddy's extensive path mappings:
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@screens/*": ["src/screens/*"],
        "@components/*": ["src/components/*"],
        "@utils/*": ["src/utils/*"],
        "@assets/*": ["src/assets/*"],
        "@config": ["src/utils/config"],
        "@config/*": ["src/utils/config/*"],
        "@content/*": ["src/utils/content/*"],
        "@types/*": ["src/types/*"],
        "@context": ["src/context"],
        "@context/*": ["src/context/*"],
        "@ui": ["src/ui"],
        "@ui/*": ["src/ui/*"]
      }
    }
  }
  ```

### 3.2 Babel Configuration (CRITICAL)
- [ ] **Sub-agent**: Create/replace root babel.config.js with study-buddy's config:
  - `presets: ['babel-preset-expo']`
  - `plugins`: module-resolver with same aliases
  - **CRITICAL**: Ensure `'react-native-reanimated/plugin'` is LAST in plugins array

### 3.3 Validation
- [ ] Run `npx tsc --noEmit` to validate TypeScript compilation

**Validation checkpoint**: TypeScript compiles without path resolution errors.
**Rollback**: Restore original tsconfig.json and remove babel.config.js.

---

## Stage 4 — Copy App Code and Scripts
**Agent**: general-purpose sub-agent | **Duration**: 25 minutes

**Goal**: Move code without modification using sub-agent file operations.

### 4.1 Source Code Migration
- [ ] **Sub-agent**: Create `src/` directory in root
- [ ] **Sub-agent**: Copy complete directory structure from study-buddy:
  - `src/screens/` (8 screens + tests)
  - `src/components/` (5 UI components)
  - `src/context/` (subscription context)
  - `src/utils/` (41 utility files in 12 subdirectories)
  - `src/ui/` (design system)
  - `src/types/` (navigation, index types)
  - `src/assets/` (animations, registry)

### 4.2 Supporting Files
- [ ] **Sub-agent**: Copy `scripts/` directory (check-config.js)
- [ ] **Sub-agent**: Copy `.github/workflows/` (CI/CD pipeline files)
- [ ] Keep root `index.ts` unchanged (entry point compatibility)

### 4.3 Import Path Validation
- [ ] **Sub-agent**: Verify all import paths resolve with new aliases
- [ ] Search/replace only if necessary for path differences

**Validation checkpoint**: All source files copied, imports resolve.
**Rollback**: Remove copied src/ and scripts/ directories.

---

## Stage 5 — Replace Root App Entrypoint
**Agent**: Manual with sub-agent assistance | **Duration**: 15 minutes

**Goal**: Use study-buddy's App.tsx with critical React Native setup preserved.

### 5.1 App.tsx Replacement (CRITICAL ORDER)
- [ ] **Sub-agent**: Replace root App.tsx with study-buddy/App.tsx
- [ ] **CRITICAL**: Ensure `import 'react-native-gesture-handler';` is THE FIRST import
- [ ] Keep root `index.ts` (registerRootComponent) unchanged
- [ ] Verify provider wrapping order remains: `GestureHandlerRootView` → `SafeAreaProvider` → `SubscriptionContext.Provider` → `ErrorBoundary` → `NavigationContainer`

### 5.2 Navigation Structure Validation
- [ ] Confirm `NavigationContainer` and `createStackNavigator` usage unchanged
- [ ] Verify all screen imports resolve correctly

**Validation checkpoint**: App.tsx imports resolve, provider hierarchy correct.
**Rollback**: Restore original App.tsx.

---

## Stage 6 — Initialize Native Modules & Services
**Agent**: Manual validation | **Duration**: 15 minutes

**Goal**: Preserve exact runtime behavior and side effects from study-buddy.

- [ ] **Sentry**: Verify initialization with DSN from `app.json.extra.sentry.dsn`
- [ ] **RevenueCat**: Confirm `Purchases.configure({ apiKey })` with platform-specific keys from `extra.revenuecat`
- [ ] **Analytics**: Validate `initAnalytics` and `track` functions from `@utils/analytics`
- [ ] **KeepAwake**: Confirm `KeepAwake.activateKeepAwakeAsync()` call
- [ ] **Localization**: Verify `initializeLanguage()` execution
- [ ] **Notifications**: Check `ensureNotificationPermission()` and response listener setup
- [ ] **Storage migrations**: Confirm `runMigrations()` from App.tsx intact

**Note**: Do not introduce new analytics/error providers beyond existing code.

**Validation checkpoint**: All service initializations preserved.
**Rollback**: Code changes isolated to App.tsx - easy to restore.

---

## Stage 7 — Assets and Permissions
**Agent**: Manual verification | **Duration**: 10 minutes

**Goal**: Ensure all referenced assets exist and permissions match app behavior.

- [ ] Verify Lottie animation files in `src/assets/animations/` (5 JSON files)
- [ ] Confirm asset registry in `src/assets/registry.ts` resolves correctly
- [ ] **iOS**: Verify usage descriptions cover microphone, camera, photo library in `ios.infoPlist`
- [ ] **Android**: Confirm permissions array includes only required: `RECORD_AUDIO`, `CAMERA`, `POST_NOTIFICATIONS`, `VIBRATE`
- [ ] Keep root assets/ as fallback (no conflict with src/assets/)

**Validation checkpoint**: Assets load, permissions properly declared.

---

## Stage 8 — Tests Validation
**Agent**: general-purpose sub-agent | **Duration**: 25 minutes

**Goal**: Run existing unit tests with sub-agent automation.

### 8.1 Test Configuration
- [ ] Confirm Jest config in root package.json: `{ "jest": { "preset": "jest-expo" } }`
- [ ] Verify dev dependencies include compatible jest and jest-expo versions

### 8.2 Test Execution (Sub-agent)
- [ ] **Sub-agent**: Run `npm test` and capture results
- [ ] **Sub-agent**: Fix only path/alias-related issues in test files (18 test files)
- [ ] **Sub-agent**: Report test results and any remaining failures

### 8.3 Test Validation
- [ ] Expect all tests to pass or fail only for known, unchanged cases
- [ ] Address alias resolution issues if Jest can't resolve imports

**Validation checkpoint**: Test suite runs, path-related issues resolved.
**Rollback**: Test failures don't block port - note issues for later resolution.

---

## Stage 9 — Runtime Smoke Tests
**Agent**: Manual with sub-agent reporting | **Duration**: 30 minutes

**Goal**: Verify parity with study-buddy's behavior on devices/simulators.

### 9.1 Development Server Testing
- [ ] `npm run start` → open iOS and Android simulators
- [ ] **First launch**: Confirm onboarding appears or is skipped based on storage
- [ ] **Navigation flow**: Mode Selection → Main → Calm Mode → Parent Settings → Celebration
- [ ] **Modal behavior**: Trigger Paywall modal, verify rendering and `isPremium` logic

### 9.2 Feature Validation
- [ ] **Notifications**: Permission prompt appears, no crashes on setup
- [ ] **Sentry**: Initialize without errors, optionally trigger test error capture
- [ ] **No red screens**: Verify Reanimated plugin order correct, gesture-handler import first

### 9.3 Web Build (Optional)
- [ ] Open `npm run web`, expect limited functionality but no crashes

### 9.4 Critical React Native Issues Check
- [ ] **Reanimated plugin**: Confirm it's LAST in babel plugins
- [ ] **Gesture handler**: Confirm import is FIRST in App.tsx
- [ ] **Metro cache**: Clear if seeing unexpected bundling issues

**Validation checkpoint**: Core app functionality works across platforms.
**Success criteria**: All screens navigate, animations load, no runtime import errors.

---

## Stage 10 — Cleanup and Documentation
**Agent**: Manual | **Duration**: 15 minutes

**Goal**: Remove unused files, document configuration requirements.

### 10.1 Template Cleanup
- [ ] Remove leftover sample content from blank template no longer referenced
- [ ] Keep placeholder assets commented in app.json unless actively used
- [ ] Preserve study-buddy directory until final validation complete

### 10.2 Documentation (Minimal)
- [ ] Update root README with:
  - Basic run instructions (`npm install`, `npm start`)
  - Environment variable requirements (API keys in `app.json.extra`)
  - Configuration validation command (`npm run check:config`)

### 10.3 Final Validation & Cleanup
- [ ] **Only after 100% success**: Remove `study-buddy/` directory
- [ ] Commit changes: `git add . && git commit -m "Port study-buddy app to root directory"`

**Completion checkpoint**: Clean root directory, documentation updated, old directory removed.

---

## Enhanced Risk Mitigation & Rollback Procedures

### Critical React Native Risk Flags
- **Reanimated/Metro issues**: Ensure `'react-native-reanimated/plugin'` is LAST in Babel plugins, clear Metro cache if needed
- **Gesture handler**: Ensure `import 'react-native-gesture-handler'` is FIRST import in App.tsx
- **Alias resolution in tests**: Add minimal `moduleNameMapper` to Jest config if aliases fail
- **Native module compatibility**: Temporarily disable New Architecture if modules fail on blank template setting
- **Production gating**: Preserve UI that blocks production when `extra.*` values are missing

### Structured Rollback Procedures
**Emergency rollback** (any stage):
```bash
git checkout .          # Restore all changes
git clean -fd          # Remove untracked files
# study-buddy directory preserved throughout migration
```

**Incremental rollbacks** by stage:
- **Stage 1**: `git checkout package.json package-lock.json`
- **Stage 2**: `git checkout app.json`
- **Stage 3**: `git checkout tsconfig.json && rm babel.config.js`
- **Stage 4**: `rm -rf src/ scripts/ .github/workflows/`
- **Stage 5**: `git checkout App.tsx`

### Sub-Agent Error Handling
- Sub-agents report specific errors with context
- Manual intervention required if sub-agent tasks fail
- Preserve intermediate state for debugging
- Clear rollback instructions for each automated step

---

## Completion Criteria & Success Metrics

### Functional Requirements
- ✅ All study-buddy screens and flows work in root app without feature loss
- ✅ Navigation between all 8 screens functions correctly
- ✅ Animations (5 Lottie files) load and display properly
- ✅ Voice synthesis, camera, notifications work as expected
- ✅ Third-party integrations (Sentry, RevenueCat, analytics) operational

### Technical Requirements
- ✅ No new libraries or patterns beyond what study-buddy used
- ✅ TypeScript compilation succeeds with proper path resolution
- ✅ Tests run and pass, or fail only for known unchanged cases
- ✅ iOS and Android simulators run without runtime errors
- ✅ Production configuration gating preserved

### Quality Assurance
- ✅ **Baseline comparison**: Ported app behavior matches original study-buddy
- ✅ **No regressions**: All existing functionality preserved
- ✅ **Clean state**: Root directory properly organized, unused files removed
- ✅ **Documentation**: Basic setup and configuration requirements documented

---

## Hybrid Approach Benefits

This joint plan combines:
- **Codex's practical structure**: 10-stage checklist with actionable tasks
- **Claude's automation power**: Sub-agents handle complex file operations and testing
- **Enhanced validation**: Baseline comparison + comprehensive checkpoints
- **Superior risk management**: Structured rollbacks + React Native specific safeguards
- **Optimal execution**: Manual oversight of critical steps, automation of repetitive tasks

**Expected duration**: 2.5-3 hours (faster than manual execution, more reliable than pure automation)
**Success probability**: High (combines practical experience with systematic validation)