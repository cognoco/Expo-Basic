import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { setStorageItem } from '@utils/core/storage';
import { getBuddiesForAge } from '@assets/animations/buddy-animations';
import { 
  AGE_CONFIGS, 
  getAgeConfig, 
  getResponsiveValue, 
  getScaledSize,
  UI_SCALING_CONFIG,
  TIMING_CONFIG
} from '@utils/config/constants';
import { track } from '@utils/analytics';
import { speakWithBuddy } from '@utils/voice/speakWithBuddy';
import { impact } from '@utils/feedback';
import { uiAlert } from '@ui/alerts';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@types/navigation';
import { getBalance, getRewardsCatalog } from '@utils/rewards';
import { t } from '@utils/intl/i18n';

type Props = StackScreenProps<RootStackParamList, 'Onboarding'>;

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: Props) {
  const [selectedAge, setSelectedAge] = useState<'young' | 'elementary' | 'tween' | 'teen' | null>(null);
  const [selectedBuddy, setSelectedBuddy] = useState<{ id: string; name: string; emoji: string; color: string; personality?: string } | null>(null);
  const [childName, setChildName] = useState<string>('');
  const [recording, setRecording] = useState<import('expo-av').Audio.Recording | null>(null);
  const [step, setStep] = useState<'chooseAge' | 'chooseBuddy' | 'recordName' | 'ready'>('chooseAge');

  const selectAge = (ageGroup) => {
    setSelectedAge(ageGroup);
    setStep('chooseBuddy');
  };

  const selectBuddy = (buddy) => {
    setSelectedBuddy(buddy);
    const config = getAgeConfig(selectedAge);
    
    speakWithBuddy({ buddy, ageGroup: selectedAge, text: `Great choice! I'm ${buddy.name} and I'm excited to study with you!` });
    
    setTimeout(() => setStep('recordName'), TIMING_CONFIG.animations.fadeIn * 4);
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      uiAlert('Oops!', 'Could not start recording. You can set this up later!');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    await setStorageItem('childNameRecording', uri);
    setStep('ready');
    
    const config = getAgeConfig(selectedAge);
    speakWithBuddy({ buddy: selectedBuddy, ageGroup: selectedAge, text: config.completionMessage });
  };

  const completeOnboarding = async () => {
    await setStorageItem('hasLaunched', 'true');
    await setStorageItem('selectedAge', selectedAge);
    await setStorageItem('selectedBuddy', JSON.stringify(selectedBuddy));
    await setStorageItem('childName', childName || 'Buddy');
    track('onboarding_complete', { ageGroup: selectedAge, buddyId: selectedBuddy?.id });
    navigation.replace('Consent');
  };

  const renderChooseAge = () => {
    const ageGroups = Object.entries(AGE_CONFIGS);
    
    return (
      <View style={styles.container}>
        <Text accessibilityRole="header" style={[styles.title, getResponsiveStyles('title')]}> 
          {t('howOldIsYourChild')}
        </Text>
        <Text style={[styles.subtitle, getResponsiveStyles('subtitle')]}> 
          {t('weWillCustomize')}
        </Text>
        
        <View style={styles.ageContainer}>
          {ageGroups.map(([ageKey, config]) => (
            <TouchableOpacity
              key={ageKey}
              style={[styles.ageCard, getAgeCardStyle(ageKey)]}
              onPress={() => selectAge(ageKey)}
            >
              <Text style={[styles.ageEmoji, getResponsiveStyles('ageEmoji')]}>
                {getAgeEmoji(ageKey)}
              </Text>
              <Text style={[styles.ageTitle, getResponsiveStyles('ageTitle')]}>
                {getAgeTitle(ageKey)}
              </Text>
              <Text style={[styles.ageRange, getResponsiveStyles('ageRange')]}>
                Ages {config.displayRange || config.ageRange}
              </Text>
              <Text style={[styles.ageDescription, getResponsiveStyles('ageDescription')]}>
                {getAgeDescription(ageKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderChooseBuddy = () => {
    const buddies = selectedAge ? getBuddiesForAge(selectedAge) : [];
    const config = getAgeConfig(selectedAge);
    
    return (
      <View style={styles.container}>
        <Text style={[styles.title, getResponsiveStyles('title')]}>
          {config.buddySelectionTitle}
        </Text>
        <Text style={[styles.subtitle, getResponsiveStyles('subtitle')]}>
          {config.buddySelectionSubtitle}
        </Text>
        
        <View style={styles.buddyContainer}>
          {buddies.map((buddy) => (
            <TouchableOpacity
              key={buddy.id}
              style={[
                styles.buddyCard, 
                selectedBuddy?.id === buddy.id && styles.selectedBuddy,
                getResponsiveStyles('buddyCard')
              ]}
              onPress={() => selectBuddy(buddy)}
            >
              <View style={[
                styles.buddyAvatar, 
                { backgroundColor: buddy.color },
                getResponsiveStyles('buddyAvatar')
              ]}>
                <Text style={[styles.buddyEmoji, getResponsiveStyles('buddyEmoji')]}>
                  {buddy.emoji}
                </Text>
              </View>
              <Text style={[styles.buddyName, getResponsiveStyles('buddyName')]}>
                {buddy.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderRecordName = () => {
    const config = getAgeConfig(selectedAge);
    
    return (
      <View style={styles.container}>
        <View style={[
          styles.bigBuddyAvatar, 
          { backgroundColor: selectedBuddy?.color },
          getResponsiveStyles('bigBuddyAvatar')
        ]}>
          <Text style={[styles.bigBuddyEmoji, getResponsiveStyles('bigBuddyEmoji')]}>
            {selectedBuddy?.emoji}
          </Text>
        </View>
        
        <Text accessibilityRole="header" style={[styles.title, getResponsiveStyles('title')]}>{t('whatsYourName')}</Text>
        <Text style={[styles.subtitle, getResponsiveStyles('subtitle')]}>{config.namePrompt}</Text>
        
        <TouchableOpacity
          style={[
            styles.recordButton, 
            recording && styles.recordingActive,
            getResponsiveStyles('recordButton')
          ]}
          testID="record-button"
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <Text style={[styles.recordButtonText, getResponsiveStyles('recordButtonText')]}> 
            {recording ? `🎙️ ${t('recording')}` : `🎤 ${t('holdToRecord')}`}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={() => setStep('ready')} accessibilityRole="button" accessibilityLabel={t('skipForNow')}>
          <Text style={styles.skipText}>{t('skipForNow')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReady = () => {
    const config = getAgeConfig(selectedAge);
    
    return (
      <View style={styles.container}>
        <View style={[
          styles.bigBuddyAvatar, 
          { backgroundColor: selectedBuddy?.color },
          getResponsiveStyles('bigBuddyAvatar')
        ]}>
          <Text style={[styles.bigBuddyEmoji, getResponsiveStyles('bigBuddyEmoji')]}>
            {selectedBuddy?.emoji}
          </Text>
        </View>
        
        <Text accessibilityRole="header" style={[styles.title, getResponsiveStyles('title')]}>{t('weAreReady')}</Text>
        <Text style={[styles.subtitle, getResponsiveStyles('subtitle')]}>
          {selectedBuddy?.name} is {config.readyMessage}
        </Text>
        
        <TouchableOpacity
          style={[styles.startButton, getResponsiveStyles('startButton')]}
          onPress={completeOnboarding}
        >
          <Text style={[styles.startButtonText, getResponsiveStyles('startButtonText')]}>
            {config.startButtonText}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Helper functions for age-specific content
  const getAgeEmoji = (ageKey) => {
    const emojis = { young: '🧸', elementary: '📚', tween: '🎮', teen: '💪' };
    return emojis[ageKey] || '📚';
  };

  const getAgeTitle = (ageKey) => {
    const titles = { young: 'Little Learner', elementary: 'Elementary', tween: 'Tween', teen: 'Teen' };
    return titles[ageKey] || 'Elementary';
  };

  const getAgeDescription = (ageKey) => {
    const descriptions = { 
      young: 'Big celebrations, short sessions', 
      elementary: 'Balanced support & fun',
      tween: 'Cool & independent',
      teen: 'Minimal & focused'
    };
    return descriptions[ageKey] || 'Balanced support & fun';
  };

  const getAgeCardStyle = (ageKey) => {
    const config = getAgeConfig(ageKey);
    return { borderColor: config.primaryColor, borderWidth: 2 };
  };

  const getResponsiveStyles = (component) => {
    const scaling = selectedAge ? UI_SCALING_CONFIG.ageScaling[selectedAge] : UI_SCALING_CONFIG.ageScaling.elementary;
    
    return getResponsiveValue({
      small: getComponentStyle(component, scaling, 0.9),
      medium: getComponentStyle(component, scaling, 1.0),
      large: getComponentStyle(component, scaling, 1.1),
      xlarge: getComponentStyle(component, scaling, 1.2)
    });
  };

  const getComponentStyle = (component, scaling, screenScale) => {
    const baseStyles = {
      title: { fontSize: 32 * scaling.fontSize * screenScale },
      subtitle: { fontSize: 18 * scaling.fontSize * screenScale },
      ageEmoji: { fontSize: 40 * scaling.iconSize * screenScale },
      ageTitle: { fontSize: 18 * scaling.fontSize * screenScale },
      ageRange: { fontSize: 14 * scaling.fontSize * screenScale },
      ageDescription: { fontSize: 12 * scaling.fontSize * screenScale },
      buddyCard: { padding: 15 * scaling.spacing * screenScale },
      buddyAvatar: { 
        width: 80 * scaling.buddySize * screenScale, 
        height: 80 * scaling.buddySize * screenScale,
        borderRadius: 40 * scaling.buddySize * screenScale 
      },
      buddyEmoji: { fontSize: 40 * scaling.iconSize * screenScale },
      buddyName: { fontSize: 16 * scaling.fontSize * screenScale },
      bigBuddyAvatar: { 
        width: 150 * scaling.buddySize * screenScale, 
        height: 150 * scaling.buddySize * screenScale,
        borderRadius: 75 * scaling.buddySize * screenScale 
      },
      bigBuddyEmoji: { fontSize: 70 * scaling.iconSize * screenScale },
      recordButton: { 
        paddingHorizontal: 40 * scaling.spacing * screenScale,
        paddingVertical: 20 * scaling.spacing * screenScale 
      },
      recordButtonText: { fontSize: 20 * scaling.fontSize * screenScale },
      startButton: { 
        paddingHorizontal: 60 * scaling.spacing * screenScale,
        paddingVertical: 20 * scaling.spacing * screenScale 
      },
      startButtonText: { fontSize: 24 * scaling.fontSize * screenScale }
    };
    
    return baseStyles[component] || {};
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {step === 'chooseAge' && renderChooseAge()}
      {step === 'chooseBuddy' && renderChooseBuddy()}
      {step === 'recordName' && renderRecordName()}
      {step === 'ready' && renderReady()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#7F8C8D',
    marginBottom: 40,
    textAlign: 'center',
  },
  ageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  ageCard: {
    width: '45%',
    margin: '2.5%',
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  ageEmoji: {
    marginBottom: 10,
  },
  ageTitle: {
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  ageRange: {
    color: '#7F8C8D',
    marginBottom: 5,
  },
  ageDescription: {
    color: '#95A5A6',
    textAlign: 'center',
  },
  buddyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  buddyCard: {
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedBuddy: {
    transform: [{ scale: 1.1 }],
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  buddyAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buddyEmoji: {},
  buddyName: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  bigBuddyAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  bigBuddyEmoji: {},
  recordButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 30,
    marginTop: 20,
  },
  recordingActive: {
    backgroundColor: '#C0392B',
    transform: [{ scale: 1.05 }],
  },
  recordButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    color: '#7F8C8D',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#27AE60',
    borderRadius: 30,
    marginTop: 40,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
