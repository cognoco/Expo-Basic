import { Dimensions } from 'react-native';
import type { AgeGroup, AgeConfig, ParentGate, Subject } from '@types/index';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ===================================
// MODULAR CONFIGURATION SYSTEM
// Single source of truth for all app behavior
// ===================================

// === CORE TIMING CONFIGURATION ===
export const TIMING_CONFIG = {
  // Animation durations (milliseconds)
  animations: {
    fadeIn: 500,
    slideUp: 300,
    breathingIn: 4000,
    breathingOut: 4000,
    buttonPress: 100,
    celebrationDisplay: 3000,
  },
  
  // Session timings (milliseconds)
  session: {
    buddyFadeDelay: 60 * 1000, // 1 minute before buddy fades
    checkInDisplay: 5 * 1000, // How long check-in messages show
    modalTimeout: 30 * 1000, // Auto-pause if no interaction
    breathingCycle: 8 * 1000, // Calm mode breathing cycle
  },
  
  // Intervals (seconds - converted to ms in usage)
  intervals: {
    liveActivityUpdate: 30, // Update "X kids studying" counter
    progressSave: 60, // Auto-save progress
  }
};

// === RESPONSIVE UI SCALING ===
export const UI_SCALING_CONFIG = {
  // Screen size breakpoints
  breakpoints: {
    small: 350,   // iPhone SE
    medium: 414,  // Standard phones
    large: 768,   // Tablets
    xlarge: 1024  // Large tablets
  },
  
  // Age-based scaling multipliers
  ageScaling: {
    young: { 
      buddySize: 1.2,     // 20% larger buddy
      fontSize: 1.3,     // 30% larger text
      buttonScale: 1.2,   // 20% larger buttons
      spacing: 1.2,       // 20% more spacing
      iconSize: 1.4       // 40% larger icons
    },
    elementary: { 
      buddySize: 1.0,     // Base size
      fontSize: 1.0,     // Base text
      buttonScale: 1.0,   // Base buttons
      spacing: 1.0,       // Base spacing
      iconSize: 1.0       // Base icons
    },
    tween: { 
      buddySize: 0.85,    // 15% smaller buddy
      fontSize: 0.95,    // 5% smaller text
      buttonScale: 0.95,  // 5% smaller buttons
      spacing: 0.9,       // 10% less spacing
      iconSize: 0.9       // 10% smaller icons
    },
    teen: { 
      buddySize: 0.7,     // 30% smaller buddy
      fontSize: 0.85,    // 15% smaller text
      buttonScale: 0.9,   // 10% smaller buttons
      spacing: 0.8,       // 20% less spacing
      iconSize: 0.8       // 20% smaller icons
    }
  },
  
  // Base sizes (scaled by age and screen)
  baseSizes: {
    buddySize: 180,
    buttonHeight: 60,
    iconSize: 24,
    borderRadius: 15,
    shadowRadius: 8
  }
};

