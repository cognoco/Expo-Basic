// ===================================
// MODULAR BUDDY SYSTEM
// Data-driven buddy configurations
// ===================================

// Buddy personality templates
const BUDDY_PERSONALITIES = {
  energetic: {
    sounds: ['boing', 'yay', 'woohoo'],
    animationStyle: 'bouncy',
    description: 'super excited and encouraging'
  },
  magical: {
    sounds: ['sparkle', 'magic', 'chime'],
    animationStyle: 'mystical',
    description: 'magical and supportive'
  },
  friendly: {
    sounds: ['roar', 'stomp', 'growl'],
    animationStyle: 'strong',
    description: 'friendly and brave'
  },
  playful: {
    sounds: ['purr', 'meow', 'chirp'],
    animationStyle: 'gentle',
    description: 'playful and encouraging'
  },
  loyal: {
    sounds: ['woof', 'bark', 'pant'],
    animationStyle: 'steady',
    description: 'loyal and supportive'
  },
  smart: {
    sounds: ['beep', 'boop', 'whir'],
    animationStyle: 'precise',
    description: 'smart and helpful'
  },
  cool: {
    sounds: ['roar', 'fire', 'whoosh'],
    animationStyle: 'powerful',
    description: 'cool and powerful'
  },
  focused: {
    sounds: ['howl', 'growl', 'breath'],
    animationStyle: 'calm',
    description: 'focused and strong'
  },
  mysterious: {
    sounds: ['beep', 'whoosh', 'hum'],
    animationStyle: 'ethereal',
    description: 'chill and mysterious'
  },
  minimal: {
    sounds: ['pulse', 'hum', 'tone'],
    animationStyle: 'subtle',
    description: 'minimal and focused'
  },
  zen: {
    sounds: ['rustle', 'grow', 'flow'],
    animationStyle: 'organic',
    description: 'calm and growing'
  },
  mystical: {
    sounds: ['chime', 'glow', 'resonate'],
    animationStyle: 'floating',
    description: 'mystical and serene'
  }
};

type AgeGroup = 'young' | 'elementary' | 'tween' | 'teen';

type BuddyCatalogItem = {
  id: string;
  name: string;
  emoji: string;
  baseColor: string;
  personality: keyof typeof BUDDY_PERSONALITIES;
  allowedAges: AgeGroup[];
};

const BUDDY_CATALOG: BuddyCatalogItem[] = [
  { id: 'bunny', name: 'Bouncy', emoji: '🐰', baseColor: '#FFB6C1', personality: 'energetic', allowedAges: ['young','elementary'] },
  { id: 'unicorn', name: 'Sparkles', emoji: '🦄', baseColor: '#E6E6FA', personality: 'magical', allowedAges: ['young'] },
  { id: 'dino', name: 'Rex', emoji: '🦕', baseColor: '#98FB98', personality: 'friendly', allowedAges: ['young','elementary'] },
  { id: 'cat', name: 'Whiskers', emoji: '🐱', baseColor: '#FFD93D', personality: 'playful', allowedAges: ['elementary'] },
  { id: 'dog', name: 'Buddy', emoji: '🐶', baseColor: '#8B4513', personality: 'loyal', allowedAges: ['elementary'] },
  { id: 'robot', name: 'Beep', emoji: '🤖', baseColor: '#C0C0C0', personality: 'smart', allowedAges: ['elementary','tween','teen'] },
  { id: 'dragon', name: 'Blaze', emoji: '🐉', baseColor: '#FF6B6B', personality: 'cool', allowedAges: ['tween'] },
  { id: 'wolf', name: 'Shadow', emoji: '🐺', baseColor: '#4A5568', personality: 'focused', allowedAges: ['tween'] },
  { id: 'alien', name: 'Cosmic', emoji: '👽', baseColor: '#00D9FF', personality: 'mysterious', allowedAges: ['tween'] },
  { id: 'geometric', name: 'Hex', emoji: '⬡', baseColor: '#7C3AED', personality: 'minimal', allowedAges: ['teen'] },
  { id: 'plant', name: 'Zen', emoji: '🌱', baseColor: '#10B981', personality: 'zen', allowedAges: ['teen'] },
  { id: 'orb', name: 'Focus', emoji: '🔮', baseColor: '#EC4899', personality: 'mystical', allowedAges: ['teen'] },
];

function decorateBuddy(template: BuddyCatalogItem) {
  const personality = BUDDY_PERSONALITIES[template.personality];
  return {
    ...template,
    color: template.baseColor,
    sounds: personality.sounds,
    animationStyle: personality.animationStyle,
    description: personality.description
  };
}

export const getBuddiesForAge = (ageGroup: AgeGroup) => {
  return BUDDY_CATALOG.filter(b => b.allowedAges.includes(ageGroup)).map(decorateBuddy);
};

export const getBuddyForAge = (ageGroup: AgeGroup, buddyId: string) => {
  const list = getBuddiesForAge(ageGroup);
  return list.find(b => b.id === buddyId) || list[0];
};

// Animation file references (for Lottie)
export const ANIMATIONS = {
  studying: 'studying.json',
  celebrating: 'celebrating.json',
  idle: 'idle.json',
  encouraging: 'encouraging.json',
  confetti: 'confetti.json'
};

// Remove duplicate legacy exports referencing undefined BUDDIES_BY_AGE.
