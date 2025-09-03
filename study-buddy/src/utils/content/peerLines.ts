import { SUBJECT_SYSTEM, AGE_CONFIGS } from '@utils/config/constants';
import type { GeneratePeerLineInput } from '@types/index';

// Deterministic-ish helper to keep session-consistent variation
function seededRand(seed) {
  let x = 0;
  try { x = Array.from(String(seed)).reduce((a, c) => a + c.charCodeAt(0), 0); } catch {}
  const t = Math.sin(x) * 10000;
  return t - Math.floor(t);
}

const SUBJECT_HINTS = {
  math: ['Check your steps', 'One problem at a time', 'Show your work'],
  reading: ['Summarize the paragraph', 'Who is the main character?', 'Predict what happens next'],
  writing: ['Add one detail', 'Check punctuation', 'Reread your sentence'],
  science: ['State your hypothesis', 'Measure carefully', 'Record observations'],
  chemistry: ['Balance the equation', 'Units matter', 'Mind safety rules'],
  biology: ['Name the parts', 'Think about the process', 'Use correct terms'],
  history: ['Think causes and effects', 'Check the timeline', 'Who did what?'],
  geography: ['Picture the map', 'Relate places', 'Climate matters'],
  other: ['Stay with it', 'You got this', 'Small steps add up']
};

export function generatePeerLine({
  ageGroup = 'elementary',
  buddyPersonality,
  subjectId = 'other',
  seconds = 0,
  sessionLength = 1200,
  context = 'tick',
  sessionId = 'default',
}: GeneratePeerLineInput): string {
  const ageConfig = AGE_CONFIGS[ageGroup] || AGE_CONFIGS.elementary;
  const subject = SUBJECT_SYSTEM.subjects[subjectId] || SUBJECT_SYSTEM.subjects.other;
  const ratio = Math.max(0, Math.min(1, seconds / Math.max(1, sessionLength)));
  const r = seededRand(`${sessionId}:${seconds}:${subjectId}`);
  // Jitter phase thresholds slightly per session to avoid identical bucketing
  const jitter = (seededRand(`${sessionId}:jitter`) - 0.5) * 0.1; // ±0.05
  const earlyCut = Math.max(0.2, Math.min(0.4, 0.33 + jitter));
  const lateCut = Math.max(0.6, Math.min(0.8, 0.66 + jitter));

  // Early / mid / late templates tuned by age tone
  const tone = ageConfig.personality?.encouragementLevel || 'medium';
  const simple = tone === 'high' || ageGroup === 'young';

  const early = simple
    ? [
        `${subject.emoji} Great start!`,
        `Nice focus on ${subject.label}!`,
        `Let's go! ${subject.label} time!`
      ]
    : [
        `${subject.emoji} Settling in. Keep a steady pace.`,
        `Strong start on ${subject.label}. Stay consistent.`,
        `Dial in. Small steps on ${subject.label}.`
      ];

  const mid = simple
    ? [
        `Halfway vibes! ${subject.emoji}`,
        `Good rhythm. Keep going!`,
        `Nice work—stay with ${subject.label}!`
      ]
    : [
        `You're in the zone. Maintain pace.`,
        `Progress is stacking. Stay on task.`,
        `Solid momentum on ${subject.label}.`
      ];

  const late = simple
    ? [
        `Almost there!`,
        `Push to the finish!`,
        `Final stretch on ${subject.label}!`
      ]
    : [
        `Close it out with quality.`,
        `Finish strong—focus on the next small chunk.`,
        `Wrap-up time: check your last step.`
      ];

  const hints = SUBJECT_HINTS[subject.id] || SUBJECT_HINTS.other;

  // Shuffle-bag per session and phase, with recency avoidance
  type Phase = 'early' | 'mid' | 'late';
  const phase: Phase = ratio > lateCut ? 'late' : ratio > earlyCut ? 'mid' : 'early';

  // Session-scoped cache
  const globalAny: any = (globalThis as any);
  globalAny.__peerLineCache = globalAny.__peerLineCache || {};
  const cacheKey = `${sessionId}:${subject.id}:${phase}`;
  const recencyKey = `${sessionId}:${subject.id}:recency:${phase}`;
  const basePool = phase === 'early' ? early : phase === 'mid' ? mid : late;

  // Initialize shuffled pool when missing or exhausted
  if (!Array.isArray(globalAny.__peerLineCache[cacheKey]) || globalAny.__peerLineCache[cacheKey].length === 0) {
    const shuffled = [...basePool]
      .map((line) => ({ line, k: seededRand(`${cacheKey}:${line}`) }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.line);
    globalAny.__peerLineCache[cacheKey] = shuffled;
  }
  // Maintain small LRU per phase to avoid near-term repeats
  globalAny.__peerLineCache[recencyKey] = globalAny.__peerLineCache[recencyKey] || [];
  const lru: string[] = globalAny.__peerLineCache[recencyKey];
  const lruMax = 3;

  // Pop next candidate not in LRU; if all are in LRU, pop first
  let candidate = globalAny.__peerLineCache[cacheKey].shift();
  let attempts = basePool.length;
  while (attempts-- > 0 && candidate && lru.includes(candidate) && globalAny.__peerLineCache[cacheKey].length > 0) {
    globalAny.__peerLineCache[cacheKey].push(candidate);
    candidate = globalAny.__peerLineCache[cacheKey].shift();
  }
  const pick = (candidate || basePool[Math.floor(r * basePool.length)]) as string;

  // Mix in subject hint about 40% of the time
  // Update LRU
  if (!lru.includes(pick)) {
    lru.push(pick);
    if (lru.length > lruMax) lru.shift();
  }
  const hintRand = seededRand(`${sessionId}:${seconds}:${subjectId}:hint`);
  const maybeHint = hintRand > 0.6 ? ` • ${hints[Math.floor(hintRand * hints.length)]}` : '';

  // Context tweaks
  if (context === 'backgroundReturn') {
    return `${subject.emoji} Ready to jump back in?${maybeHint}`;
  }
  return `${pick}${maybeHint}`;
}
