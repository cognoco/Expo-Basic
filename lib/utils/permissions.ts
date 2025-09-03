import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { trackTyped } from '@utils/analytics/events';

type PermissionResult = { granted: boolean; canAskAgain?: boolean };

export async function ensureNotificationPermission(): Promise<PermissionResult> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      await new Promise<void>((resolve) => {
        Alert.alert(
          'Notifications',
          'We use occasional check-ins to keep your child on track. You can change this anytime.',
          [
            { text: 'Not now', onPress: () => resolve() },
            { text: 'Continue', onPress: () => resolve() }
          ]
        );
      });
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    trackTyped('notifications_permission', { status });
    if (Platform.OS === 'android' && status === 'granted') {
      await Notifications.setNotificationChannelAsync('checkins', {
        name: 'Check-ins',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return { granted: status === 'granted', canAskAgain: existing.canAskAgain };
  } catch {
    return { granted: false };
  }
}

export async function ensureCameraPermission(): Promise<PermissionResult> {
  try {
    const existing = await Camera.getCameraPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const requested = await Camera.requestCameraPermissionsAsync();
      status = requested.status;
    }
    return { granted: status === 'granted', canAskAgain: existing.canAskAgain };
  } catch {
    return { granted: false };
  }
}

export async function ensureMicrophonePermission(): Promise<PermissionResult> {
  try {
    const existing = await Audio.getPermissionsAsync();
    let status = existing.status as Notifications.PermissionStatus | undefined;
    if (status !== 'granted') {
      const requested = await Audio.requestPermissionsAsync();
      status = requested.status as Notifications.PermissionStatus | undefined;
    }
    return { granted: status === 'granted', canAskAgain: existing.canAskAgain };
  } catch {
    return { granted: false };
  }
}
