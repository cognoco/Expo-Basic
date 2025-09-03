import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@types/navigation';

export function navigateToCelebration(navigation: NavigationProp<RootStackParamList>, params: RootStackParamList['Celebration']): void {
  navigation.navigate('Celebration', params);
}

export function navigateToMain(navigation: NavigationProp<RootStackParamList>, params?: RootStackParamList['Main']): void {
  navigation.navigate('Main', params as any);
}

export function navigateToPaywall(navigation: NavigationProp<RootStackParamList>, params: RootStackParamList['Paywall']): void {
  navigation.navigate('Paywall', params);
}
