import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Share,
  Modal
} from 'react-native';
import LottieView from '../components/LottieView';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { setStorageItem, getStorageItem } from '@utils/core/storage';
import { 
  getAgeConfig, 
  getScaledSize,
  TIMING_CONFIG
} from '@utils/config/constants';
import ScreenBackground from '@components/ScreenBackground';
import { SubscriptionContext } from '@context/SubscriptionContext';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@types/navigation';
import { getAppConfig } from '@config/appConfig';
import { uiAlert } from '@ui/alerts';
import { speakWithBuddy } from '@utils/voice/speakWithBuddy';
import { success as hapticSuccess } from '@utils/feedback';
import { getBalance } from '@utils/rewards';
import { getAnimation } from '@assets/registry';

const { width, height } = Dimensions.get('window');

type Props = StackScreenProps<RootStackParamList, 'Celebration'>;

export default function CelebrationScreen({ navigation, route }: Props) {
  const { sessionTime, totalTime, streak, ageGroup, workPhoto, sessionLog, tokenAward } = route.params;
  const animationRef = useRef(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [whatWorked, setWhatWorked] = useState([]);
  const { isPremium } = useContext(SubscriptionContext);
  const [showAward, setShowAward] = useState(!!tokenAward && tokenAward > 0);

  useEffect(() => {
    celebrate();
    checkForPaywall();
    // Show feedback modal after configured delay
    setTimeout(() => setShowFeedback(true), TIMING_CONFIG.animations.celebrationDisplay);
    // Refresh balance for UI (optional future use)
    getBalance().catch(() => {});
  }, []);

  const checkForPaywall = async () => {
    if (!isPremium) {
      const sessionsCount = await getStorageItem('sessionsCount');
      const count = sessionsCount ? parseInt(sessionsCount) + 1 : 1;
      await setStorageItem('sessionsCount', count.toString());
      
      // Remote-configurable threshold
      const cfg = getAppConfig();
      const threshold = cfg.remote?.paywall?.sessionsTillPaywall ?? 3;
      if (count === threshold) {
        setTimeout(() => {
          navigation.navigate('Paywall', { ageGroup });
        }, 3000); // Show after celebration
      }
    }
  };

  const celebrate = () => {
    const config = getAgeConfig(ageGroup);
    const celebrationMessage = getCelebrationMessage(ageGroup, sessionTime);
    
    // Play celebration sound
    speakWithBuddy({ buddy: undefined, ageGroup, text: celebrationMessage, options: { screenType: 'celebration' } });
    
    // Haptic feedback
    hapticSuccess();
    
    // Play animation
    if (animationRef.current) {
      animationRef.current.play();
    }
  };

  const getCelebrationMessage = (ageGroup, sessionTime) => {
    const timeQuality = getTimeQuality(sessionTime);
    
    const messages = {
      young: {
        excellent: "WOW! You're AMAZING! Super duper job!",
        good: "Yay! You did it! I'm so proud!",
        okay: "Great job! You're learning so well!"
      },
      elementary: {
        excellent: "Amazing job! You did it! I'm so proud of you!",
        good: "Excellent work! You stayed focused so well!",
        okay: "Great job! You're building strong study habits!"
      },
      tween: {
        excellent: "Incredible focus! You crushed it!",
        good: "Solid work! Nice focus.",
        okay: "Good session. Keep it up."
      },
      teen: {
        excellent: "Outstanding work. Impressive focus.",
        good: "Good session. Well done.",
        okay: "Decent work. Progress made."
      }
    };
    
    return messages[ageGroup]?.[timeQuality] || messages.elementary.okay;
  };

  const getTimeQuality = (sessionTime) => {
    if (sessionTime >= 1800) return 'excellent'; // 30+ minutes
    if (sessionTime >= 900) return 'good';      // 15+ minutes
    return 'okay';                              // Under 15 minutes
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareSuccess = async () => {
    const config = getAgeConfig(ageGroup);
    const shareMessage = getShareMessage(ageGroup, sessionTime, streak);
    
    try {
      await Share.share({ message: shareMessage });
    } catch (error) {
      console.log(error);
    }
  };

  const getShareMessage = (ageGroup, sessionTime, streak) => {
    const minutes = Math.floor(sessionTime / 60);
    const baseMessage = `🎉 My child just completed ${minutes} minutes of focused study time with Study Buddy! ${streak} day streak! 🔥`;
    
    const ageSpecificAdditions = {
      young: ' They\'re such a superstar! ⭐',
      elementary: ' So proud of their focus! 📚',
      tween: ' Building great study habits! 💪',
      teen: ' Excellent self-discipline! 🎯'
    };
    
    return baseMessage + (ageSpecificAdditions[ageGroup] || '');
  };

  const getAchievementBadge = (sessionTime, ageGroup) => {
    // Age-appropriate achievement thresholds
    const thresholds = {
      young: { gold: 600, silver: 300, bronze: 180 },      // 10, 5, 3 minutes
      elementary: { gold: 1200, silver: 600, bronze: 300 }, // 20, 10, 5 minutes  
      tween: { gold: 1500, silver: 900, bronze: 600 },     // 25, 15, 10 minutes
      teen: { gold: 1800, silver: 1200, bronze: 900 }      // 30, 20, 15 minutes
    };
    
    const t = thresholds[ageGroup] || thresholds.elementary;
    
    if (sessionTime >= t.gold) return '🏆';
    if (sessionTime >= t.silver) return '🥇';
    if (sessionTime >= t.bronze) return '🥈';
    return '🥉';
  };

  const getEncouragementMessage = (sessionTime, ageGroup) => {
    const timeQuality = getTimeQuality(sessionTime);
    
    const messages = {
      young: {
        excellent: "Incredible focus! You're a study champion!",
        good: "Amazing work! You stayed focused so well!",
        okay: "Great job! Every minute counts!"
      },
      elementary: {
        excellent: "Incredible focus! You're a study champion!",
        good: "Amazing work! You stayed focused so well!",
        okay: "Great job! You're building strong study habits!"
      },
      tween: {
        excellent: "Outstanding focus! You're on fire!",
        good: "Great work! Your focus is getting stronger!",
        okay: "Good start! Building those focus muscles!"
      },
      teen: {
        excellent: "Exceptional focus. You're developing real discipline.",
        good: "Solid session. Your concentration is improving.",
        okay: "Good work. Consistency is key."
      }
    };
    
    return messages[ageGroup]?.[timeQuality] || messages.elementary.okay;
  };

  const handleWhatWorked = async (item) => {
    const newWhatWorked = whatWorked.includes(item) 
      ? whatWorked.filter(i => i !== item)
      : [...whatWorked, item];
    
    setWhatWorked(newWhatWorked);
  };

  const saveFeedback = async () => {
    const feedbackData = {
      whatWorked: whatWorked,
      sessionTime: sessionTime,
      ageGroup: ageGroup,
      timestamp: new Date().toISOString()
    };
    
    const existingFeedback = await getStorageItem('feedbackHistory');
    const history = existingFeedback ? JSON.parse(existingFeedback) : [];
    history.push(feedbackData);
    
    // Keep only last 30 sessions for performance
    if (history.length > 30) {
      history.shift();
    }
    
    await setStorageItem('feedbackHistory', JSON.stringify(history));
    setShowFeedback(false);
    
    navigation.navigate('ModeSelection');
  };

  const config = getAgeConfig(ageGroup);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <ScreenBackground ageGroup={ageGroup}>
      <View style={styles.container}>
        {/* Celebration Animation */}
        <View style={[
          styles.animationContainer,
          { height: getScaledSize(200, ageGroup, 'spacing') }
        ]}>
          <Text style={[
            styles.trophy,
            { fontSize: getScaledSize(100, ageGroup, 'iconSize') }
          ]}>
            {getAchievementBadge(sessionTime, ageGroup)}
          </Text>
          <LottieView
            ref={animationRef}
            source={getAnimation('confetti')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          {showAward && (
            <View style={{ position: 'absolute', bottom: -10, backgroundColor: '#FFD700', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: '#2C3E50', fontWeight: 'bold' }}>+{tokenAward} tokens 🎟️</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={[
            styles.title,
            { 
              fontSize: getScaledSize(32, ageGroup, 'fontSize'),
              color: config.primaryColor 
            }
          ]}>
            Amazing Job! 🎉
          </Text>
          <Text style={[
            styles.message,
            { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
          ]}>
            {getEncouragementMessage(sessionTime, ageGroup)}
          </Text>
          
          {/* Dynamic stat boxes */}
          {[
            { label: "Today's Focus Time", value: formatTime(sessionTime) },
            { label: "Current Streak", value: `🔥 ${streak} days` },
            { label: "Total Focus Time", value: `${Math.floor(totalTime / 60)} minutes` }
          ].map((stat, index) => (
            <View key={index} style={[
              styles.statBox,
              { 
                paddingHorizontal: getScaledSize(30, ageGroup, 'spacing'),
                paddingVertical: getScaledSize(15, ageGroup, 'spacing'),
                minWidth: width * 0.7 
              }
            ]}>
              <Text style={[
                styles.statLabel,
                { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
              ]}>
                {stat.label}
              </Text>
              <Text style={[
                styles.statValue,
                { fontSize: getScaledSize(24, ageGroup, 'fontSize') }
              ]}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={[
          styles.buttonContainer,
          { paddingHorizontal: getScaledSize(20, ageGroup, 'spacing') }
        ]}>
          <TouchableOpacity 
            style={[
              styles.shareButton,
              { 
                padding: getScaledSize(15, ageGroup, 'spacing'),
                marginBottom: getScaledSize(15, ageGroup, 'spacing')
              }
            ]} 
            onPress={shareSuccess}
            accessibilityRole="button"
            accessibilityLabel={t('shareSuccess')}
          >
            <Text style={[
              styles.shareButtonText,
              { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
            ]}>
              {t('shareSuccess')} 📤
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.doneButton,
              { 
                padding: getScaledSize(15, ageGroup, 'spacing'),
                backgroundColor: config.primaryColor 
              }
            ]} 
            onPress={() => setShowFeedback(true)}
            accessibilityRole="button"
            accessibilityLabel={t('continue')}
          >
            <Text style={[
              styles.doneButtonText,
              { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
            ]}>
              {t('continue')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* What Worked Feedback Modal */}
      <Modal
        visible={showFeedback}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={[
            styles.modalContent,
            { padding: getScaledSize(30, ageGroup, 'spacing') }
          ]}>
            <Text style={[
              styles.modalTitle,
              { fontSize: getScaledSize(20, ageGroup, 'fontSize') }
            ]}>
              What helped you today?
            </Text>
            <Text style={[
              styles.modalSubtitle,
              { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
            ]}>
              Pick all that helped!
            </Text>
            
            <View style={styles.feedbackContainer}>
              {[
                { id: 'buddy', emoji: '🤖', label: 'Buddy' },
                { id: 'timer', emoji: '⏰', label: 'Timer' },
                { id: 'checkins', emoji: '💬', label: 'Check-ins' },
                { id: 'breaks', emoji: '🌟', label: 'Breaks' }
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.feedbackButton,
                    whatWorked.includes(item.id) && [
                      styles.feedbackSelected,
                      { borderColor: config.accentColor }
                    ],
                    { 
                      padding: getScaledSize(15, ageGroup, 'spacing'),
                      minWidth: getScaledSize(80, ageGroup, 'spacing')
                    }
                  ]}
                  onPress={() => handleWhatWorked(item.id)}
                >
                  <Text style={[
                    styles.feedbackEmoji,
                    { fontSize: getScaledSize(30, ageGroup, 'iconSize') }
                  ]}>
                    {item.emoji}
                  </Text>
                  <Text style={[
                    styles.feedbackText,
                    { fontSize: getScaledSize(12, ageGroup, 'fontSize') }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[
              styles.modalTitle,
              { fontSize: getScaledSize(20, ageGroup, 'fontSize') }
            ]}>
              How do you feel?
            </Text>
            
            <View style={styles.feelingContainer}>
              {[
                { id: 'great', emoji: '😊', label: 'Great!' },
                { id: 'good', emoji: '🙂', label: 'Good' },
                { id: 'ok', emoji: '😐', label: 'OK' },
                { id: 'tired', emoji: '😴', label: 'Tired' }
              ].map((feeling) => (
                <TouchableOpacity
                  key={feeling.id}
                  style={[
                    styles.feelingButton,
                    { padding: getScaledSize(10, ageGroup, 'spacing') }
                  ]}
                  onPress={saveFeedback}
                >
                  <Text style={[
                    styles.feelingEmoji,
                    { fontSize: getScaledSize(35, ageGroup, 'iconSize') }
                  ]}>
                    {feeling.emoji}
                  </Text>
                  <Text style={[
                    styles.feelingText,
                    { fontSize: getScaledSize(12, ageGroup, 'fontSize') }
                  ]}>
                    {feeling.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.skipButton,
                { padding: getScaledSize(10, ageGroup, 'spacing') }
              ]}
              onPress={() => {
                setShowFeedback(false);
                navigation.navigate('ModeSelection');
              }}
            >
              <Text style={[
                styles.skipText,
                { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
              ]}>
                Skip
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  trophy: {
    position: 'absolute',
    zIndex: 1,
  },
  lottie: {
    width: width,
    height: 200,
    position: 'absolute',
  },
  statsContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statLabel: {
    color: '#7F8C8D',
    marginBottom: 5,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  buttonContainer: {
    width: '100%',
  },
  shareButton: {
    backgroundColor: '#3498DB',
    borderRadius: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  doneButton: {
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    marginTop: 20,
  },
  modalSubtitle: {
    color: '#7F8C8D',
    marginBottom: 20,
  },
  feedbackContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  feedbackButton: {
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    margin: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  feedbackSelected: {
    backgroundColor: '#E3F2FD',
  },
  feedbackEmoji: {
    marginBottom: 5,
  },
  feedbackText: {
    color: '#2C3E50',
  },
  feelingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  feelingButton: {
    alignItems: 'center',
  },
  feelingEmoji: {
    marginBottom: 5,
  },
  feelingText: {
    color: '#2C3E50',
  },
  skipButton: {
    marginTop: 10,
  },
  skipText: {
    color: '#7F8C8D',
  },
});
