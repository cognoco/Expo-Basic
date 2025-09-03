import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getAgeConfig } from '@utils/config/constants';
import type { AgeGroup } from '@types/index';

type ScreenBackgroundProps = { ageGroup?: AgeGroup; children: React.ReactNode };

export default function ScreenBackground({ ageGroup = 'elementary', children }: ScreenBackgroundProps): JSX.Element {
  const config = getAgeConfig(ageGroup);
  const background = config.secondaryColor || '#F0F8FF';
  const accent = config.accentColor || '#4A90E2';
  const primary = config.primaryColor || '#4A90E2';

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Soft blobs for warmth */}
      <View style={[styles.blob, { backgroundColor: primary + '22', top: -80, right: -60, width: 220, height: 220 }]} />
      <View style={[styles.blob, { backgroundColor: accent + '1F', bottom: -60, left: -40, width: 260, height: 260 }]} />
      <View style={[styles.blob, { backgroundColor: '#FFFFFF55', top: 140, left: '20%', width: 140, height: 140 }]} />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
});
