import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { AgeGroup } from '@types/index';
import { useAgeTokens } from '@ui/tokens';

type Props = { children: React.ReactNode; ageGroup?: AgeGroup; style?: any };

export default function ModalFrame({ children, ageGroup = 'elementary', style }: Props) {
  const t = useAgeTokens(ageGroup);
  return (
    <View style={styles.backdrop}>
      <View style={[styles.content, { backgroundColor: t.colors.white, borderRadius: t.radius(20), padding: t.spacing(8) }, style]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { width: '90%', maxWidth: 420, alignItems: 'center' },
});
