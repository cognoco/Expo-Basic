import { smartSpeak } from '@utils/voice/speech';
import { resolveVoiceForBuddy } from '@utils/voice/voice';

type SpeakOptions = {
  screenType?: 'main' | 'calm' | 'celebration';
  forceSpeak?: boolean;
  language?: string;
};

export async function speakWithBuddy({
  buddy,
  ageGroup = 'elementary',
  text,
  options = {},
}: {
  buddy?: { personality?: string } | null;
  ageGroup?: 'young' | 'elementary' | 'tween' | 'teen';
  text: string;
  options?: SpeakOptions;
}): Promise<void> {
  const voice = await resolveVoiceForBuddy({ ageGroup, buddy: buddy || undefined });
  await smartSpeak(text, {
    screenType: options.screenType || 'main',
    forceSpeak: options.forceSpeak,
    language: voice.language,
    rate: voice.rate,
    pitch: voice.pitch,
    voice: voice.voice,
  });
}
