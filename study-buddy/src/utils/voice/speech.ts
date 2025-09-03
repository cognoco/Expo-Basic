import * as Speech from 'expo-speech';
import { getStorageItem } from '@utils/core/storage';

// Rate limiting
let lastSpeechTime = 0;
const MIN_SPEECH_INTERVAL = 1000; // Minimum 1 second between speeches

// Cached settings
let cachedSettings = {
  mainScreenEnabled: true,
  calmModeEnabled: true,
  celebrationEnabled: true,
  rate: 1.0,
  pitch: 1.0,
};

// Load speech settings from storage
export const loadSpeechSettings = async (): Promise<typeof cachedSettings> => {
  try {
    const settings = await getStorageItem('speechSettings');
    if (settings) {
      cachedSettings = JSON.parse(settings);
    }
  } catch (e) {
    console.log('Error loading speech settings:', e);
  }
  return cachedSettings;
};

// Smart speak function with rate limiting and settings respect
export const smartSpeak = async (
  text: string,
  options: {
    screenType?: 'main' | 'calm' | 'celebration';
    forceSpeak?: boolean;
    language?: string;
  } & Partial<Speech.SpeechOptions> = {}
): Promise<void> => {
  const {
    screenType = 'main', // 'main', 'calm', 'celebration'
    forceSpeak = false,  // Override rate limiting for critical messages
    language = 'en',
    ...speechOptions
  } = options;

  // Load latest settings
  await loadSpeechSettings();

  // Check if speech is enabled for this screen
  const screenEnabledMap: Record<'main'|'calm'|'celebration', boolean> = {
    main: cachedSettings.mainScreenEnabled,
    calm: cachedSettings.calmModeEnabled,
    celebration: cachedSettings.celebrationEnabled,
  };
  const enabled = screenEnabledMap[screenType];
  if (!enabled && !forceSpeak) {
    return;
  }

  // Rate limiting
  const now = Date.now();
  if (!forceSpeak && now - lastSpeechTime < MIN_SPEECH_INTERVAL) {
    return;
  }

  // Stop any ongoing speech
  await Speech.stop();

  // Update last speech time
  lastSpeechTime = now;

  // Speak with settings
  // Simple queue: if speaking, wait until finished or timeout
  const speaking = await Speech.isSpeakingAsync();
  if (speaking && !forceSpeak) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  await Speech.speak(text, {
    language,
    rate: cachedSettings.rate,
    pitch: cachedSettings.pitch,
    ...speechOptions
  });
};

// Stop all speech
export const stopSpeech = async (): Promise<void> => {
  await Speech.stop();
};

// Check if speaking
export const isSpeaking = async (): Promise<boolean> => {
  return await Speech.isSpeakingAsync();
};
