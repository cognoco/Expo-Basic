import * as Speech from 'expo-speech';
import { getCurrentLanguage, getLocale } from '@utils/intl/i18n';

// Resolve a voice configuration based on age group and buddy
// Returns: { language, rate, pitch, voice }
export async function resolveVoiceForBuddy({ ageGroup = 'elementary', buddy }: { ageGroup?: 'young' | 'elementary' | 'tween' | 'teen'; buddy?: { personality?: string } }): Promise<{ language: string; rate: number; pitch: number; voice?: string }> {
  // Reasonable defaults per age
  const base = {
    young: { language: 'en-US', rate: 0.9, pitch: 1.2 },
    elementary: { language: 'en-US', rate: 1.0, pitch: 1.1 },
    tween: { language: 'en-US', rate: 1.0, pitch: 1.0 },
    teen: { language: 'en-US', rate: 1.05, pitch: 0.95 },
  }[ageGroup] || { language: 'en-US', rate: 1.0, pitch: 1.0 };

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const userLang = getCurrentLanguage();
    const preferred = voices?.find(v => v.language?.toLowerCase().startsWith(userLang.toLowerCase()));
    const fallback = voices?.find(v => v.language?.startsWith('en'));
    return { ...base, language: preferred?.language || getLocale(), voice: (preferred || fallback)?.identifier };
  } catch {
    return { ...base, language: getLocale(), voice: undefined };
  }
}
