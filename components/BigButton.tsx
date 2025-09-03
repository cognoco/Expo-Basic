import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  getScaledSize,
  TIMING_CONFIG
} from '@utils/config/constants';
import type { AgeGroup } from '@types/index';

type BigButtonProps = { title: string; onPress: () => void; color?: string; style?: StyleProp<ViewStyle>; ageGroup?: AgeGroup };

export default function BigButton({ 
  title, 
  onPress, 
  color = '#4A90E2', 
  style,
  ageGroup = 'elementary'
}: BigButtonProps): JSX.Element {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[
          styles.button, 
          { 
            backgroundColor: color,
            paddingHorizontal: getScaledSize(40, ageGroup, 'spacing'),
            paddingVertical: getScaledSize(20, ageGroup, 'spacing'),
            borderRadius: getScaledSize(40, ageGroup, 'spacing')
          }
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint="Activates this action"
      >
        <Text style={[
          styles.buttonText,
          { fontSize: getScaledSize(24, ageGroup, 'fontSize') }
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  buttonText: {
    fontWeight: '700',
    color: 'white',
  },
});
