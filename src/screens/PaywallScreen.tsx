import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Linking
} from 'react-native';
import Constants from 'expo-constants';
import { getAppConfig } from '@config/appConfig';
import { getAgeConfig, getScaledSize } from '@utils/config/constants';
import { t } from '@utils/intl/i18n';
import { track } from '@utils/analytics';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@types/navigation';
import { getCurrentOfferings, purchasePackage as buyPkg, restore as restorePurchasesAPI } from '@utils/purchases';

type Props = StackScreenProps<RootStackParamList, 'Paywall'>;

export default function PaywallScreen({ navigation, route }: Props) {
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const ageGroup = route.params?.ageGroup || 'elementary';
  const config = getAgeConfig(ageGroup);
  const extra = getAppConfig();

  useEffect(() => {
    // Decide variant using weighted selection; persist for session via simple RNG
    const variants = extra.remote?.paywall?.variants || { A: 1 };
    const r = Math.random();
    const total = Object.values(variants).reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    let chosen: 'A' | 'B' = 'A';
    (Object.entries(variants) as Array<[string, number]>).forEach(([k, w]) => {
      if (acc / total <= r && r < (acc + w) / total) {
        chosen = (k === 'B' ? 'B' : 'A');
      }
      acc += w;
    });
    setVariant(chosen);
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await getCurrentOfferings();
      if (offerings.current !== null) {
        setOfferings(offerings.current);
      } else {
        setOfferings(null);
      }
      setLoading(false);
    } catch (e) {
      console.log('Error loading offerings:', e);
      setLoading(false);
    }
  };

  const purchasePackage = async (packageItem) => {
    setPurchasing(true);
    try {
      const { isPremium } = await buyPkg(packageItem);
      if (isPremium) {
        Alert.alert('Success!', 'Welcome to Study Buddy Premium!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (e) {
      // Errors tracked in purchases wrapper
      Alert.alert('Error', 'Purchase failed. Please try again.');
    }
    setPurchasing(false);
  };

  const restorePurchases = async () => {
    setPurchasing(true);
    try {
      const { isPremium } = await restorePurchasesAPI();
      if (isPremium) {
        track('restore_success');
        Alert.alert('Restored', 'Your premium access has been restored.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        track('restore_no_active');
        Alert.alert('No Active Subscriptions', 'We could not find an active premium subscription on this account.');
      }
    } catch (e) {
      track('restore_failed', { error: String(e) });
      Alert.alert('Error', 'Could not restore purchases. Please try again later.');
    }
    setPurchasing(false);
  };

  const openManageSubscriptions = async () => {
    const urls = extra?.manageSubscriptions || {};
    const url = Platform.OS === 'ios' ? urls.ios : urls.android;
    if (url) {
      try { await Linking.openURL(url); } catch {}
    }
  };

  const retryLoad = () => {
    setLoading(true);
    loadOfferings();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: config.secondaryColor }]}>
        <ActivityIndicator size="large" color={config.primaryColor} />
      </SafeAreaView>
    );
  }

  const noOffering = !offerings || !offerings.availablePackages?.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: config.secondaryColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.title, { color: config.primaryColor }]}>Study Buddy Premium</Text>
        {variant === 'B' && (
          <Text style={[styles.subtitle, { color: '#2C3E50', marginTop: 6 }]}>Unlock calmer study time and fewer battles at home.</Text>
        )}

        {noOffering ? (
          <View style={styles.benefitsContainer}>
            <Text style={[styles.benefitTitle, { marginBottom: 8 }]}>No plans available</Text>
            <Text style={{ color: '#2C3E50', textAlign: 'center' }}>
              We couldn't load subscription options. Please try again later or restore purchases.
            </Text>
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={retryLoad}
              disabled={purchasing}
              accessibilityRole="button"
              accessibilityLabel="Retry"
            >
              <Text style={styles.restoreText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitTitle}>Unlock Everything:</Text>
              {(variant === 'A'
                ? [
                    '✓ Unlimited study sessions',
                    '✓ All buddy characters',
                    '✓ Custom encouragement messages',
                    '✓ Detailed progress reports',
                    '✓ Photo history gallery',
                    '✓ Ad-free forever'
                  ]
                : [
                    '✓ Calmer homework time, fewer negotiations',
                    "✓ Buddy voices that match your child's age",
                    '✓ Custom parent encouragement clips',
                    '✓ Weekly focus insights for parents',
                    '✓ Private on-device photo gallery',
                    '✓ No ads — ever'
                  ]).map((benefit, index) => (
                <Text key={index} style={styles.benefitItem}>{benefit}</Text>
              ))}
            </View>

            {/* Packages */}
            {offerings && offerings.availablePackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.packageButton, { backgroundColor: config.primaryColor }]}
                onPress={() => purchasePackage(pkg)}
                disabled={purchasing}
                accessibilityRole="button"
                accessibilityLabel={`Purchase ${pkg.product.title}`}
              >
                <Text style={styles.packageTitle}>{pkg.product.title}</Text>
                <Text style={styles.packagePrice}>
                  {pkg.product.priceString}
                  {pkg.packageType === 'MONTHLY' && '/month'}
                  {pkg.packageType === 'ANNUAL' && '/year'}
                </Text>
                {pkg.packageType === 'ANNUAL' && (
                  <Text style={styles.savingsText}>Save 33%!</Text>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Restore & Manage */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={restorePurchases}
          disabled={purchasing}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={openManageSubscriptions}
          disabled={purchasing}
          accessibilityRole="button"
          accessibilityLabel="Manage subscription"
        >
          <Text style={styles.restoreText}>Manage Subscription</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.terms}>
          Subscriptions auto-renew. Manage or cancel anytime in App Store or Google Play settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
