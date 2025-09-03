import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as KeepAwake from 'expo-keep-awake';
import * as Notifications from 'expo-notifications';
import { Platform, View, Text, Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import Constants from 'expo-constants';
import { initAnalytics, track } from '@utils/analytics';
import { ensureNotificationPermission } from '@utils/permissions';
import { extractActionIdFromResponse } from '@utils/notifications';
import { getAppConfig } from '@config/appConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import OnboardingScreen from '@screens/OnboardingScreen';
import ModeSelectionScreen from '@screens/ModeSelectionScreen';
import MainScreen from '@screens/MainScreen';
import CalmModeScreen from '@screens/CalmModeScreen';
import ParentSettingsScreen from '@screens/ParentSettingsScreen';
import CelebrationScreen from '@screens/CelebrationScreen';
import PaywallScreen from '@screens/PaywallScreen';
import ConsentScreen from '@screens/ConsentScreen';
import { getStorageItem, setStorageItem } from '@utils/core/storage';
import { getStringKey, setStringKey } from '@utils/core/storageKeys';
import { initializeLanguage } from '@utils/intl/i18n';
import { cleanOldPhotos } from '@utils/media/photoManager';
import * as Sentry from 'sentry-expo';
import { SubscriptionContext } from '@context/SubscriptionContext';

const APP_CONFIG = getAppConfig();
Sentry.init({
  dsn: APP_CONFIG.sentry.dsn,
  enableInExpoDevelopment: true,
  debug: __DEV__,
});

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }>{
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ hasError: true });
    try {
      Sentry.Native.captureException(error, { extra: { componentStack: errorInfo.componentStack } as any });
    } catch {}
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 40 }}>😢</Text>
          <Text>Oops! Your buddy needs a quick break.</Text>
        </View>
      );
    }
    return this.props.children as any;
  }
}

import type { RootStackParamList } from '@types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

// SubscriptionContext moved to @context/SubscriptionContext to avoid require cycles

export default function App(): React.ReactElement | null {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPremium, setIsPremium] = useState<boolean>(false);

  useEffect(() => {
    runMigrations();
    checkFirstLaunch();
    KeepAwake.activateKeepAwakeAsync();
    ensureNotificationPermission();
    initializeLanguage();
    cleanOldPhotos();
    initializeRevenueCat();
    initAnalytics();

    const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      try {
        const actionId = extractActionIdFromResponse(response);
        await setStorageItem('lastNotifAction', actionId || '');
      } catch (e) {}
    });
    return () => sub.remove();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      const iosKey = APP_CONFIG.revenuecat.iosApiKey;
      const androidKey = APP_CONFIG.revenuecat.androidApiKey;
      const apiKey = Platform.select({ ios: iosKey, android: androidKey });
      if (apiKey) {
        await Purchases.configure({ apiKey });
        await checkPremiumStatus();
      }
    } catch {}
  };

  const checkPremiumStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const extra = (Constants?.manifest?.extra as any) || {};
      const entitlementId = extra?.revenuecat?.entitlementId || 'premium';
      setIsPremium(customerInfo.entitlements.active[entitlementId] !== undefined);
    } catch {}
  };

  // notifications moved to @utils/notifications

  const checkFirstLaunch = async () => {
    const hasLaunched = await getStorageItem('hasLaunched');
    setIsFirstLaunch(!hasLaunched);
    setIsLoading(false);
  };

  // Simple storage schema migration harness
  const runMigrations = async (): Promise<void> => {
    try {
      const VERSION_KEY = 'storageVersion' as any;
      const current = await getStringKey(VERSION_KEY);
      const ver = current ? parseInt(current) : 0;
      // v1 example: ensure streak keys exist with sane defaults
      if (ver < 1) {
        const streak = await getStringKey('currentStreak' as any);
        if (streak === null) await setStringKey('currentStreak' as any, '0');
        const total = await getStringKey('totalFocusTime' as any);
        if (total === null) await setStringKey('totalFocusTime' as any, '0');
        await setStringKey(VERSION_KEY, '1');
      }
      // future migrations go here
    } catch {}
  };

  if (isLoading) return null;

  // Gate production if critical config missing
  if (!__DEV__) {
    const ph = APP_CONFIG.posthog;
    const rc = APP_CONFIG.revenuecat;
    const sentryCfg = APP_CONFIG.sentry;
    const missing = !ph.apiKey || !ph.host || (!(rc.iosApiKey || rc.androidApiKey)) || !sentryCfg.dsn;
    if (missing) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>Configuration Required</Text>
          <Text style={{ textAlign: 'center', color: '#2C3E50' }}>
            Missing analytics, error reporting, or purchase configuration. Please update app settings and relaunch.
          </Text>
        </View>
      );
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SubscriptionContext.Provider value={{ isPremium, checkPremiumStatus }}>
          <ErrorBoundary>
            <NavigationContainer>
              <StatusBar style="dark" />
              <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
                {isFirstLaunch ? (
                  <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : null}
                <Stack.Screen name="ModeSelection" component={ModeSelectionScreen} />
                <Stack.Screen name="Main" component={MainScreen} />
                <Stack.Screen name="CalmMode" component={CalmModeScreen} />
                <Stack.Screen name="ParentSettings" component={ParentSettingsScreen} />
                <Stack.Screen name="Celebration" component={CelebrationScreen} />
                <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
                <Stack.Screen name="Consent" component={ConsentScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </ErrorBoundary>
        </SubscriptionContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}