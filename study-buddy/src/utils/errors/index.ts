import * as Sentry from 'sentry-expo';

type ErrorContext = { ageGroup?: string; buddyId?: string; screen?: string; action?: string };

export function logError(error: Error, context?: ErrorContext) {
  console.error('Study Buddy Error:', error.message, context);
  Sentry.Native.captureException(error, { extra: context });
}

export function logMessage(message: string, context?: ErrorContext) {
  console.log('Study Buddy Log:', message, context);
  Sentry.Native.addBreadcrumb({ message, data: context });
}

export function captureError(error: unknown, context: ErrorContext = {}): void {
  try {
    Sentry.Native.captureException(error, { extra: context, tags: { screen: String(context.screen || '') } });
  } catch {}
}

export function captureMessage(message: string, context: ErrorContext = {}): void {
  try {
    Sentry.Native.captureMessage(message, { extra: context, tags: { screen: String(context.screen || '') } });
  } catch {}
}
