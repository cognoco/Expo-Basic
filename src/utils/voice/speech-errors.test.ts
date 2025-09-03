import * as Speech from 'expo-speech';
import { smartSpeak } from '@utils/voice/speech';

describe('smartSpeak error paths', () => {
  it('survives isSpeakingAsync rejection', async () => {
    const stopSpy = jest.spyOn(Speech, 'stop' as any).mockResolvedValue(undefined as any);
    const speakSpy = jest.spyOn(Speech, 'speak' as any).mockImplementation(() => {} as any);
    const isSpeakingSpy = jest.spyOn(Speech, 'isSpeakingAsync' as any).mockRejectedValueOnce(new Error('fail'));
    await expect(smartSpeak('hello', { forceSpeak: true })).resolves.toBeUndefined();
    stopSpy.mockRestore();
    speakSpy.mockRestore();
    isSpeakingSpy.mockRestore();
  });

  it('survives stop/speak rejections', async () => {
    const stopSpy = jest.spyOn(Speech, 'stop' as any).mockRejectedValueOnce(new Error('fail'));
    const speakSpy = jest.spyOn(Speech, 'speak' as any).mockImplementation(() => { throw new Error('speak-fail'); });
    const isSpeakingSpy = jest.spyOn(Speech, 'isSpeakingAsync' as any).mockResolvedValue(false as any);
    await expect(smartSpeak('hello', { forceSpeak: true })).resolves.toBeUndefined();
    stopSpy.mockRestore();
    speakSpy.mockRestore();
    isSpeakingSpy.mockRestore();
  });
});