// === MODULAR AGE GROUP DATA ===
// All age-specific behavior controlled from here
const AGE_GROUP_TEMPLATES = {
  young: {
    id: 'young',
    ageRange: [5, 7],
    displayRange: '5-7',
    
    // Session defaults (minutes)
    session: {
      defaultDuration: 10,
      breakDuration: 3,
      checkInFrequency: 2,
      interactionFrequency: 15,
      maxDuration: 20
    },
    
    // Voice configuration
    voice: {
      pitch: 1.3,
      rate: 0.8,
      volume: 1.0
    },
    
    // Visual theme
    theme: {
      primary: '#FFB6C1',
      secondary: '#FFE4E1',
      accent: '#FF69B4',
      background: '#FFF8F9'
    },
    
    // Content personality
    personality: {
      encouragementLevel: 'high',    // high, medium, low
      celebrationStyle: 'enthusiastic', // enthusiastic, balanced, cool, minimal
      languageComplexity: 'simple', // simple, moderate, advanced, mature
      emojiUsage: 'frequent'        // frequent, moderate, minimal, none
    },
    
    // Parent gate (math difficulty)
    parentGate: {
      minNumber: 1,
      maxNumber: 10,
      operation: 'addition'
    }
  },
  
  elementary: {
    id: 'elementary',
    ageRange: [8, 10],
    displayRange: '8-10',
    
    session: {
      defaultDuration: 15,
      breakDuration: 5,
      checkInFrequency: 5,
      interactionFrequency: 20,
      maxDuration: 30
    },
    
    voice: {
      pitch: 1.1,
      rate: 0.9,
      volume: 1.0
    },
    
    theme: {
      primary: '#87CEEB',
      secondary: '#E0F6FF',
      accent: '#4682B4',
      background: '#F0F8FF'
    },
    
    personality: {
      encouragementLevel: 'medium',
      celebrationStyle: 'balanced',
      languageComplexity: 'moderate',
      emojiUsage: 'moderate'
    },
    
    parentGate: {
      minNumber: 10,
      maxNumber: 30,
      operation: 'addition'
    }
  },
  
  tween: {
    id: 'tween',
    ageRange: [11, 13],
    displayRange: '11-13',
    
    session: {
      defaultDuration: 20,
      breakDuration: 5,
      checkInFrequency: 7,
      interactionFrequency: 25,
      maxDuration: 45
    },
    
    voice: {
      pitch: 1.0,
      rate: 0.95,
      volume: 0.9
    },
    
    theme: {
      primary: '#98FB98',
      secondary: '#F0FFF0',
      accent: '#228B22',
      background: '#F8FFF8'
    },
    
    personality: {
      encouragementLevel: 'medium',
      celebrationStyle: 'cool',
      languageComplexity: 'advanced',
      emojiUsage: 'minimal'
    },
    
    parentGate: {
      minNumber: 20,
      maxNumber: 50,
      operation: 'addition'
    }
  },
  
  teen: {
    id: 'teen',
    ageRange: [14, 18],
    displayRange: '14+',
    
    session: {
      defaultDuration: 25,
      breakDuration: 5,
      checkInFrequency: 10,
      interactionFrequency: 30,
      maxDuration: 60
    },
    
    voice: {
      pitch: 0.95,
      rate: 1.0,
      volume: 0.8
    },
    
    theme: {
      primary: '#DDA0DD',
      secondary: '#F8F0FF',
      accent: '#9370DB',
      background: '#FDFBFF'
    },
    
    personality: {
      encouragementLevel: 'low',
      celebrationStyle: 'minimal',
      languageComplexity: 'mature',
      emojiUsage: 'none'
    },
    
    parentGate: {
      minNumber: 50,
      maxNumber: 100,
      operation: 'addition'
    }
  }
};

