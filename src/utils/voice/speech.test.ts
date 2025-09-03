import * as Speech from 'expo-speech';
import { smartSpeak } from './speech';

describe('smartSpeak', () => {
  it('rate-limits rapid calls when not forced', async () => {
    const stopSpy = jest.spyOn(Speech, 'stop' as any).mockResolvedValue(undefined as any);
    const speakSpy = jest.spyOn(Speech, 'speak' as any).mockImplementation(() => {} as any);
    const isSpeakingSpy = jest.spyOn(Speech, 'isSpeakingAsync' as any).mockResolvedValue(false as any);

    await smartSpeak('one');
    await smartSpeak('two'); // within MIN_SPEECH_INTERVAL, should be dropped

    expect(speakSpy).toHaveBeenCalledTimes(1);

    stopSpy.mockRestore();
    speakSpy.mockRestore();
    isSpeakingSpy.mockRestore();
  });

  it('forceSpeak bypasses rate limiting', async () => {
    const stopSpy = jest.spyOn(Speech, 'stop' as any).mockResolvedValue(undefined as any);
    const speakSpy = jest.spyOn(Speech, 'speak' as any).mockImplementation(() => {} as any);
    const isSpeakingSpy = jest.spyOn(Speech, 'isSpeakingAsync' as any).mockResolvedValue(false as any);

    await smartSpeak('one');
    await smartSpeak('two', { forceSpeak: true });

    expect(speakSpy).toHaveBeenCalledTimes(2);

    stopSpy.mockRestore();
    speakSpy.mockRestore();
    isSpeakingSpy.mockRestore();
  });
});
