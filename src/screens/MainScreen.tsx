import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  AppState,
  Modal
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { Camera } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import { getStorageItem, setStorageItem } from '@utils/core/storage';
import { smartSpeak, stopSpeech } from '@utils/voice/speech';
import { speakWithBuddy } from '@utils/voice/speakWithBuddy';
import { impact, success as hapticSuccess } from '@utils/feedback';
import { uiAlert } from '@ui/alerts';
import BuddyCharacter from '@components/BuddyCharacter';
import StudyTimer from '@components/StudyTimer';
import CheckInMessage from '@components/CheckInMessage';
import BigButton from '@components/BigButton';
import { 
  getAgeConfig,
  getSubjectsForAge,
  getSubjectCheckIns,
  shouldTriggerSurprise,
  getRandomSurpriseEvent,
  getMysteryMondayChange,
  getCurrentSeasonalTheme,
  getScaledSize,
  TIMING_CONFIG,
  generateParentGate
} from '@utils/config/constants';
import { generatePeerLine } from '@utils/content/peerLines';
import { resolveVoiceForBuddy } from '@utils/voice/voice';
import ScreenBackground from '@components/ScreenBackground';
import { track } from '@utils/analytics';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@types/navigation';
import { getAdaptiveCheckInMinutes, recordInteraction } from '@utils/adaptive';
import { addTokens } from '@utils/rewards';
import { scheduler } from '@utils/scheduler';
import { getStringKey, setStringKey } from '@utils/core/storageKeys';
import { captureError } from '@utils/errors';

const { width, height } = Dimensions.get('window');

type Props = StackScreenProps<RootStackParamList, 'Main'>;

