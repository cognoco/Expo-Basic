export type AnimationName = 'studying' | 'celebrating' | 'idle' | 'encouraging' | 'confetti';

export function getAnimation(name: AnimationName) {
  switch (name) {
    case 'studying':
      return require('../assets/animations/studying.json');
    case 'celebrating':
      return require('../assets/animations/celebrating.json');
    case 'idle':
      return require('../assets/animations/idle.json');
    case 'encouraging':
      return require('../assets/animations/encouraging.json');
    case 'confetti':
      return require('../assets/animations/confetti.json');
    default:
      return require('../assets/animations/idle.json');
  }
}
