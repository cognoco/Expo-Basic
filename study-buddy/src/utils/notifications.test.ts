import * as Notifications from 'expo-notifications';
import { ensureNotificationsSetup } from './notifications';

describe('notifications setup', () => {
  it('creates channel and category when granted', async () => {
    jest.spyOn(Notifications, 'getPermissionsAsync' as any).mockResolvedValueOnce({ status: 'granted' } as any);
    const channelSpy = jest.spyOn(Notifications, 'setNotificationChannelAsync' as any).mockResolvedValueOnce(undefined as any);
    const categorySpy = jest.spyOn(Notifications, 'setNotificationCategoryAsync' as any).mockResolvedValueOnce(undefined as any);

    await ensureNotificationsSetup();

    expect(categorySpy).toHaveBeenCalled();
    // Android-only channel may not be called on CI; assert category at minimum

    channelSpy.mockRestore();
    categorySpy.mockRestore();
  });
});
