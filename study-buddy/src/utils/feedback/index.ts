import * as Haptics from 'expo-haptics';
import { playSound } from '@utils/media/audio';

export type Impact = 'light' | 'medium' | 'heavy';

export async function impact(level: Impact = 'medium'): Promise<void> {
  const map = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  } as const;
  await Haptics.impactAsync(map[level]);
}

export async function success(): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function warning(): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export async function error(): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export async function selection(): Promise<void> {
  await Haptics.selectionAsync();
}

export async function playClick(sound?: any): Promise<void> {
  // Optionally pass a short embedded sound; otherwise, haptics alone
  if (sound) {
    await playSound(sound);
  } else {
    await selection();
  }
}
