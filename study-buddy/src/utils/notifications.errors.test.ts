import * as Notifications from 'expo-notifications';
import { ensureNotificationsSetup } from './notifications';

describe('notifications error paths', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('permission denied path exits without throwing', async () => {
    jest.spyOn(Notifications, 'getPermissionsAsync' as any).mockResolvedValueOnce({ status: 'denied' } as any);
    await expect(ensureNotificationsSetup()).resolves.toBeUndefined();
  });

  it('channel/category throw is caught and does not crash', async () => {
    jest.spyOn(Notifications, 'getPermissionsAsync' as any).mockResolvedValueOnce({ status: 'granted' } as any);
    jest.spyOn(Notifications, 'setNotificationChannelAsync' as any).mockRejectedValueOnce(new Error('channel-fail'));
    jest.spyOn(Notifications, 'setNotificationCategoryAsync' as any).mockRejectedValueOnce(new Error('category-fail'));
    await expect(ensureNotificationsSetup()).resolves.toBeUndefined();
  });
});
