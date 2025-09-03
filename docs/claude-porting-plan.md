# Study-Buddy Porting Plan

## Executive Summary
**Objective**: Port the complete study-buddy educational application (76 files, 44+ dependencies) into the root directory structure, replacing the minimal temp-blank scaffold.

**Complexity**: Medium-High (requires careful dependency management and file migration)  
**Estimated Time**: 3-4 hours with sub-agent execution  
**Risk Level**: Low-Medium (well-structured migration with validation checkpoints)

---

## Phase 1: Pre-Migration Preparation & Validation
**Agent**: general-purpose | **Duration**: 20 minutes

### 1.1 Backup and Safety
- Create branch checkpoint before starting migration
- Verify current root directory clean state
- Validate study-buddy directory integrity (all 76 files present)

### 1.2 Dependency Analysis Validation
- Cross-check study-buddy package.json for any missed dependencies
- Identify potential version conflicts (react-native 0.79.5 → 0.79.6)
- Prepare dependency merge strategy with conflict resolution

### 1.3 Configuration File Inspection
- **Critical**: Examine app.json for bundle identifiers and permissions
- Validate tsconfig.json path mappings for scope
- Check babel.config.js module resolver configuration

---

## Phase 2: Configuration & Dependencies Migration  
**Agent**: general-purpose | **Duration**: 45 minutes

### 2.1 Package.json Merge (CRITICAL STEP)
```bash
# Merge strategy: Add study-buddy deps to root package.json
# Keep root react-native@0.79.6 (newer than study-buddy's 0.79.5)
# Add all 44+ study-buddy dependencies
# Add devDependencies: jest, detox, @types/jest, jest-expo
# Add scripts: test, test:e2e:*, check:config, postinstall
```

**New Scripts to Add:**
```json
{
  "check:config": "node ./scripts/check-config.js",
  "postinstall": "npx expo install --fix || true", 
  "test": "jest",
  "test:e2e:ios": "detox test -c ios.sim.debug",
  "test:e2e:android": "detox test -c android.emu.debug"
}
```

**Jest Configuration Addition:**
```json
{
  "jest": {
    "preset": "jest-expo"
  }
}
```

### 2.2 Configuration Files Replacement
- **app.json**: Replace with study-buddy version (preserve bundle ID, permissions, third-party configs)
- **tsconfig.json**: Replace with study-buddy version (extensive path mappings)
- **Create babel.config.js**: Copy from study-buddy (essential for module resolution)

### 2.3 Dependency Installation & Verification
```bash
npm install
npx expo install --fix  # Auto-fix Expo SDK compatibility
npm run check:config    # Validate configuration
```

---

## Phase 3: Source Code & Assets Migration
**Agent**: general-purpose | **Duration**: 30 minutes

### 3.1 Replace App.tsx  
- **Action**: Replace root App.tsx with study-buddy/App.tsx
- **Critical**: Contains complete app initialization, navigation setup, error boundaries
- **Dependencies**: Imports from src/ structure, requires all subsequent files

### 3.2 Copy Entire src/ Directory Structure
```bash
# Transfer complete study-buddy/src/ to root/src/
# Preserves:
# - src/assets/          (animations, registry)
# - src/components/      (5 UI components)  
# - src/context/         (subscription context)
# - src/screens/         (8 screens + tests)
# - src/types/           (navigation, index types)
# - src/ui/              (design system)
# - src/utils/           (41 utility files in 12 subdirectories)
```

