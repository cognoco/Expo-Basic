import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder for OnboardingScreen - will be migrated from study-buddy/src/screens/OnboardingScreen.tsx
export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Buddy</Text>
      <Text style={styles.subtitle}>Onboarding Screen</Text>
      <Text style={styles.note}>Content will be migrated from Study Buddy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});