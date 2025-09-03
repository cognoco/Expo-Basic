// Minimal runtime guard to ensure production config is present
const assert = (cond, msg) => { if (!cond) { console.error(msg); process.exit(1); } };

try {
  const Constants = require('expo-constants').default;
  const extra = (Constants?.manifest?.extra || {});
  const ph = extra?.posthog || {};
  const rc = extra?.revenuecat || {};
  const sentry = extra?.sentry || {};

  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const isProd = process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production';

  if (isCI && isProd) {
    assert(!!ph.apiKey && !!ph.host, 'PostHog config missing in production');
    assert(!!rc.iosApiKey || !!rc.androidApiKey, 'RevenueCat API key missing in production');
    assert(typeof rc.entitlementId === 'string' && rc.entitlementId.length > 0, 'RevenueCat entitlementId missing');
    assert(typeof sentry.dsn === 'string' && sentry.dsn.length > 0, 'Sentry DSN missing in production');
  }

  console.log('Config check passed.');
  process.exit(0);
} catch (e) {
  console.error('Config check failed:', e?.message || e);
  process.exit(1);
}