export default function MainScreen({ navigation, route }: Props) {
  const [buddy, setBuddy] = useState<{ id?: string; name?: string; emoji?: string; color?: string; personality?: string } | null>(null);
  const [ageGroup, setAgeGroup] = useState<'young' | 'elementary' | 'tween' | 'teen'>('elementary');
  const [isStudying, setIsStudying] = useState<boolean>(false);
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [totalFocusTime, setTotalFocusTime] = useState<number>(0);
  const [checkInMessage, setCheckInMessage] = useState<string>('');
  const [showCheckIn, setShowCheckIn] = useState<boolean>(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [buddyFaded, setBuddyFaded] = useState<boolean>(false);
  const [workPhoto, setWorkPhoto] = useState<string | null>(null);
  const [showProofMode, setShowProofMode] = useState<boolean>(false);
  const [showInteractionModal, setShowInteractionModal] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<{ id: string; text: string; options: Array<{ label: string; value: string }> } | null>(null);
  const [sessionLog, setSessionLog] = useState<Array<{ time: number; question: string; response: string; timestamp: string }>>([]);
  const [currentSubject, setCurrentSubject] = useState<{ id: string; label: string } | null>(null);
  const [currentSurprise, setCurrentSurprise] = useState<{ id?: string; message: string; emoji: string } | null>(null);
  const [showParentGate, setShowParentGate] = useState<boolean>(false);
  const [parentAnswerInput, setParentAnswerInput] = useState<string>('');
  const [parentGateQA, setParentGateQA] = useState<{ question: string; answer: string }>({ question: '', answer: '' });
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [gateLockedUntil, setGateLockedUntil] = useState<number>(0);
  const [longPressReady, setLongPressReady] = useState<boolean>(false);
  const quickStart = route.params?.quickStart || null;
  
  const timerInterval = useRef<number | null>(null);
  const checkInInterval = useRef<number | null>(null);
  const interactionInterval = useRef<number | null>(null);
  const fadeTimeout = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sessionSaltRef = useRef<string>('');
  const appState = useRef(AppState.currentState);
  const cameraRef = useRef<any>(null);
  const scheduledNotifications = useRef<string[]>([]);

  useEffect(() => {
    loadUserData();
    loadSessionData();
    
    // Get selected subject from navigation if available
    if (route.params?.selectedSubject) {
      setCurrentSubject(route.params.selectedSubject);
      startStudyingWithSubject(route.params.selectedSubject);
    }
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      clearAllIntervals();
      subscription?.remove();
    };
  }, []);

  const clearAllIntervals = () => {
    if (timerInterval.current) scheduler.clearInterval(timerInterval.current as any);
    if (checkInInterval.current) scheduler.clearInterval(checkInInterval.current as any);
    if (interactionInterval.current) scheduler.clearInterval(interactionInterval.current as any);
    if (fadeTimeout.current) scheduler.clearTimeout(fadeTimeout.current as any);
    timerInterval.current = null;
    checkInInterval.current = null;
    interactionInterval.current = null;
    fadeTimeout.current = null;
  };

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      if (isStudying) {
        showEncouragement();
        cancelScheduledCheckIns();
      }
      checkNotificationAction();
    }
    if (nextAppState.match(/inactive|background/) && isStudying) {
      scheduleBackgroundCheckIns();
    }
    appState.current = nextAppState;
  };

  const checkNotificationAction = async () => {
    const action = await getStringKey('lastNotifAction' as any);
    if (!action) return;
    await setStringKey('lastNotifAction' as any, '');
    if (action === 'RESUME') {
      if (!isStudying) {
        const fallbackSubject = currentSubject || getSubjectsForAge(ageGroup)[0] || { id: 'other', label: 'Other' };
        startStudyingWithSubject(fallbackSubject);
      }
    } else if (action === 'BREAK') {
      takeBreak();
    } else if (action === 'DONE') {
      endSession();
    }
  };

  const loadUserData = async () => {
    const buddyData = await getStorageItem('selectedBuddy');
    const age = await getStorageItem('selectedAge');
    if (buddyData) setBuddy(JSON.parse(buddyData));
    if (age) setAgeGroup(age);
  };

  const loadSessionData = async () => {
    const streak = await getStringKey('currentStreak' as any);
    const totalTime = await getStringKey('totalFocusTime' as any);
    if (streak) setCurrentStreak(parseInt(streak));
    if (totalTime) setTotalFocusTime(parseInt(totalTime));
  };

  const startStudyingWithSubject = (subject: { id: string; label: string }) => {
    setCurrentSubject(subject);
    setIsStudying(true);
    setSessionTime(0);
    setBuddyFaded(false);
    setSessionLog([]);
    startTimeRef.current = Date.now();
    sessionSaltRef.current = Math.random().toString(36).slice(2, 10);
    
    const baseConfig = getAgeConfig(ageGroup);
    const sessionLength = quickStart?.workMinutes ? quickStart.workMinutes * 60 : baseConfig.sessionLength;
    const breakDuration = quickStart?.breakMinutes ? quickStart.breakMinutes * 60 : baseConfig.breakDuration;
    
    // Check for special events
    checkForSpecialEvents();
    
    // Setup all timers using configured values
    setupSessionTimers({ ...baseConfig, sessionLength, breakDuration });
    
    // Initial encouragement
    smartSpeak(`Let's work on ${subject.label}! ${config.startMessage}`, {
      screenType: 'main',
      language: 'en'
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    track('session_start', { subjectId: subject.id, ageGroup });
  };

  const setupSessionTimers = (config: { sessionLength: number; breakDuration: number; checkInFrequency: number; interactionFrequency: number }) => {
    // Main timer - compute elapsed to reduce drift
    timerInterval.current = scheduler.setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setSessionTime(elapsed);
      }
    }, 1000);
    
    // Voice check-ins using adaptive frequency per subject
    const adaptiveMinutesPromise = getAdaptiveCheckInMinutes(ageGroup, (currentSubject?.id || 'other'), config.checkInFrequency);
    let checkInTime = config.checkInFrequency * 60 * 1000;
    adaptiveMinutesPromise.then((mins) => {
      checkInTime = mins * 60 * 1000;
      if (checkInInterval.current) {
        scheduler.clearInterval(checkInInterval.current as any);
        checkInInterval.current = scheduler.setInterval(() => {
          if (shouldTriggerSurprise()) {
            showSurpriseEvent();
          } else {
            showCheckInMessage();
          }
        }, checkInTime);
      }
    }).catch(() => {});
    // initial interval until adaptive promise resolves
    checkInInterval.current = scheduler.setInterval(() => {
      if (shouldTriggerSurprise()) {
        showSurpriseEvent();
      } else {
        showCheckInMessage();
      }
    }, checkInTime);
    
    // Two-way interaction using config frequency
    const interactionTime = config.interactionFrequency * 60 * 1000;
    interactionInterval.current = scheduler.setInterval(() => {
      showInteractionPrompt();
    }, interactionTime);
    
    // Buddy fade using configured delay
    fadeTimeout.current = scheduler.setTimeout(() => {
      setBuddyFaded(true);
    }, TIMING_CONFIG.session.buddyFadeDelay);
  };

  const scheduleBackgroundCheckIns = async () => {
    try {
      const config = getAgeConfig(ageGroup);
      const intervalMs = config.checkInFrequency * 60 * 1000;
      // Schedule next 3 check-ins using peer-style generator
      const toSchedule = [1, 2, 3].map(i => ({
        content: {
          title: 'Study Buddy',
          body: generatePeerLine({
            ageGroup,
            buddyPersonality: buddy?.personality,
            subjectId: currentSubject?.id || 'other',
            seconds: sessionTime + Math.floor((intervalMs * i) / 1000),
            sessionLength: getAgeConfig(ageGroup).sessionLength,
            context: 'backgroundReturn',
            sessionId: `${startTimeRef.current || 'default'}:${sessionSaltRef.current || 'salt'}`,
          }).replace(/[^\w\s]/g, ''),
          categoryIdentifier: 'checkin-actions',
        },
        trigger: { seconds: Math.max(5, Math.floor((intervalMs * i) / 1000)) },
      }));
      const ids = [];
      for (const n of toSchedule) {
        const id = await Notifications.scheduleNotificationAsync({ content: n.content, trigger: n.trigger });
        ids.push(id);
      }
      scheduledNotifications.current = ids;
    } catch (e) {
      captureError(e, { screen: 'Main', op: 'scheduleBackgroundCheckIns' });
    }
  };

  const cancelScheduledCheckIns = async () => {
    try {
      for (const id of scheduledNotifications.current) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      scheduledNotifications.current = [];
    } catch (e) {
      captureError(e, { screen: 'Main', op: 'cancelScheduledCheckIns' });
    }
  };

  const checkForSpecialEvents = () => {
    // Mystery Monday check
    const mysteryChange = getMysteryMondayChange();
    if (mysteryChange) {
      Alert.alert('Mystery Monday! 🎭', mysteryChange);
      setCurrentSurprise({ emoji: '🎭', message: mysteryChange });
    }
    
    // Seasonal theme check
    const seasonalTheme = getCurrentSeasonalTheme();
    if (seasonalTheme) {
      console.log(`Seasonal theme: ${seasonalTheme.name} ${seasonalTheme.emoji}`);
    }
  };

  const showSurpriseEvent = () => {
    const surprise = getRandomSurpriseEvent();
    setCurrentSurprise(surprise);
    
    uiAlert(
      `${surprise.emoji} Surprise!`,
      surprise.message,
      [{ text: 'Awesome!', style: 'default' }]
    );
    
    const config = getAgeConfig(ageGroup);
    speakWithBuddy({ buddy, ageGroup, text: surprise.message, options: { screenType: 'main', forceSpeak: true } });
    hapticSuccess();
  };

  const showCheckInMessage = async () => {
    const config = getAgeConfig(ageGroup);
    const line = generatePeerLine({
      ageGroup,
      buddyPersonality: buddy?.personality,
      subjectId: currentSubject?.id || 'other',
      seconds: sessionTime,
      sessionLength: config.sessionLength,
      context: 'tick',
      sessionId: `${startTimeRef.current || 'default'}:${sessionSaltRef.current || 'salt'}`,
    });
    setCheckInMessage(line);
    setShowCheckIn(true);
    setBuddyFaded(false);
    setTimeout(() => setBuddyFaded(true), TIMING_CONFIG.session.checkInDisplay);
    const voice = await resolveVoiceForBuddy({ ageGroup, buddy });
    await smartSpeak(line.replace(/[^\w\s]/gi, ''), {
      screenType: 'main',
      language: voice.language,
      rate: voice.rate,
      pitch: voice.pitch,
      voice: voice.voice,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setShowCheckIn(false), TIMING_CONFIG.session.checkInDisplay);
  };

  const showInteractionPrompt = () => {
    const questions = getInteractionQuestions();
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setShowInteractionModal(true);
    
    // Auto-pause if no response using configured timeout
    setTimeout(() => {
      if (showInteractionModal) {
        pauseSession();
        uiAlert('Timer Paused', 'Tap to continue when ready!');
      }
    }, TIMING_CONFIG.session.modalTimeout);
    
    const config = getAgeConfig(ageGroup);
    speakWithBuddy({ buddy, ageGroup, text: randomQuestion.text });
  };

  const getInteractionQuestions = () => {
    // Dynamic questions based on current subject
    const baseQuestions = [
      {
        id: 'subject',
        text: 'What are you working on?',
        options: getSubjectsForAge(ageGroup).slice(0, 4).map(subject => ({
          label: `${subject.emoji} ${subject.label}`,
          value: subject.id
        }))
      },
      {
        id: 'progress',
        text: 'How much have you finished?',
        options: [
          { label: 'All done! ✅', value: 'complete' },
          { label: 'Most 🔵', value: 'most' },
          { label: 'Half 🟡', value: 'half' },
          { label: 'Just started 🔴', value: 'started' }
        ]
      },
      {
        id: 'difficulty',
        text: "How's it going?",
        options: [
          { label: 'Easy! 😊', value: 'easy' },
          { label: 'OK 😐', value: 'ok' },
          { label: 'Hard 😟', value: 'hard' },
          { label: 'Need help 🆘', value: 'help' }
        ]
      }
    ];
    
    return baseQuestions;
  };

  const handleInteractionResponse = (response) => {
    const logEntry = {
      time: sessionTime,
      question: currentQuestion.id,
      response: response.value,
      timestamp: new Date().toISOString()
    };
    
    setSessionLog([...sessionLog, logEntry]);
    setShowInteractionModal(false);
    // Feed adaptive model
    try { recordInteraction(currentSubject?.id || 'other', response.value); } catch {}
    
    // Handle special responses
    if (response.value === 'help') {
      handleHelpRequest();
    } else {
      provideFeedback(response.value);
    }
  };

  const handleHelpRequest = () => {
    Alert.alert(
      'Need Help?',
      'Should I let your parent know?',
      [
        { text: 'No, I\'ll keep trying', style: 'cancel' },
        { text: 'Yes please', onPress: () => {
          Alert.alert('Help is on the way!', 'Keep trying, someone will check on you soon.');
        }}
      ]
    );
  };

  const provideFeedback = (responseValue) => {
    const encouragements = {
      easy: "Great! Keep crushing it!",
      ok: "Nice steady progress!",
      hard: "You're doing great even though it's tough!",
      complete: "Amazing! You finished!",
      most: "Almost there, fantastic!",
      half: "Halfway is great progress!",
      started: "Good start, keep going!"
    };
    
    if (encouragements[responseValue]) {
      const config = getAgeConfig(ageGroup);
      speakWithBuddy({ buddy, ageGroup, text: encouragements[responseValue] });
    }
  };

  const pauseSession = () => {
    clearAllIntervals();
    setIsStudying(false);
  };

  const takeBreak = () => {
    const config = getAgeConfig(ageGroup);
    
    Alert.alert(
      config.breakTitle,
      config.breakMessage,
      [
        {
          text: "Start Break",
          onPress: () => {
            pauseSession();
            saveSessionData();
            
            // Resume after configured break duration
            setTimeout(() => {
              Alert.alert(
                "Break's Over!",
                "Ready to get back to work?",
                [
                  { text: "5 More Minutes", style: "cancel" },
                  { text: config.resumeButtonText, onPress: () => startStudyingWithSubject(currentSubject) }
                ]
              );
            }, config.breakDuration * 1000); // Already in seconds from config
          }
        },
        {
          text: "Keep Working",
          style: "cancel"
        }
      ]
    );
  };

  const takeWorkPhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setShowProofMode(true);
    } else {
      Alert.alert('Camera Permission', 'We need camera access for one photo of your work (optional)');
    }
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setWorkPhoto(photo.uri);
        setShowProofMode(false);
        await setStringKey('lastWorkPhoto' as any, photo.uri);
        Alert.alert('Great Work!', 'Your completed homework has been saved!');
      } catch (e) {
        captureError(e, { screen: 'Main', op: 'capturePhoto' });
        Alert.alert('Oops', 'Could not capture photo.');
      }
    }
  };

  const endSession = () => {
    const config = getAgeConfig(ageGroup);
    
    // Offer photo for older kids
    if (['tween', 'teen'].includes(ageGroup)) {
      Alert.alert(
        'Show Your Work!',
        'Take a photo of your completed homework?',
        [
          { text: 'Skip', onPress: () => completeSession() },
          { text: 'Take Photo', onPress: () => {
            takeWorkPhoto();
            completeSession();
          }}
        ]
      );
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    pauseSession();
    saveSessionData();
    
    // Award tokens based on effort (scaled by minutes and subject difficulty)
    const minutes = Math.floor(sessionTime / 60);
    const base = minutes >= 25 ? 5 : minutes >= 15 ? 3 : minutes >= 5 ? 1 : 0;
    addTokens(base).catch(() => {});

    navigation.navigate('Celebration', {
      sessionTime: sessionTime,
      totalTime: totalFocusTime + sessionTime,
      streak: currentStreak + 1,
      ageGroup: ageGroup,
      workPhoto: workPhoto,
      sessionLog: sessionLog,
      tokenAward: base
    });
    track('session_end', { duration: sessionTime, ageGroup, subjectId: currentSubject?.id });
  };

  const saveSessionData = async () => {
    const newTotalTime = totalFocusTime + sessionTime;
    const newStreak = currentStreak + 1;
    
    // Save all session data
    const savePromises = [
      setStringKey('totalFocusTime' as any, newTotalTime.toString()),
      setStringKey('currentStreak' as any, newStreak.toString()),
      setStringKey('lastSessionDate' as any, new Date().toISOString()),
      setStringKey('lastSessionLog' as any, JSON.stringify(sessionLog))
    ];
    
    try { await Promise.all(savePromises); } catch (e) { captureError(e, { screen: 'Main', op: 'saveSessionData' }); }
    
    setTotalFocusTime(newTotalTime);
    setCurrentStreak(newStreak);
  };

  const showEncouragement = () => {
    const config = getAgeConfig(ageGroup);
    speakWithBuddy({ buddy, ageGroup, text: config.welcomeBackMessage });
  };

  const openParentSettings = () => {
    // Check if gate is locked
    const now = Date.now();
    if (now < gateLockedUntil) {
      const remainingSeconds = Math.ceil((gateLockedUntil - now) / 1000);
      Alert.alert('Please Wait', `Parent gate is locked for ${remainingSeconds} more seconds`);
      return;
    }
    
    // Try biometric first if available
    LocalAuthentication.hasHardwareAsync().then(async (hasHardware) => {
      if (hasHardware) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (enrolled) {
          const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Parent Access' });
          if (res.success) {
            navigation.navigate('ParentSettings', { sessionLog });
            return;
          }
        }
      }
      // Fallback: PIN if set, otherwise math gate
      const pin = await getStorageItem('parentPin');
      if (pin) {
        setParentGateQA({ question: 'Enter 4-digit PIN', answer: pin });
        setParentAnswerInput('');
        setLongPressReady(false);
        setShowParentGate(true);
      } else {
        const newGate = generateParentGate(getAgeConfig(ageGroup));
        setParentGateQA(newGate);
        setParentAnswerInput('');
        setLongPressReady(false);
        setShowParentGate(true);
      }
    });
  };

  // Camera mode render
  if (showProofMode) {
    return (
      <Camera style={styles.camera} ref={cameraRef}>
        <View style={styles.cameraContainer}>
          <Text style={[
            styles.cameraText,
            { fontSize: getScaledSize(24, ageGroup, 'fontSize') }
          ]}>
            Show your completed work!
          </Text>
          <TouchableOpacity 
            style={[
              styles.captureButton,
              { 
                width: getScaledSize(70, ageGroup, 'buttonScale'),
                height: getScaledSize(70, ageGroup, 'buttonScale'),
                borderRadius: getScaledSize(35, ageGroup, 'buttonScale')
              }
            ]} 
            onPress={capturePhoto}
          >
            <Text style={[
              styles.captureButtonText,
              { fontSize: getScaledSize(40, ageGroup, 'iconSize') }
            ]}>
              📸
            </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    );
  }

  const config = getAgeConfig(ageGroup);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <ScreenBackground ageGroup={ageGroup}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openParentSettings} style={styles.settingsButton} accessibilityRole="button" accessibilityLabel="Parent settings">
            <Text style={[
              styles.settingsIcon,
              { fontSize: getScaledSize(24, ageGroup, 'iconSize') }
            ]}>
              ⚙️
            </Text>
          </TouchableOpacity>
          <View style={[
            styles.streakContainer,
            { backgroundColor: (config.theme?.accent || '#FFF3CD') + '40' }
          ]}>
            <Text style={[
              styles.streakText,
              { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
            ]}>
              🔥 {currentStreak} {config.streakLabel}
            </Text>
          </View>
        </View>

        <BuddyCharacter 
          buddy={buddy} 
          isStudying={isStudying}
          isFaded={buddyFaded}
          ageGroup={ageGroup}
          style={styles.buddyContainer}
        />

        {showCheckIn && (
          <CheckInMessage message={checkInMessage} ageGroup={ageGroup} />
        )}

        {isStudying && (
          <StudyTimer seconds={sessionTime} ageGroup={ageGroup} />
        )}

        <View style={[
          styles.buttonContainer,
          { paddingVertical: getScaledSize(30, ageGroup, 'spacing') }
        ]}>
          {!isStudying ? (
            <BigButton 
              title={config.startButtonText}
              onPress={() => navigation.navigate('ModeSelection')}
              color={config.primaryColor}
              ageGroup={ageGroup}
            />
          ) : (
            <>
              <BigButton 
                title={config.breakButtonText}
                onPress={takeBreak}
                color="#F39C12"
                ageGroup={ageGroup}
              />
              <BigButton 
                title={config.endButtonText}
                onPress={endSession}
                color="#E74C3C"
                ageGroup={ageGroup}
                style={{ marginTop: getScaledSize(20, ageGroup, 'spacing') }}
              />
            </>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Text style={[
            styles.statsText,
            { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
          ]}>
            {config.statsLabel}: {Math.floor(totalFocusTime / 60)} minutes
          </Text>
        </View>
      </View>

      {/* Two-Way Interaction Modal */}
      <Modal
        visible={showInteractionModal}
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
              { fontSize: getScaledSize(24, ageGroup, 'fontSize') }
            ]}>
              {currentQuestion?.text}
            </Text>
            <View style={styles.optionsContainer}>
              {currentQuestion?.options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    { 
                      paddingVertical: getScaledSize(15, ageGroup, 'spacing'),
                      paddingHorizontal: getScaledSize(25, ageGroup, 'spacing'),
                      borderColor: config.accentColor 
                    }
                  ]}
                  onPress={() => handleInteractionResponse(option)}
                >
                  <Text style={[
                    styles.optionText,
                    { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Surprise Event Display */}
      {currentSurprise && (
        <View style={[
          styles.surpriseBanner,
          { 
            padding: getScaledSize(15, ageGroup, 'spacing'),
            top: getScaledSize(100, ageGroup, 'spacing') 
          }
        ]}>
          <Text style={[
            styles.surpriseText,
            { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
          ]}>
            {currentSurprise.emoji} {currentSurprise.message}
          </Text>
        </View>
      )}

      {/* Parent Gate Modal */}
      <Modal
        visible={showParentGate}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { padding: getScaledSize(30, ageGroup, 'spacing') }]}>
            <Text style={[styles.modalTitle, { fontSize: getScaledSize(20, ageGroup, 'fontSize') }]}>Parent Access</Text>
            
            {/* Long Press Instruction */}
            {!longPressReady && (
              <TouchableOpacity
                onLongPress={() => {
                  setLongPressReady(true);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
                delayLongPress={1500}
                style={{
                  backgroundColor: '#E8F4FF',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 15
                }}
              >
                <Text style={{ textAlign: 'center', color: '#4A90E2' }}>
                  Hold this box for 2 seconds to continue
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Question and Input */}
            {longPressReady && (
              <>
                <Text style={{ marginBottom: 10 }}>{parentGateQA.question}</Text>
                <TextInput
                  keyboardType="number-pad"
                  value={parentAnswerInput}
                  onChangeText={setParentAnswerInput}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 10,
                    width: '80%',
                    alignSelf: 'center',
                    textAlign: 'center'
                  }}
                />
                <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'center' }}>
                  <TouchableOpacity
                    style={[styles.optionButton, { paddingHorizontal: 20, paddingVertical: 10, marginRight: 10 }]}
                    onPress={() => {
                      setShowParentGate(false);
                      setWrongAttempts(0);
                    }}
                  >
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, { paddingHorizontal: 20, paddingVertical: 10 }]}
                    onPress={async () => {
                      // If expecting PIN, compare hashed values
                      if (parentGateQA.question === 'Enter 4-digit PIN') {
                        try {
                          const Crypto = await import('expo-crypto');
                          const entered = parentAnswerInput.trim();
                          if (!/^\d{4}$/.test(entered)) {
                            Alert.alert('Try again', 'PIN must be 4 digits.');
                            return;
                          }
                          const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, entered);
                          if (hash === parentGateQA.answer) {
                            setShowParentGate(false);
                            setWrongAttempts(0);
                            navigation.navigate('ParentSettings', { sessionLog });
                          } else {
                            const attempts = wrongAttempts + 1;
                            setWrongAttempts(attempts);
                            if (attempts >= 3) {
                              setGateLockedUntil(Date.now() + 30000);
                              setShowParentGate(false);
                              setWrongAttempts(0);
                              Alert.alert('Gate Locked', 'Too many wrong attempts. Please wait 30 seconds.');
                            } else {
                              Alert.alert('Try again', `Incorrect PIN. ${3 - attempts} attempts remaining.`);
                              setParentAnswerInput('');
                            }
                          }
                        } catch {
                          Alert.alert('Error', 'Unexpected error.');
                        }
                        return;
                      }

                      if (parentAnswerInput.trim() === parentGateQA.answer) {
                        setShowParentGate(false);
                        setWrongAttempts(0);
                        navigation.navigate('ParentSettings', { sessionLog });
                      } else {
                        const attempts = wrongAttempts + 1;
                        setWrongAttempts(attempts);
                        
                        if (attempts >= 3) {
                          // Lock gate for 30 seconds after 3 wrong attempts
                          setGateLockedUntil(Date.now() + 30000);
                          setShowParentGate(false);
                          setWrongAttempts(0);
                          Alert.alert('Gate Locked', 'Too many wrong attempts. Please wait 30 seconds.');
                        } else {
                          Alert.alert('Try again', `Incorrect answer. ${3 - attempts} attempts remaining.`);
                          setParentAnswerInput('');
                        }
                      }
                    }}
                  >
                    <Text>Submit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  settingsButton: {
    padding: 10,
  },
  settingsIcon: {},
  streakContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontWeight: 'bold',
    color: '#856404',
  },
  buddyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {},
  statsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statsText: {
    color: '#7F8C8D',
  },
  camera: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  cameraText: {
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  captureButton: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {},
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
  },
  optionText: {
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  surpriseBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  surpriseText: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});
