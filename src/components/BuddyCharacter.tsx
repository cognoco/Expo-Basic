import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import LottieView from './LottieView';
import { 
  getAgeConfig, 
  getScaledSize,
  TIMING_CONFIG
} from '@utils/config/constants';
import type { AgeGroup, Buddy } from '@types/index';

type BuddyCharacterProps = {
  buddy: Buddy | null;
  isStudying: boolean;
  isFaded: boolean;
  ageGroup?: AgeGroup;
  style?: StyleProp<ViewStyle>;
  customSize?: number | null;
};

export default function BuddyCharacter({ 
  buddy, 
  isStudying, 
  isFaded, 
  ageGroup = 'elementary', 
  style,
  customSize = null 
}: BuddyCharacterProps): JSX.Element | null {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const config = getAgeConfig(ageGroup);
  
  // Calculate buddy size using modular system
  const buddySize = customSize || getScaledSize(config.buddySize || 180, ageGroup, 'buddySize');

  // Fade effect to prevent staring - using configured timing
  useEffect(() => {
    const targetOpacity = isStudying && isFaded ? 0.3 : 1;
    const duration = isStudying && isFaded ? TIMING_CONFIG.animations.fadeIn * 4 : TIMING_CONFIG.animations.fadeIn;
    
    Animated.timing(fadeAnim, {
      toValue: targetOpacity,
      duration,
      useNativeDriver: true,
    }).start();
  }, [isFaded, isStudying]);

  useEffect(() => {
    if (isStudying) {
      startStudyingAnimation();
    } else {
      startIdleAnimation();
    }
    
    return () => {
      scaleAnim.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, [isStudying]);

  const startStudyingAnimation = () => {
    // Gentle breathing animation using configured timing
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: TIMING_CONFIG.animations.breathingIn / 2, // Faster for study mode
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: TIMING_CONFIG.animations.breathingOut / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startIdleAnimation = () => {
    // Gentle idle sway animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  if (!buddy) return null;

  const studyingIndicatorText = getStudyingIndicatorText(ageGroup);
  const fadedMessageText = getFadedMessageText(ageGroup);

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { rotate: isStudying ? '0deg' : spin }
          ]
        }
      ]}
    >
      <View style={[styles.halo, { width: buddySize * 1.2, height: buddySize * 1.2, borderRadius: (buddySize * 1.2) / 2, backgroundColor: (buddy?.color || '#4A90E2') + '26' }]} />
      <View style={[
        styles.buddyCircle, 
        { 
          backgroundColor: buddy.color,
          width: buddySize,
          height: buddySize,
          borderRadius: buddySize / 2,
        }
      ]}>
        <Text style={[
          styles.buddyEmoji, 
          { fontSize: buddySize * 0.44 }
        ]}>
          {buddy.emoji}
        </Text>
      </View>
      
      {isStudying && !isFaded && (
        <View style={[
          styles.studyingIndicator,
          { 
            paddingHorizontal: getScaledSize(20, ageGroup, 'spacing'),
            paddingVertical: getScaledSize(8, ageGroup, 'spacing')
          }
        ]}>
          <Text style={[
            styles.studyingText,
            { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
          ]}>
            {studyingIndicatorText}
          </Text>
        </View>
      )}
      
      {isFaded && (
        <Text style={[
          styles.fadedMessage,
          { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
        ]}>
          {fadedMessageText}
        </Text>
      )}
    </Animated.View>
  );
}

// Helper functions for age-appropriate content
function getStudyingIndicatorText(ageGroup: AgeGroup): string {
  const indicators = {
    young: '📚 Learning...',
    elementary: '📚 Studying...',
    tween: '💻 Working...',
    teen: '📱 Focus'
  };
  return indicators[ageGroup] || indicators.elementary;
}

function getFadedMessageText(ageGroup: AgeGroup): string {
  const messages = {
    young: '👀 Look at your work!',
    elementary: '👀 Eyes on your work!',
    tween: '👀 Stay focused',
    teen: '👀 Focus'
  };
  return messages[ageGroup] || messages.elementary;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  halo: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  buddyCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  buddyEmoji: {
    // Size set dynamically
  },
  studyingIndicator: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  studyingText: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  fadedMessage: {
    position: 'absolute',
    bottom: -30,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});
