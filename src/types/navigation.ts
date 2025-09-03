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