// === DYNAMIC CONTENT GENERATION ===
// Generate age-appropriate content from personality templates
const CONTENT_TEMPLATES = {
  // UI Labels by complexity and celebration style
  labels: {
    simple_enthusiastic: {
      buddySelectionTitle: 'Pick Your Friend!',
      buddySelectionSubtitle: 'Who will help you today?',
      namePrompt: 'Tell me your name, superstar!',
      readyMessage: 'so excited to be your friend!',
      startButtonText: 'Let\'s Learn! 🌈',
      breakButtonText: 'Break Time! 🎈',
      endButtonText: 'All Done! 🌟',
      streakLabel: 'day streak',
      statsLabel: 'Learning time'
    },
    moderate_balanced: {
      buddySelectionTitle: 'Choose Your Buddy!',
      buddySelectionSubtitle: 'Pick your study partner!',
      namePrompt: 'What should I call you?',
      readyMessage: 'ready to help you focus!',
      startButtonText: 'Start Studying! 📚',
      breakButtonText: 'Break Time! 🌟',
      endButtonText: 'Finished! 🎉',
      streakLabel: 'day streak',
      statsLabel: 'Study time'
    },
    advanced_cool: {
      buddySelectionTitle: 'Pick Your Focus Friend',
      buddySelectionSubtitle: 'Choose your style',
      namePrompt: 'What\'s your name?',
      readyMessage: 'here to help you crush it!',
      startButtonText: 'Let\'s Go 💪',
      breakButtonText: 'Quick Break',
      endButtonText: 'Done ✓',
      streakLabel: 'days',
      statsLabel: 'Focus time'
    },
    mature_minimal: {
      buddySelectionTitle: 'Focus Mode',
      buddySelectionSubtitle: 'Select your vibe',
      namePrompt: 'Name (optional)',
      readyMessage: 'ready.',
      startButtonText: 'Start',
      breakButtonText: 'Break',
      endButtonText: 'End',
      streakLabel: 'days',
      statsLabel: 'Total'
    }
  },
  
  // Messages by encouragement level
  messages: {
    high: [
      'You\'re doing AMAZING! 🌟',
      'Wow! Look at you go! 🚀',
      'Super duper job! 🌈',
      'You\'re the best! 💖',
      'Keep being awesome! ⭐'
    ],
    medium: [
      'Great focus! Keep it up! 🌟',
      'You\'re doing awesome! 💪',
      'Nice work! Stay strong! 🚀',
      'Fantastic job! 🎯',
      'Keep going, you\'ve got this! ⭐'
    ],
    low: [
      'In the zone 🎯',
      'Solid 💯',
      'Keep going 📈',
      'Progress ✓',
      'On track 🎪'
    ]
  },
  
  // Break messages by style
  breaks: {
    enthusiastic: {
      title: 'Wiggle Break! 🎉',
      message: 'Time to jump, dance, or get a snack!',
      resumeText: 'More Learning!'
    },
    balanced: {
      title: 'Break Time!',
      message: 'Great work! Take 5 minutes to stretch or grab water.',
      resumeText: 'Back to Work!'
    },
    cool: {
      title: 'Break Time',
      message: 'Good session. Take 5.',
      resumeText: 'Continue'
    },
    minimal: {
      title: 'Break',
      message: '5 minute break.',
      resumeText: 'Resume'
    }
  }
};

// === SUBJECT CONFIGURATION ===
export const SUBJECT_SYSTEM = {
  // Subject definitions with metadata
  subjects: {
    // Elementary subjects
    math: { 
      id: 'math', label: 'Math', emoji: '🔢', 
      category: 'core', difficulty: 'medium',
      checkIns: ['Check your calculations!', 'Show your work!', 'One problem at a time', 'Double-check that answer', 'Remember your formulas']
    },
    reading: { 
      id: 'reading', label: 'Reading', emoji: '📚', 
      category: 'core', difficulty: 'easy',
      checkIns: ['What\'s happening now?', 'Who\'s the main character?', 'What do you think happens next?', 'Picture the scene', 'Keep going, great reading!']
    },
    writing: { 
      id: 'writing', label: 'Writing', emoji: '✏️', 
      category: 'core', difficulty: 'medium',
      checkIns: ['Check your spelling!', 'Add more details', 'How many sentences so far?', 'Remember punctuation', 'Great writing flow!']
    },
    other: { 
      id: 'other', label: 'Other', emoji: '📝', 
      category: 'flexible', difficulty: 'easy',
      checkIns: ['Keep it up!', 'You\'re doing great!', 'Stay focused!', 'Almost there!', 'Excellent work!']
    },
    
    // Advanced subjects
    science: { 
      id: 'science', label: 'Science', emoji: '🔬', 
      category: 'stem', difficulty: 'medium',
      checkIns: ['Test your hypothesis', 'Check your method', 'What\'s the evidence?', 'Think like a scientist', 'Record your observations']
    },
    chemistry: { 
      id: 'chemistry', label: 'Chemistry', emoji: '⚗️', 
      category: 'stem', difficulty: 'hard',
      checkIns: ['Balance those equations!', 'Check your formulas', 'Remember units!', 'Think about reactions', 'Safety first!']
    },
    biology: { 
      id: 'biology', label: 'Biology', emoji: '🧬', 
      category: 'stem', difficulty: 'medium',
      checkIns: ['Think about the process', 'Draw it out if it helps', 'Check your terms', 'Remember the system', 'Life is amazing!']
    },
    history: { 
      id: 'history', label: 'History', emoji: '🏛️', 
      category: 'social', difficulty: 'medium',
      checkIns: ['Dates and names matter', 'What caused this?', 'Think about the timeline', 'Connect the events', 'History repeats!']
    },
    geography: { 
      id: 'geography', label: 'Geography', emoji: '🌍', 
      category: 'social', difficulty: 'easy',
      checkIns: ['Picture the map', 'Remember locations', 'Think about connections', 'Climate matters', 'Explore the world!']
    }
  },
  
  // Age-appropriate subject groupings
  ageGroups: {
    young: ['math', 'reading', 'writing', 'other'],
    elementary: ['math', 'reading', 'writing', 'other'],
    tween: ['math', 'reading', 'writing', 'science', 'history', 'geography', 'other'],
    teen: ['math', 'reading', 'writing', 'science', 'chemistry', 'biology', 'history', 'geography', 'other']
  }
};

