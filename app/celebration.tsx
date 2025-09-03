import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder for CelebrationScreen - will be migrated from study-buddy/src/screens/CelebrationScreen.tsx
export default function CelebrationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Celebration!</Text>
      <Text style={styles.subtitle}>Celebration Screen</Text>
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