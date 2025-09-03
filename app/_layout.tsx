import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="consent" />
          <Stack.Screen name="mode-selection" />
          <Stack.Screen name="main" />
          <Stack.Screen name="calm-mode" />
          <Stack.Screen name="parent-settings" />
          <Stack.Screen name="celebration" />
          <Stack.Screen 
            name="paywall" 
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
