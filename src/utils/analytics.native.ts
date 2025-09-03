import { Platform } from 'react-native';
import { getAppConfig } from '@config/appConfig';
import { PostHog } from 'posthog-react-native';

let posthog: any = null;

export const initAnalytics = async (): Promise<void> => {
  try {
    const { posthog: ph } = getAppConfig();
    const key = ph.apiKey;
    const host = ph.host;
    if (!key || !host) return;
    posthog = new PostHog(key, { host, flushAt: 1 });
    await posthog.setup();
    posthog?.identify?.(undefined, { platform: Platform.OS });
  } catch {}
};

export const track = (event: string, props: Record<string, unknown> = {}): void => {
  try { posthog?.capture?.(event, props); } catch {}
};

export const flush = async (): Promise<void> => { try { await posthog?.flush?.(); } catch {} };
