import * as Speech from 'expo-speech';
import { smartSpeak } from '@utils/voice/speech';

describe('smartSpeak screen disabled', () => {
  it('does not speak when screen disabled (no force)', async () => {
    const stopSpy = jest.spyOn(Speech, 'stop' as any).mockResolvedValue(undefined as any);
    const speakSpy = jest.spyOn(Speech, 'speak' as any).mockImplementation(() => {} as any);
    // Temporarily mock load settings to disable main screen
    const mod = await import('@utils/voice/speech');
    (mod as any).loadSpeechSettings = async () => ({ mainScreenEnabled: false, calmModeEnabled: true, celebrationEnabled: true, rate: 1, pitch: 1 });
    await smartSpeak('hello', { screenType: 'main' });
    expect(speakSpy).not.toHaveBeenCalled();
    stopSpy.mockRestore();
    speakSpy.mockRestore();
  });
});
