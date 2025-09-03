import { getAppConfig } from '@config/appConfig';

describe('AppConfig URLs and manage subscriptions', () => {
  it('provides well-formed default URLs', () => {
    const cfg = getAppConfig();
    expect(cfg.urls.privacyPolicy).toMatch(/^https?:\/\//);
    expect(cfg.urls.termsOfService).toMatch(/^https?:\/\//);
    expect(cfg.urls.support).toMatch(/^https?:\/\//);
    expect(cfg.manageSubscriptions.ios).toMatch(/itms-apps:\/\//);
    expect(cfg.manageSubscriptions.android).toMatch(/^https?:\/\//);
  });
});
