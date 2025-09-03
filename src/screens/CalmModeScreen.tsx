import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { getStorageItem, setStorageItem } from '@utils/core/storage';
import BuddyCharacter from '@components/BuddyCharacter';
import BigButton from '@components/BigButton';
import { 
  getAgeConfig, 
  getScaledSize,
  TIMING_CONFIG
} from '@utils/config/constants';
import ScreenBackground from '@components/ScreenBackground';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@types/navigation';
import { speakWithBuddy } from '@utils/voice/speakWithBuddy';
import { success as hapticSuccess } from '@utils/feedback';
import { uiAlert } from '@ui/alerts';
import { t } from '@utils/intl/i18n';

const { width, height } = Dimensions.get('window');

type Props = StackScreenProps<RootStackParamList, 'CalmMode'>;

export default function CalmModeScreen({ navigation }: Props) {
  const [buddy, setBuddy] = useState(null);
  const [ageGroup, setAgeGroup] = useState('elementary');
  const [isCalming, setIsCalming] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [calmStreak, setCalmStreak] = useState(0);
  
  const breathingAnim = useRef(new Animated.Value(1)).current;
  const [isInhale, setIsInhale] = useState(true);
  const timerInterval = useRef(null);
  const breathingInterval = useRef(null);

  useEffect(() => {
    loadUserData();
    loadCalmData();
    
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (breathingInterval.current) clearInterval(breathingInterval.current);
    };
  }, []);

  const loadUserData = async () => {
    const buddyData = await getStorageItem('selectedBuddy');
    const age = await getStorageItem('selectedAge');
    if (buddyData) setBuddy(JSON.parse(buddyData));
    if (age) setAgeGroup(age);
  };

  const loadCalmData = async () => {
    const streak = await getStorageItem('calmStreak');
    if (streak) setCalmStreak(parseInt(streak));
  };

  const startCalming = () => {
    setIsCalming(true);
    setSessionTime(0);
    setBreathCount(0);
    
    const config = getAgeConfig(ageGroup);
    
    // Start timer - minimum 5 minutes
    timerInterval.current = setInterval(() => {
      setSessionTime(prev => {
        if (prev >= 300) { // 5 minutes minimum
          offerToFinish();
        }
        return prev + 1;
      });
    }, 1000);
    
    // Start breathing exercise with configured timing
    startBreathingExercise();
    
    // Initial calming message based on age
    const calmMessage = getCalmingMessage(config);
    speakWithBuddy({ buddy, ageGroup, text: calmMessage, options: { screenType: 'calm' } });
    hapticSuccess();
  };

  const getCalmingMessage = (config) => {
    const messages = {
      young: "Let's take some big breaths together. You're safe.",
      elementary: "Time to calm down. Breathe with me.",
      tween: "Let's reset. Deep breaths.",
      teen: "Breathing exercise. Follow the circle."
    };
    return messages[ageGroup] || messages.elementary;
  };

  const startBreathingExercise = () => {
    breathingInterval.current = setInterval(() => {
      // Breathe in and out cycle using configured timing
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.5,
          duration: TIMING_CONFIG.animations.breathingIn,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: TIMING_CONFIG.animations.breathingOut,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsInhale(prev => !prev);
      });
      
      setBreathCount(prev => prev + 1);
      
      // Voice guidance every 3 breaths
      if ((breathCount + 1) % 3 === 0) {
        const prompts = getBreathingPrompts(ageGroup);
        const config = getAgeConfig(ageGroup);
        speakWithBuddy({ buddy, ageGroup, text: prompts[(breathCount + 1) % prompts.length], options: { screenType: 'calm' } });
      }
    }, TIMING_CONFIG.session.breathingCycle);
  };

  const getBreathingPrompts = (ageGroup) => {
    const prompts = {
      young: ["Big breath in... and out...", "You're doing great", "Nice and slow", "Feel better"],
      elementary: ["In... and out...", "You're doing great", "Nice and slow", "Feel calmer"],
      tween: ["Breathe in... breathe out...", "Good", "Stay calm", "Reset"],
      teen: ["In... out...", "Focus", "Steady", "Center"]
    };
    return prompts[ageGroup] || prompts.elementary;
  };

  const offerToFinish = () => {
    uiAlert(
      "Feeling Better?",
      "You've been calming for 5 minutes. Ready to stop?",
      [
        { text: "Keep Going", style: "cancel" },
        { text: "I'm Ready", onPress: finishCalming }
      ]
    );
  };

  const finishCalming = () => {
    setIsCalming(false);
    clearInterval(timerInterval.current);
    clearInterval(breathingInterval.current);
    
    saveCalmData();
    
    const finishMessage = getFinishMessage(ageGroup);
    uiAlert(
      "Great Job! 🌟",
      finishMessage,
      [
        { text: "Not Yet", onPress: () => navigation.navigate('ModeSelection') },
        { 
          text: "Tell Parent", 
          onPress: () => {
            uiAlert("Message Sent!", "Someone will check on you soon.");
            navigation.navigate('ModeSelection');
          }
        }
      ]
    );
  };

  const getFinishMessage = (ageGroup) => {
    const messages = {
      young: "You did amazing at calming down! Want to tell someone you're ready?",
      elementary: "You did great at calming down. Want to tell someone you're ready?",
      tween: "Good work calming down. Want to let someone know you're ready?",
      teen: "Well done. Ready to tell someone you're good?"
    };
    return messages[ageGroup] || messages.elementary;
  };

  const saveCalmData = async () => {
    const newStreak = calmStreak + 1;
    const calmLog = {
      duration: sessionTime,
      breathCount: breathCount,
      timestamp: new Date().toISOString()
    };
    
    await Promise.all([
      setStorageItem('calmStreak', newStreak.toString()),
      setStorageItem('lastCalmSession', new Date().toISOString()),
      setStorageItem('lastCalmLog', JSON.stringify(calmLog))
    ]);
  };

  const config = getAgeConfig(ageGroup);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <ScreenBackground ageGroup={ageGroup}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[
              styles.backText,
              { fontSize: getScaledSize(24, ageGroup, 'fontSize') }
            ]}>
              ←
            </Text>
          </TouchableOpacity>
          <View style={[
            styles.streakContainer,
            { backgroundColor: config.accentColor + '20' }
          ]}>
            <Text style={[
              styles.streakText,
              { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
            ]}>
              🧘 {calmStreak} calm sessions
            </Text>
          </View>
        </View>

        {/* Breathing Circle */}
        {isCalming && (
          <Animated.View 
            style={[
              styles.breathingCircle,
              {
                width: getScaledSize(200, ageGroup, 'buddySize'),
                height: getScaledSize(200, ageGroup, 'buddySize'),
                borderRadius: getScaledSize(100, ageGroup, 'buddySize'),
                transform: [{ scale: breathingAnim }]
              }
            ]}
          >
            <Text style={[
              styles.breathText,
              { fontSize: getScaledSize(20, ageGroup, 'fontSize') }
            ]}>
              {isInhale ? 'Breathe In' : 'Breathe Out'}
            </Text>
          </Animated.View>
        )}

        {/* Buddy (smaller and calmer) */}
        {!isCalming && buddy && (
          <View style={styles.buddyContainer}>
            <BuddyCharacter 
              buddy={buddy} 
              isStudying={false}
              isFaded={false}
              ageGroup={ageGroup}
              style={{ transform: [{ scale: 0.7 }] }}
            />
          </View>
        )}

        {/* Timer */}
        {isCalming && (
          <View style={styles.timerContainer}>
            <Text accessibilityRole="header" style={[
              styles.timerText,
              { fontSize: getScaledSize(36, ageGroup, 'fontSize') }
            ]}>
              {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={[
              styles.breathCountText,
              { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
            ]}>
              {breathCount} breaths
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={[
          styles.buttonContainer,
          { paddingVertical: getScaledSize(30, ageGroup, 'spacing') }
        ]}>
          {!isCalming ? (
            <BigButton 
              title="Start Calming 🌊"
              onPress={startCalming}
              color="#2196F3"
              ageGroup={ageGroup}
            />
          ) : (
            <BigButton 
              title="I'm Ready to Talk"
              onPress={finishCalming}
              color="#4CAF50"
              ageGroup={ageGroup}
            />
          )}
        </View>

        {/* Calm Tips */}
        {!isCalming && (
          <View style={styles.tipsContainer}>
            <Text style={[
              styles.tipText,
              { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
            ]}>
              {getCalmTip(ageGroup)}
            </Text>
          </View>
        )}
      </View>
      </ScreenBackground>
    </SafeAreaView>
  );
}

// Helper function for age-appropriate calm tips
function getCalmTip(ageGroup) {
  const tips = {
    young: '💙 It\'s okay to feel big feelings',
    elementary: '💙 Everyone needs to calm down sometimes',
    tween: '💙 Take a moment to reset',
    teen: '💙 Mindfulness helps focus'
  };
  return tips[ageGroup] || tips.elementary;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  backButton: {
    padding: 10,
  },
  backText: {
    color: '#2196F3',
  },
  streakContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontWeight: 'bold',
    color: '#1565C0',
  },
  breathingCircle: {
    backgroundColor: '#64B5F6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  breathText: {
    fontWeight: 'bold',
    color: 'white',
  },
  buddyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerText: {
    fontWeight: 'bold',
    color: '#1565C0',
  },
  breathCountText: {
    color: '#7F8C8D',
    marginTop: 5,
  },
  buttonContainer: {},
  tipsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tipText: {
    color: '#5E92B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