### 3.3 Supporting Files Migration
- **scripts/**: Copy check-config.js script (referenced in package.json)
- **.github/workflows/**: Copy CI/CD pipeline files (ci.yml, build.yml)
- **index.ts**: Keep root version (entry point compatibility)

### 3.4 Asset Conflict Resolution
- **Keep**: Root assets/ directory (fallback icons)
- **Note**: Study-buddy assets are in src/assets/ (no conflict)

---

## Phase 4: Build Validation & Testing
**Agent**: general-purpose | **Duration**: 45 minutes

### 4.1 TypeScript Compilation Check
```bash
npx tsc --noEmit        # Validate TypeScript without output
# Expected: Zero errors (path mappings should resolve)
```

### 4.2 Metro Bundle Build
```bash 
npm run web             # Test web bundling
# OR
npm start               # Start development server
```

### 4.3 Test Suite Execution  
```bash
npm test                # Run Jest unit tests (18 test files)
# Expected: All tests pass or reveal only environment-specific issues
```

### 4.4 Configuration Validation
```bash
npm run check:config    # Validate app configuration
# Checks for missing API keys, proper setup
```

---

## Phase 5: Import Resolution & Path Validation
**Agent**: general-purpose | **Duration**: 30 minutes  

### 5.1 Critical Path Mappings Verification
**Study-buddy uses extensive TypeScript path aliases:**
```typescript
@screens/*    → src/screens/*
@components/* → src/components/*  
@utils/*      → src/utils/*
@assets/*     → src/assets/*
@config       → src/utils/config
@types/*      → src/types/*
@context/*    → src/context/*
@ui/*         → src/ui/*
```

### 5.2 Import Resolution Testing
- Verify all imports in App.tsx resolve correctly  
- Test complex nested imports (utils subdirectories)
- Validate module resolution in babel.config.js

### 5.3 Third-Party Integration Verification
- **Sentry**: Error reporting configuration
- **RevenueCat**: Purchase system integration
- **Expo modules**: Camera, speech, notifications access

---

## Phase 6: Final Validation & Cleanup
**Agent**: general-purpose | **Duration**: 30 minutes

### 6.1 End-to-End Functionality Test
```bash
# Start app and verify core features:
# - Navigation between screens works
# - Animations load properly  
# - No runtime import errors
# - Third-party services initialize
```

### 6.2 Production Build Verification
```bash
npx expo export:web     # Test production web build
# OR  
npx expo build:ios     # Test iOS build preparation
```

### 6.3 Study-Buddy Directory Cleanup
```bash
# Only after 100% validation success:
rm -rf study-buddy/    # Remove original directory
git add .              # Stage all changes
git commit -m "Port study-buddy app to root directory"
```

---

## File Conflicts and Merging Strategy

### **Direct File Conflicts (5 files)**

| File | Root (temp-blank) | Study-Buddy | Resolution Strategy |
|------|------------------|-------------|-------------------|
| `package.json` | Minimal (4 deps) | Complex (44+ deps) | **MERGE** - Add study-buddy deps to root |
| `App.tsx` | Placeholder | Production app | **REPLACE** - Use study-buddy version |
| `app.json` | Basic config | Rich config | **REPLACE** - Use study-buddy config |
| `tsconfig.json` | Basic extends | Advanced paths | **REPLACE** - Use study-buddy version |
| `assets/` | Template icons | None | **KEEP ROOT** - Preserve as fallback |

### **Asset Conflicts Resolution**
- **Root assets**: Keep as fallback (icon.png, favicon.png, etc.)
- **Study-buddy assets**: Will be in `src/assets/` - no direct conflict
- **Strategy**: Root assets become defaults, study-buddy assets provide app-specific media

---

## Dependency Reconciliation Plan

### **Current Root Dependencies (4 total)**
```json
{
  "expo": "~53.0.22",
  "expo-status-bar": "~2.2.3", 
  "react": "19.0.0",
  "react-native": "0.79.6"
}
```

### **Study-Buddy Dependencies Analysis**
**Version Conflicts to Resolve:**
- ✅ `react-native`: Root=0.79.6, Study-buddy=0.79.5 → Use Root (newer)
- ✅ `expo`: Both use 53.0.22 → No conflict
- ✅ `react`: Both use 19.0.0 → No conflict

**New Dependencies to Add (40+ packages):**
```json
{
  // Navigation (2 packages)
  "@react-navigation/native": "^6.1.7",
  "@react-navigation/stack": "^6.3.17",
  
  // Expo Modules (12 packages) 
  "expo-av": "~15.1.7",
  "expo-camera": "~16.1.11",
  "expo-crypto": "~14.1.5",
  "expo-file-system": "~18.1.11",
  "expo-haptics": "~14.1.4",
  "expo-keep-awake": "~14.1.4",
  "expo-local-authentication": "~16.0.5",
  "expo-localization": "~16.1.6",
  "expo-notifications": "~0.31.4",
  "expo-speech": "~13.1.7",
  
  // React Native Modules (7 packages)
  "react-native-gesture-handler": "~2.24.0",
  "react-native-purchases": "^7.0.0",
  "react-native-reanimated": "~3.17.4",
  "react-native-safe-area-context": "5.4.0",
  "react-native-screens": "~4.11.1",
  "react-native-svg": "15.11.2",
  
  // Third-party (4 packages)
  "@react-native-async-storage/async-storage": "2.1.2",
  "@react-native-community/slider": "4.5.6", 
  "lottie-react-native": "7.2.2",
  "sentry-expo": "^7.2.0",
  "zod": "^3.23.8"
}
```

**DevDependencies to Add (3 packages):**
```json
{
  "@types/jest": "^29.5.12",
  "detox": "^20.0.0", 
  "jest": "^29.7.0",
  "jest-expo": "~53.0.10"
}
```

---

## Critical Success Factors

### ✅ **Dependency Management**
- All 44+ dependencies properly added to package.json
- Version conflicts resolved (especially react-native)
- npm install completes without errors

### ✅ **Path Resolution** 
- TypeScript compilation succeeds with path mappings
- Babel module resolver correctly configured
- All imports resolve at runtime

### ✅ **Configuration Integrity**
- app.json preserves all permissions and third-party configs
- Bundle identifiers and app metadata correct
- API keys and external service configurations preserved

### ✅ **Feature Preservation**
- All 8 screens navigate correctly
- Animations and assets load properly
- Voice, camera, notification features functional
- Purchase system and analytics operational

---

## Risk Mitigation & Rollback Plan

### **Risk**: Import resolution failures
**Mitigation**: Validate tsconfig.json paths before App.tsx replacement
**Rollback**: Restore original configuration files

### **Risk**: Dependency version conflicts  
**Mitigation**: Use `npx expo install --fix` after initial install
**Rollback**: Restore original package.json and package-lock.json

### **Risk**: Build system failures
**Mitigation**: Incremental testing at each phase
**Rollback**: Preserve study-buddy directory until final validation

### **Emergency Rollback Procedure:**
```bash
git checkout .          # Restore all changes
git clean -fd          # Remove untracked files  
# study-buddy directory preserved throughout migration
```

---

## Expected Outcomes

### **Successful Migration Results:**
- ✅ Study Buddy app fully operational in root directory
- ✅ All 76 files successfully ported and functional
- ✅ Complete test suite passing (18 test files)
- ✅ CI/CD pipeline operational in new location
- ✅ All third-party integrations preserved
- ✅ Development and production builds working

### **Post-Migration Benefits:**
- Clean, production-ready codebase structure
- Proper Expo best practices implementation  
- Maintainable dependency management
- Scalable application architecture

---

## Study-Buddy App Analysis Summary

### **Architecture Overview**
Study-buddy is a mature educational application with sophisticated features:

- **76 total files** across organized directory structure
- **44+ production dependencies** including Expo modules, React Navigation, third-party services
- **18 test files** with Jest and Detox E2E testing
- **8 main screens** with complex navigation patterns
- **Advanced features**: Voice synthesis, camera integration, animations, analytics, in-app purchases

### **Key Components:**
- **Screens**: Onboarding, Mode Selection, Main Study, Calm Mode, Parent Settings, Celebration, Paywall, Consent
- **Features**: Study timer, animated buddy character, voice feedback, photo capture, subscription management
- **Integrations**: Sentry (error reporting), RevenueCat (subscriptions), PostHog (analytics)
- **Architecture**: Modular utility system, TypeScript path mappings, comprehensive error handling

This plan provides a systematic, low-risk approach to porting the mature study-buddy educational application while preserving all functionality and maintaining development velocity.