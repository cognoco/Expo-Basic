// Additional Jest setup for Study Buddy port
// This extends the jest-expo preset with additional mocks

// Critical: Mock React Native core modules BEFORE anything else loads
jest.doMock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 667 })),
  set: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock React Native TurboModuleRegistry to prevent bridge errors
jest.doMock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  get: jest.fn(() => null),
  getEnforcing: jest.fn(() => ({})),
}));

// Mock React Native Purchases
jest.doMock('react-native-purchases', () => ({
  configure: jest.fn().mockResolvedValue(undefined),
  getCustomerInfo: jest.fn().mockResolvedValue({
    activeSubscriptions: [],
    allPurchaseIds: [],
    allPurchaseIdsByProductId: {}
  }),
  purchaseStoreProduct: jest.fn().mockResolvedValue({}),
  restorePurchases: jest.fn().mockResolvedValue({}),
}));

// Mock Expo Constants
jest.doMock('expo-constants', () => ({
  __esModule: true,
  default: {
    appOwnership: 'standalone',
    deviceName: 'Jest Test Device',
    experienceUrl: 'exp://localhost:8081',
    isDevice: true,
    platform: {
      ios: {
        platform: 'ios',
      },
    },
    systemVersion: '14.0',
  },
}));

// Mock AsyncStorage for i18n
jest.doMock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Mock Expo Speech
jest.doMock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn().mockResolvedValue(undefined),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
  getAvailableVoicesAsync: jest.fn().mockResolvedValue([]),
}));

// Mock Expo Notifications
jest.doMock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    canAskAgain: true,
    granted: true,
  }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    canAskAgain: true,
    granted: true,
  }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock Expo Camera
jest.doMock('expo-camera', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    canAskAgain: true,
    granted: true,
  }),
  getCameraPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    canAskAgain: true,
    granted: true,
  }),
}));

// Mock Expo Localization
jest.doMock('expo-localization', () => ({
  locale: 'en-US',
  locales: ['en-US'],
  timezone: 'America/New_York',
  isRTL: false,
  getLocales: jest.fn(() => [{ languageCode: 'en', countryCode: 'US' }]),
}));