// === GAMIFICATION SYSTEM ===
export const GAMIFICATION_CONFIG = {
  // Surprise events (5% chance per session)
  surprises: {
    frequency: 0.05,
    events: [
      { id: 'power_hour', message: 'Power Hour! Everything counts double!', emoji: '⚡' },
      { id: 'buddy_birthday', message: 'It\'s Buddy\'s Birthday!', emoji: '🎂' },
      { id: 'opposite_day', message: 'Opposite Day! Breaks are longer!', emoji: '🔄' },
      { id: 'challenge_mode', message: 'Challenge Mode! Beat yesterday!', emoji: '🏆' },
      { id: 'guest_buddy', message: 'Guest Buddy visiting!', emoji: '👋' },
      { id: 'speed_round', message: 'Speed Round! Quick focus!', emoji: '💨' },
      { id: 'quiet_mode', message: 'Shh... Library Mode!', emoji: '🤫' },
      { id: 'party_mode', message: 'Party Mode! Extra celebrations!', emoji: '🎉' }
    ]
  },
  
  // Mystery Monday events (every Monday)
  mysteryMonday: [
    'Buddy has a hat today!',
    'Timer counts UP instead of down!',
    'Everything is backwards!',
    'Night mode activated!',
    'Speed mode - shorter sessions!',
    'Buddy is feeling quiet today',
    'Double points day!',
    'Surprise colors everywhere!'
  ],
  
  // Seasonal themes (auto-applied by month)
  seasonal: {
    january: { name: 'New Year', emoji: '🎊', color: '#FFD700' },
    february: { name: 'Hearts', emoji: '💕', color: '#FF69B4' },
    march: { name: 'Spring', emoji: '🌸', color: '#98FB98' },
    april: { name: 'Rain', emoji: '🌧️', color: '#87CEEB' },
    may: { name: 'Flowers', emoji: '🌺', color: '#FF6347' },
    june: { name: 'Summer', emoji: '☀️', color: '#FFD700' },
    july: { name: 'Beach', emoji: '🏖️', color: '#20B2AA' },
    august: { name: 'Back to School', emoji: '🎒', color: '#FF8C00' },
    september: { name: 'Fall', emoji: '🍂', color: '#D2691E' },
    october: { name: 'Halloween', emoji: '🎃', color: '#FF8C00' },
    november: { name: 'Thankful', emoji: '🦃', color: '#8B4513' },
    december: { name: 'Winter', emoji: '❄️', color: '#00CED1' }
  }
};

// ===================================
// COMPUTED CONFIGURATIONS
// Generated dynamically from templates
// ===================================

// Generate parent gate questions
export function generateParentGate(ageTemplate: { parentGate: { minNumber: number; maxNumber: number; operation: string } }): ParentGate {
  const { minNumber, maxNumber, operation } = ageTemplate.parentGate;
  const a = Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber;
  const b = Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber;
  
  switch (operation) {
    case 'addition':
      return {
        question: `What's ${a} + ${b}?`,
        answer: (a + b).toString()
      };
    default:
      return { question: `What's ${a} + ${b}?`, answer: (a + b).toString() };
  }
}

