// Legacy React Navigation types (kept for migration compatibility)
export type RootStackParamList = {
  Onboarding: undefined;
  ModeSelection: undefined;
  Main: { selectedSubject?: { id: string; label: string }; quickStart?: { workMinutes?: number; breakMinutes?: number } } | undefined;
  CalmMode: undefined;
  ParentSettings: { sessionLog?: unknown[] } | undefined;
  Celebration: { sessionTime: number; totalTime: number; streak: number; ageGroup: string; workPhoto?: string | null; sessionLog: unknown[]; tokenAward?: number };
  Paywall: { ageGroup: string };
  Consent: undefined;
};

// Expo Router types (new file-based routing)
export type RouteParams = {
  '/': undefined;
  '/onboarding': undefined;
  '/consent': undefined;
  '/mode-selection': undefined;
  '/main': { 
    selectedSubject?: string; // JSON stringified object
    quickStart?: string; // JSON stringified object
  };
  '/calm-mode': undefined;
  '/parent-settings': { 
    sessionLog?: string; // JSON stringified array
  };
  '/celebration': { 
    sessionTime: string;
    totalTime: string;
    streak: string;
    ageGroup: string;
    workPhoto?: string;
    sessionLog: string; // JSON stringified array
    tokenAward?: string;
  };
  '/paywall': { 
    ageGroup: string;
  };
};

// Type definitions for objects that will be serialized
export type SelectedSubject = {
  id: string;
  label: string;
};

export type QuickStartConfig = {
  workMinutes?: number;
  breakMinutes?: number;
};
