import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  getAgeConfig, 
  getScaledSize 
} from '@utils/config/constants';
import type { AgeGroup } from '@types/index';

type StudyTimerProps = { seconds: number; ageGroup?: AgeGroup };

export default function StudyTimer({ seconds, ageGroup = 'elementary' }: StudyTimerProps): JSX.Element {
  const config = getAgeConfig(ageGroup);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (seconds: number, ageGroup: AgeGroup) => {
    // Age-appropriate color progression
    const colorProgression = {
      young: {
        early: '#27AE60',    // Green - exciting start
        middle: '#F39C12',   // Orange - keep going  
        late: '#E74C3C',     // Red - almost done!
        extended: '#9B59B6'  // Purple - wow!
      },
      elementary: {
        early: '#27AE60',    // Green
        middle: '#F39C12',   // Orange
        late: '#3498DB',     // Blue
        extended: '#9B59B6'  // Purple
      },
      tween: {
        early: '#3498DB',    // Blue - calm start
        middle: '#27AE60',   // Green - in the zone
        late: '#F39C12',     // Orange - pushing through
        extended: '#9B59B6'  // Purple - impressive
      },
      teen: {
        early: '#95A5A6',    // Gray - minimal
        middle: '#3498DB',   // Blue - focused
        late: '#27AE60',     // Green - strong
        extended: '#9B59B6'  // Purple - exceptional
      }
    };
    
    const colors = colorProgression[ageGroup] || colorProgression.elementary;
    
    if (seconds < 300) return colors.early;      // First 5 minutes
    if (seconds < 900) return colors.middle;     // 5-15 minutes  
    if (seconds < 1800) return colors.late;      // 15-30 minutes
    return colors.extended;                      // 30+ minutes
  };

  const getMilestoneMessage = (seconds, ageGroup) => {
    if (seconds % 300 !== 0) return null; // Only show every 5 minutes
    
    const minutes = Math.floor(seconds / 60);
    const milestones = {
      young: `🎉 ${minutes} minutes! You're amazing!`,
      elementary: `🎉 ${minutes} minutes! Great job!`,
      tween: `🔥 ${minutes} minutes! Crushing it!`,
      teen: `💯 ${minutes} minutes. Solid.`
    };
    
    return milestones[ageGroup] || milestones.elementary;
  };

  const timerColor = getTimerColor(seconds, ageGroup);
  const milestoneText = getMilestoneMessage(seconds, ageGroup);

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: timerColor,
        paddingHorizontal: getScaledSize(40, ageGroup, 'spacing'),
        paddingVertical: getScaledSize(20, ageGroup, 'spacing'),
        borderRadius: getScaledSize(25, ageGroup, 'spacing')
      }
    ]}>
      <Text style={[
        styles.label,
        { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
      ]}>
        Focus Time
      </Text>
      <Text style={[
        styles.time,
        { fontSize: getScaledSize(48, ageGroup, 'fontSize') }
      ]}>
        {formatTime(seconds)}
      </Text>
      {milestoneText && (
        <Text style={[
          styles.milestone,
          { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
        ]}>
          {milestoneText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    color: 'white',
    opacity: 0.9,
    marginBottom: 5,
  },
  time: {
    fontWeight: 'bold',
    color: 'white',
  },
  milestone: {
    color: 'white',
    marginTop: 5,
  },
});