// Generate content from templates
function generateContentForAge(ageTemplate) {
  const { languageComplexity, celebrationStyle, encouragementLevel } = ageTemplate.personality;
  const contentKey = `${languageComplexity}_${celebrationStyle}`;
  
  const labels = CONTENT_TEMPLATES.labels[contentKey] || CONTENT_TEMPLATES.labels.moderate_balanced;
  const messages = CONTENT_TEMPLATES.messages[encouragementLevel] || CONTENT_TEMPLATES.messages.medium;
  const breakInfo = CONTENT_TEMPLATES.breaks[celebrationStyle] || CONTENT_TEMPLATES.breaks.balanced;
  const parentGate = generateParentGate(ageTemplate);
  
  return {
    ...labels,
    checkInMessages: messages,
    breakTitle: breakInfo.title,
    breakMessage: breakInfo.message,
    resumeButtonText: breakInfo.resumeText,
    parentGateQuestion: parentGate.question,
    parentGateAnswer: parentGate.answer,
    
    // Generated session messages
    startMessage: generateStartMessage(ageTemplate.personality),
    welcomeBackMessage: generateWelcomeMessage(ageTemplate.personality),
    completionMessage: generateCompletionMessage(ageTemplate.personality)
  };
}

function generateStartMessage(personality) {
  const templates = {
    simple: 'Yay! Let\'s learn together! You\'re amazing!',
    moderate: 'Let\'s do this! I\'m right here with you.',
    advanced: 'Let\'s get this done.',
    mature: 'Focus mode activated.'
  };
  return templates[personality.languageComplexity] || templates.moderate;
}

function generateWelcomeMessage(personality) {
  const templates = {
    simple: 'Welcome back superstar!',
    moderate: 'Welcome back! Ready to continue?',
    advanced: 'Back at it. Nice.',
    mature: 'Resuming.'
  };
  return templates[personality.languageComplexity] || templates.moderate;
}

function generateCompletionMessage(personality) {
  const templates = {
    simple: 'Amazing job! You\'re a superstar!',
    moderate: 'Excellent work! You did it!',
    advanced: 'Solid work today.',
    mature: 'Session complete.'
  };
  return templates[personality.languageComplexity] || templates.moderate;
}

// ===================================
// FINAL COMPUTED CONFIGURATIONS
// Ready-to-use by components
// ===================================

// Generate complete age configurations
export const AGE_CONFIGS: Record<AgeGroup, AgeConfig> = Object.fromEntries(
  (Object.entries(AGE_GROUP_TEMPLATES) as Array<[AgeGroup, typeof AGE_GROUP_TEMPLATES[keyof typeof AGE_GROUP_TEMPLATES]]>).map(([key, template]) => [
    key,
    {
      // Copy base template
      ...template,
      
      // Add computed content
      ...generateContentForAge(template),
      
      // Convert session minutes to seconds for timers
      sessionLength: template.session.defaultDuration * 60,
      breakDuration: template.session.breakDuration * 60,
      checkInFrequency: template.session.checkInFrequency,
      interactionFrequency: template.session.interactionFrequency,
      
      // Add computed UI properties
      buddySize: UI_SCALING_CONFIG.baseSizes.buddySize * UI_SCALING_CONFIG.ageScaling[key].buddySize,
      fontSize: UI_SCALING_CONFIG.ageScaling[key].fontSize,
      buttonScale: UI_SCALING_CONFIG.ageScaling[key].buttonScale,
      
      // Voice properties (direct copy)
      voicePitch: template.voice.pitch,
      voiceRate: template.voice.rate,
      
      // Theme properties (direct copy) 
      primaryColor: template.theme.primary,
      secondaryColor: template.theme.secondary,
      accentColor: template.theme.accent
    }
  ])
);

// ===================================
// UTILITY FUNCTIONS
// For components to access configurations
// ===================================

// Get configuration for specific age group
export const getAgeConfig = (ageGroup: AgeGroup): AgeConfig => {
  return AGE_CONFIGS[ageGroup] ?? AGE_CONFIGS.elementary;
};

// Get subjects appropriate for age
export const getSubjectsForAge = (ageGroup: AgeGroup): Subject[] => {
  const subjectIds = SUBJECT_SYSTEM.ageGroups[ageGroup] ?? SUBJECT_SYSTEM.ageGroups.elementary;
  return subjectIds.map((id: string) => SUBJECT_SYSTEM.subjects[id]);
};

