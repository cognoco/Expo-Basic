import { track } from '../analytics';

// Centralized, typed analytics events
export type EventsMap = {
  app_start: { version?: string };
  onboarding_complete: { ageGroup: string; buddyId?: string };
  consent_accepted: Record<string, never>;
  session_start: { subjectId: string; ageGroup: string };
  session_end: { duration: number; ageGroup: string; subjectId?: string };
  proof_photo_captured: { ageGroup: string; uri: string };
  notifications_permission: { status: string };
  purchase_success: { package?: string; price?: string };
  purchase_failed: { error: string };
  restore_success: Record<string, never>;
  restore_failed: { error: string };
};

export type EventName = keyof EventsMap;

export function trackTyped<E extends EventName>(event: E, payload: EventsMap[E]): void {
  track(event, payload as Record<string, unknown>);
}

// Convenience wrappers
export const Analytics = {
  sessionStart: (p: EventsMap['session_start']) => trackTyped('session_start', p),
  sessionEnd: (p: EventsMap['session_end']) => trackTyped('session_end', p),
  onboardingComplete: (p: EventsMap['onboarding_complete']) => trackTyped('onboarding_complete', p),
  consentAccepted: () => trackTyped('consent_accepted', {}),
  proofPhotoCaptured: (p: EventsMap['proof_photo_captured']) => trackTyped('proof_photo_captured', p),
  notificationsPermission: (p: EventsMap['notifications_permission']) => trackTyped('notifications_permission', p),
  purchaseSuccess: (p: EventsMap['purchase_success']) => trackTyped('purchase_success', p),
  purchaseFailed: (p: EventsMap['purchase_failed']) => trackTyped('purchase_failed', p),
  restoreSuccess: () => trackTyped('restore_success', {}),
  restoreFailed: (p: EventsMap['restore_failed']) => trackTyped('restore_failed', p),
};
