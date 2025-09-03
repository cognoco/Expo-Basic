export type AgeGroup = 'young' | 'elementary' | 'tween' | 'teen';

export interface Subject {
  id: string;
  label: string;
  emoji: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  checkIns: string[];
}

export interface Buddy {
  id: string;
  name: string;
  emoji: string;
  color: string;
  personality: string;
  sounds?: string[];
  animationStyle?: string;
  description?: string;
}

export interface VoiceConfig {
  language: string;
  rate: number;
  pitch: number;
  voice?: string;
}

export interface ParentGate {
  question: string;
  answer: string;
}

export interface AgeConfig {
  id: AgeGroup;
  displayRange: string;
  sessionLength: number; // seconds
  breakDuration: number; // seconds
  checkInFrequency: number; // minutes
  interactionFrequency: number; // minutes
  voicePitch: number;
  voiceRate: number;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  startMessage?: string;
  welcomeBackMessage?: string;
  completionMessage?: string;
  streakLabel?: string;
  statsLabel?: string;
  [key: string]: unknown;
}

export interface SessionLogEntry {
  time: number; // seconds
  question: string;
  response: string;
  timestamp: string; // ISO
}

export interface GeneratePeerLineInput {
  ageGroup: AgeGroup;
  buddyPersonality?: string;
  subjectId: string;
  seconds: number;
  sessionLength: number;
  context?: 'tick' | 'backgroundReturn';
  sessionId?: string;
}

// React Navigation augmentation (global)
import type { RootStackParamList } from './navigation';
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
