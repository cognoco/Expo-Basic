import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { getAppConfig } from '@config/appConfig';
import { Analytics, trackTyped } from '@utils/analytics/events';

export type PurchaseStatus = { isPremium: boolean };

const APP = getAppConfig();
const ENTITLEMENT_ID = APP.revenuecat?.entitlementId || 'premium';

export async function configurePurchases(): Promise<void> {
  const iosKey = APP.revenuecat?.iosApiKey || '';
  const androidKey = APP.revenuecat?.androidApiKey || '';
  const apiKey = Platform.select({ ios: iosKey, android: androidKey });
  if (!apiKey) return;
  await Purchases.configure({ apiKey });
}

export async function hasPremium(): Promise<PurchaseStatus> {
  try {
    const info = await Purchases.getCustomerInfo();
    return { isPremium: !!info?.entitlements?.active?.[ENTITLEMENT_ID] };
  } catch (e) {
    return { isPremium: false };
  }
}

export async function getCurrentOfferings() {
  return Purchases.getOfferings();
}

export async function purchasePackage(pkg: any): Promise<PurchaseStatus> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPremium = !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
    if (isPremium) {
      Analytics.purchaseSuccess({ package: pkg?.identifier, price: pkg?.product?.priceString });
    }
    return { isPremium };
  } catch (e: any) {
    if (!e?.userCancelled) {
      trackTyped('purchase_failed', { error: String(e) });
    }
    return { isPremium: false };
  }
}

export async function restore(): Promise<PurchaseStatus> {
  try {
    const info = await Purchases.restorePurchases();
    const isPremium = !!info?.entitlements?.active?.[ENTITLEMENT_ID];
    if (isPremium) Analytics.restoreSuccess();
    else trackTyped('restore_failed', { error: 'no_active' });
    return { isPremium };
  } catch (e) {
    trackTyped('restore_failed', { error: String(e) });
    return { isPremium: false };
  }
}
