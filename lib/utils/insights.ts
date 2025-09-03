import { z } from 'zod';
import { getJson, setJson } from '@utils/core/storageKeys';

const SESSION_LOG_KEY = 'lastSessionLog' as any; // matches StorageKeys

export type SessionEntry = {
  time: number; // seconds since session start
  question: string;
  response: string; // normalized id (e.g., 'help', 'complete')
  timestamp: string; // ISO string
};

export type WeeklyInsights = {
  totalMinutes: number;
  avgSessionMinutes: number;
  sessions: number;
  topHelps: Array<{ id: string; count: number }>;
};

const SessionEntrySchema: z.ZodSchema<SessionEntry> = z.object({
  time: z.number().nonnegative(),
  question: z.string(),
  response: z.string(),
  timestamp: z.string(),
});

const SessionLogSchema = z.array(SessionEntrySchema);

export async function computeWeeklyInsights(): Promise<WeeklyInsights> {
  // For now compute from the lastSessionLog; can be extended to aggregate weekly history
  const log = await getJson<SessionEntry[]>(SESSION_LOG_KEY, SessionLogSchema, []);
  if (!log || log.length === 0) {
    return { totalMinutes: 0, avgSessionMinutes: 0, sessions: 0, topHelps: [] };
  }

  // Assume a single session represented in lastSessionLog; duration from last entry
  const last = log[log.length - 1];
  const totalMinutes = Math.max(0, Math.round((last.time || 0) / 60));

  const helpCounts: Record<string, number> = {};
  for (const e of log) {
    if (e.response === 'help') {
      helpCounts['help'] = (helpCounts['help'] || 0) + 1;
    }
  }
  const topHelps = Object.entries(helpCounts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalMinutes,
    avgSessionMinutes: totalMinutes, // single-session approximation
    sessions: 1,
    topHelps,
  };
}

// Optional: append new session logs for future richer analytics
export async function appendSessionLog(entries: SessionEntry[]): Promise<void> {
  const existing = await getJson<SessionEntry[]>(SESSION_LOG_KEY, SessionLogSchema, []);
  const merged = [...existing, ...entries].slice(-1000);
  await setJson(SESSION_LOG_KEY, merged);
}
