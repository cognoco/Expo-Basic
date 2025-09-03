import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { getScaledSize } from '@utils/config/constants';
import { track } from '@utils/analytics';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@types/navigation';
import { t } from '@utils/intl/i18n';

type Props = StackScreenProps<RootStackParamList, 'Consent'>;

export default function ConsentScreen({ navigation, route }: Props) {
  const ageGroup = route.params?.ageGroup || 'elementary';
  const open = (url) => Linking.openURL(url).catch(() => {});
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text accessibilityRole="header" style={styles.title}>Parental Consent</Text>
        <Text style={styles.body}>
          We collect minimal usage data (sessions, basic events) to improve the app. Photos remain on-device. No ads.
        </Text>
        <Text style={styles.link} onPress={() => open('https://example.com/privacy')}>Privacy Policy</Text>
        <Text style={styles.link} onPress={() => open('https://example.com/terms')}>Terms of Service</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => { track('consent_accepted'); navigation.replace('ModeSelection'); }}
          accessibilityRole="button"
          accessibilityLabel="I Agree"
        >
          <Text style={styles.buttonText}>I Agree</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#2C3E50', textAlign: 'center' },
  body: { color: '#2C3E50', textAlign: 'center', marginBottom: 12 },
  link: { color: '#4A90E2', textAlign: 'center', marginBottom: 8, textDecorationLine: 'underline' },
  button: { backgroundColor: '#4A90E2', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});
