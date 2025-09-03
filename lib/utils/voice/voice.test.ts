import { resolveVoiceForBuddy } from './voice';
import * as Speech from 'expo-speech';

describe('resolveVoiceForBuddy', () => {
  it('returns sane defaults when voices API fails', async () => {
    const spy = jest.spyOn(Speech, 'getAvailableVoicesAsync' as any).mockRejectedValueOnce(new Error('fail'));
    const v = await resolveVoiceForBuddy({ ageGroup: 'tween' });
    expect(v.language).toMatch(/^en/);
    expect(typeof v.rate).toBe('number');
    expect(typeof v.pitch).toBe('number');
    spy.mockRestore();
  });

  it('selects an English voice when available', async () => {
    const voices = [
      { identifier: 'es-ES-1', language: 'es-ES' },
      { identifier: 'en-US-1', language: 'en-US' },
    ];
    const spy = jest.spyOn(Speech, 'getAvailableVoicesAsync' as any).mockResolvedValueOnce(voices as any);
    const v = await resolveVoiceForBuddy({ ageGroup: 'teen' });
    expect(v.voice).toBe('en-US-1');
    spy.mockRestore();
  });
});
