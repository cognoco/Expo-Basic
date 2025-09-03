import { getJson, setJson } from '@utils/core/storageKeys';
import { z } from 'zod';

type SubjectId = string;

type Model = {
  subjects: Record<SubjectId, { score: number; updatedAt: number }>;
  lastWeekStart?: string;
};

const Schema = z.object({
  subjects: z.record(z.object({ score: z.number(), updatedAt: z.number() })),
  lastWeekStart: z.string().optional(),
});

const DEFAULT_MODEL: Model = { subjects: {} };

function clamp(x: number, min = 0, max = 1) { return Math.max(min, Math.min(max, x)); }

export async function loadModel(): Promise<Model> {
  return await getJson('adaptiveModel' as any, Schema, DEFAULT_MODEL);
}

export async function saveModel(m: Model): Promise<void> {
  await setJson('adaptiveModel' as any, m);
}

// Update subject score: higher means easier for the child; lower means needs more support
// response values: 'easy'|'ok'|'hard'|'help'|'complete'|'most'|'half'|'started'
export async function recordInteraction(subjectId: string, response: 'easy' | 'ok' | 'hard' | 'help' | 'complete' | 'most' | 'half' | 'started'): Promise<void> {
  const model = await loadModel();
  const now = Date.now();
  const current = model.subjects[subjectId] || { score: 0.5, updatedAt: now };

  // Map responses to deltas (tuned conservatively)
  const deltaMap: Record<string, number> = {
    easy: +0.06,
    ok: +0.02,
    hard: -0.06,
    help: -0.08,
    complete: +0.04,
    most: +0.02,
    half: -0.02,
    started: -0.04,
  };
  const delta = deltaMap[response] ?? 0;

  const timeDecay = Math.min(1, (now - current.updatedAt) / (1000 * 60 * 60 * 24)); // up to 1/day
  const decayedScore = current.score * (1 - 0.05 * timeDecay);
  const newScore = clamp(decayedScore + delta, 0, 1);

  model.subjects[subjectId] = { score: newScore, updatedAt: now };
  await saveModel(model);
}

export async function getAdaptiveCheckInMinutes(ageGroup: 'young' | 'elementary' | 'tween' | 'teen'): Promise<number> {
  // Base by age
  const baseByAge: Record<string, number> = { young: 4, elementary: 5, tween: 7, teen: 9 };
  const base = baseByAge[ageGroup] ?? 5;

  // Blend across subjects if any exist
  const model = await loadModel();
  const scores = Object.values(model.subjects).map(s => s.score);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;

  // If it's hard on average, check in sooner; if easy, a bit later
  const adjustment = Math.round((0.5 - avg) * 4); // -2..+2 minutes
  return Math.max(2, base + adjustment);
}
