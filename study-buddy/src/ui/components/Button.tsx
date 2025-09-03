import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { AgeGroup } from '@types/index';
import { useAgeTokens } from '@ui/tokens';

type Props = { title: string; onPress: () => void; ageGroup?: AgeGroup; color?: string; style?: any };

export default function Button({ title, onPress, ageGroup = 'elementary', color, style }: Props) {
  const t = useAgeTokens(ageGroup);
  return (
    <TouchableOpacity style={[styles.btn, { backgroundColor: color || t.colors.primary, borderRadius: t.radius(16), paddingHorizontal: t.spacing(10), paddingVertical: t.spacing(5) }, style]} onPress={onPress} activeOpacity={0.85}>
      <Text style={[styles.txt, { color: t.colors.white, fontSize: t.typography.body * 1.1 }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center' },
  txt: { fontWeight: '700' },
});
