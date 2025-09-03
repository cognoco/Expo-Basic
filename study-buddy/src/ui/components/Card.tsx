import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { AgeGroup } from '@types/index';
import { useAgeTokens } from '@ui/tokens';

type Props = { children: React.ReactNode; ageGroup?: AgeGroup; style?: any };

export default function Card({ children, ageGroup = 'elementary', style }: Props) {
  const t = useAgeTokens(ageGroup);
  return (
    <View style={[styles.card, { backgroundColor: t.colors.white, borderRadius: t.radius(16), padding: t.spacing(6), shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 5 }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ card: {} });
