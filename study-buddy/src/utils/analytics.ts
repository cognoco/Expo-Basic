import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getAppConfig } from '@config/appConfig';

let posthog = null;

export const initAnalytics = async (): Promise<void> => {
  try {
    const { posthog: ph } = getAppConfig();
    const key = ph.apiKey;
    const host = ph.host;
    if (!key || !host) return;
    // Lazy import to avoid bundling if not set
    const { PostHog } = await import('posthog-react-native');
    posthog = new PostHog(key, { host, flushAt: 1 });
    await posthog.setup();
    posthog?.identify?.(undefined, { platform: Platform.OS });
  } catch {}
};

export const track = (event: string, props: Record<string, unknown> = {}): void => {
  try { posthog?.capture?.(event, props); } catch {}
};

export const flush = async (): Promise<void> => { try { await posthog?.flush?.(); } catch {} };
