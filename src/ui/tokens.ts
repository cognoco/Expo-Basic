import { getAgeConfig } from '@utils/config/constants';
import type { AgeGroup } from '@types/index';

export type Tokens = {
  colors: { primary: string; secondary: string; accent: string; text: string; muted: string; white: string };
  spacing: (n: number, age?: AgeGroup) => number;
  radius: (n?: number) => number;
  typography: { title: number; body: number; small: number };
};

export function useAgeTokens(ageGroup: AgeGroup = 'elementary'): Tokens {
  const cfg = getAgeConfig(ageGroup);
  const base = {
    colors: {
      primary: cfg.primaryColor || '#4A90E2',
      secondary: cfg.secondaryColor || '#F0F8FF',
      accent: cfg.accentColor || '#4A90E2',
      text: '#2C3E50',
      muted: '#7F8C8D',
      white: '#FFFFFF',
    },
    spacing: (n: number) => n * (cfg.buttonScale || 1.0) * 4,
    radius: (n: number = 10) => n,
    typography: {
      title: 24 * (cfg.fontSize || 1.0),
      body: 16 * (cfg.fontSize || 1.0),
      small: 12 * (cfg.fontSize || 1.0),
    },
  } as const;
  return base as Tokens;
}
