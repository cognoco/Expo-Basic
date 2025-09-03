import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { track } from '@utils/analytics';
import { t } from '@utils/intl/i18n';

export async function ensureNotificationsSetup(): Promise<void> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      try {
        await new Promise<void>((resolve) => {
          Alert.alert(
            t('notificationsPermissionTitle'),
            t('notificationsPermissionBody'),
            [
              { text: t('notNow'), onPress: () => resolve() },
              { text: t('continue'), onPress: () => resolve() }
            ]
          );
        });
      } catch {}
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    track('notifications_permission', { status: finalStatus });
    if (finalStatus !== 'granted') return;

    // Android: idempotent channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('checkins', {
        name: t('checkinTitle'),
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // iOS/Android: idempotent categories
    await Notifications.setNotificationCategoryAsync('checkin-actions', [
      { identifier: 'RESUME', buttonTitle: t('resume') },
      { identifier: 'BREAK', buttonTitle: t('break5') },
      { identifier: 'DONE', buttonTitle: t('imDone') },
    ]);
  } catch {}
}

export function extractActionIdFromResponse(response: Notifications.NotificationResponse | { actionIdentifier?: string }): string {
  return (response as any)?.actionIdentifier || '';
}
