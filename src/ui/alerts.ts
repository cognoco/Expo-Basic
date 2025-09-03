import { Alert } from 'react-native';

export function uiAlert(
  title: string,
  message?: string,
  buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
): void {
  try { Alert.alert(title, message, buttons); } catch {}
}

export function uiConfirm(title: string, message?: string, okText: string = 'OK', cancelText: string = 'Cancel'): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      Alert.alert(title, message, [
        { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
        { text: okText, onPress: () => resolve(true) },
      ]);
    } catch {
      resolve(false);
    }
  });
}
