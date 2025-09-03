import Constants from 'expo-constants';
import { z } from 'zod';

export type AppConfig = {
  revenuecat: { iosApiKey: string; androidApiKey: string; entitlementId: string };
  manageSubscriptions: { ios: string; android: string };
  sentry: { dsn: string };
  posthog: { apiKey: string; host: string };
  remote: { paywall: { sessionsTillPaywall: number; variants: Record<string, number> }; surprise: { frequencyMultiplier: number } };
  urls: { privacyPolicy: string; termsOfService: string; support: string };
};

export function getAppConfig(): AppConfig {
  const extra: any = (Constants?.manifest?.extra || {});
  const AppConfigSchema = z.object({
    revenuecat: z.object({
      iosApiKey: z.string().optional().default(''),
      androidApiKey: z.string().optional().default(''),
      entitlementId: z.string().optional().default('premium')
    }).optional().default({ iosApiKey: '', androidApiKey: '', entitlementId: 'premium' }),
    manageSubscriptions: z.object({
      ios: z.string().optional().default('itms-apps://apps.apple.com/account/subscriptions'),
      android: z.string().optional().default('https://play.google.com/store/account/subscriptions')
    }).optional().default({ ios: 'itms-apps://apps.apple.com/account/subscriptions', android: 'https://play.google.com/store/account/subscriptions' }),
    sentry: z.object({ dsn: z.string().optional().default('') }).optional().default({ dsn: '' }),
    posthog: z.object({ apiKey: z.string().optional().default(''), host: z.string().optional().default('') }).optional().default({ apiKey: '', host: '' }),
    remote: z.object({
      paywall: z.object({
        sessionsTillPaywall: z.number().int().min(1).max(10).default(3),
        variants: z.record(z.number()).default({ A: 1 })
      }).default({ sessionsTillPaywall: 3, variants: { A: 1 } }),
      surprise: z.object({ frequencyMultiplier: z.number().min(0).max(3).default(1.0) }).default({ frequencyMultiplier: 1.0 })
    }).optional().default({ paywall: { sessionsTillPaywall: 3, variants: { A: 1 } }, surprise: { frequencyMultiplier: 1.0 } }),
    urls: z.object({
      privacyPolicy: z.string().optional().default('https://example.com/privacy'),
      termsOfService: z.string().optional().default('https://example.com/terms'),
      support: z.string().optional().default('https://example.com/support')
    }).optional().default({ privacyPolicy: 'https://example.com/privacy', termsOfService: 'https://example.com/terms', support: 'https://example.com/support' })
  });

  const parsed = AppConfigSchema.safeParse(extra);
  if (!parsed.success) {
    try { console.warn('Invalid AppConfig; using defaults', parsed.error.format()); } catch {}
  }
  const data = parsed.success ? parsed.data : AppConfigSchema.parse({});
  return data as AppConfig;
}
