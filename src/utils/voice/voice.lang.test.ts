import * as Speech from 'expo-speech';
import { resolveVoiceForBuddy } from './voice';
import * as I18n from '@utils/intl/i18n';

describe('resolveVoiceForBuddy language preference', () => {
  it('prefers user-selected non-English language when available', async () => {
    jest.spyOn(I18n, 'getCurrentLanguage').mockReturnValue('es');
    const voices = [
      { identifier: 'es-ES-1', language: 'es-ES' },
      { identifier: 'en-US-1', language: 'en-US' },
    ];
    const spy = jest.spyOn(Speech, 'getAvailableVoicesAsync' as any).mockResolvedValueOnce(voices as any);
    const v = await resolveVoiceForBuddy({ ageGroup: 'tween' });
    expect(v.language).toMatch(/^es/);
    expect(v.voice).toBe('es-ES-1');
    spy.mockRestore();
  });
});
