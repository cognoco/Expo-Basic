import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export const playSound = async (soundFile: any): Promise<void> => {
  try {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
    
    // Unload sound after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

export const speak = (text: string, options: Partial<Speech.SpeechOptions> = {}): void => {
  const defaultOptions = {
    language: 'en',
    pitch: 1.1,
    rate: 0.9,
    ...options
  };
  
  Speech.speak(text, defaultOptions as any);
};

export const stopSpeaking = (): void => {
  Speech.stop();
};

export const configureSpeech = async (): Promise<any> => {
  // Check if speech is available
  const available = await Speech.getAvailableVoicesAsync();
  return available;
};