// Get check-in messages for subject
export const getSubjectCheckIns = (subjectId: string): string[] => {
  return SUBJECT_SYSTEM.subjects[subjectId]?.checkIns || SUBJECT_SYSTEM.subjects.other.checkIns;
};

// Get responsive value based on screen size
export const getResponsiveValue = <T,>(values: { small?: T; medium: T; large?: T; xlarge?: T }): T => {
  if (screenWidth < UI_SCALING_CONFIG.breakpoints.small) return values.small || values.medium;
  if (screenWidth < UI_SCALING_CONFIG.breakpoints.medium) return values.medium;
  if (screenWidth < UI_SCALING_CONFIG.breakpoints.large) return values.large || values.medium;
  return values.xlarge || values.large;
};

// Get scaled size for age group
type ScaleKey = 'buddySize' | 'fontSize' | 'buttonScale' | 'spacing' | 'iconSize';
export const getScaledSize = (
  baseSize: number,
  ageGroup: AgeGroup,
  sizeType: ScaleKey = 'buddySize'
): number => {
  const scaling = UI_SCALING_CONFIG.ageScaling[ageGroup] ?? UI_SCALING_CONFIG.ageScaling.elementary;
  return baseSize * scaling[sizeType];
};

// Get timing value
export const getTiming = <T extends keyof typeof TIMING_CONFIG, K extends keyof (typeof TIMING_CONFIG)[T]>(category: T, key: K): number => {
  const group = TIMING_CONFIG[category] as any;
  const value = group?.[key as string];
  return typeof value === 'number' ? value : 1000;
};

// Get current seasonal theme
export const getCurrentSeasonalTheme = () => {
  const month = new Date().getMonth(); // 0-11
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                     'july', 'august', 'september', 'october', 'november', 'december'];
  return GAMIFICATION_CONFIG.seasonal[monthNames[month]];
};

// Get random surprise event
export const getRandomSurpriseEvent = () => {
  const events = GAMIFICATION_CONFIG.surprises.events;
  return events[Math.floor(Math.random() * events.length)];
};

// Check if surprise should trigger
export const shouldTriggerSurprise = () => {
  try {
    const extra: any = (require('expo-constants').default?.manifest?.extra || {});
    const mult = extra?.remote?.surprise?.frequencyMultiplier ?? 1.0;
    const freq = Math.max(0, GAMIFICATION_CONFIG.surprises.frequency * mult);
    return Math.random() < freq;
  } catch {
    return Math.random() < GAMIFICATION_CONFIG.surprises.frequency;
  }
};

// Get Mystery Monday change for current week
export const getMysteryMondayChange = () => {
  const today = new Date();
  if (today.getDay() !== 1) return null; // Not Monday
  
  const weekNumber = Math.floor(today.getDate() / 7);
  const changes = GAMIFICATION_CONFIG.mysteryMonday;
  return changes[weekNumber % changes.length];
};

// ===================================
// BACKWARD COMPATIBILITY EXPORTS
// For existing code that uses old names
// ===================================

// Legacy exports (auto-generated from new system)
export const SUBJECTS_ELEMENTARY = getSubjectsForAge('elementary');
export const SUBJECTS_ADVANCED = getSubjectsForAge('teen');
export const SUBJECT_CHECK_INS = Object.fromEntries(
  Object.entries(SUBJECT_SYSTEM.subjects).map(([id, subject]) => [id, subject.checkIns])
);
export const SURPRISE_EVENTS = GAMIFICATION_CONFIG.surprises.events;
export const MYSTERY_MONDAY_CHANGES = GAMIFICATION_CONFIG.mysteryMonday;
export const SEASONAL_THEMES = GAMIFICATION_CONFIG.seasonal;

// Colors system
export const COLORS = {
  primary: '#4A90E2',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
  purple: '#9B59B6',
  dark: '#2C3E50',
  gray: '#7F8C8D',
  lightGray: '#ECF0F1',
  background: '#F0F8FF',
};
