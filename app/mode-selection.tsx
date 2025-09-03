import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

export default function ModeSelectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Study Buddy</Text>
        <Text style={styles.subtitle}>Choose Your Mode</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => router.push('/calm-mode')}
          >
            <Text style={styles.modeEmoji}>🧘</Text>
            <Text style={styles.modeTitle}>Calm Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => router.push('/main')}
          >
            <Text style={styles.modeEmoji}>📚</Text>
            <Text style={styles.modeTitle}>Study Mode</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          Basic navigation working - full features will be restored from original Study Buddy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  modeCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    minWidth: 120,
  },
  modeEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
});