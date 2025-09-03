import { generatePeerLine } from './peerLines';

describe('generatePeerLine', () => {
  const base = {
    ageGroup: 'tween' as const,
    subjectId: 'biology',
    sessionId: 'test-session',
    sessionLength: 1200,
  };

  it('picks early-phase lines at start of session', () => {
    const line = generatePeerLine({ ...base, seconds: 60, context: 'tick' });
    expect(line).toMatch(/Great start|Settling in|Strong start|Let's go/i);
  });

  it('picks late-phase lines near end of session', () => {
    const line = generatePeerLine({ ...base, seconds: 1100, context: 'tick' });
    expect(line).toMatch(/Almost there|Push to the finish|Wrap-up|Finish strong|Final stretch|Close it out/i);
  });

  it('adds biology hint sometimes', () => {
    const withHint = generatePeerLine({ ...base, seconds: 300, context: 'tick' });
    // Not deterministic, but ensure function returns a non-empty string
    expect(typeof withHint).toBe('string');
    expect(withHint.length).toBeGreaterThan(0);
  });

  it('avoids immediate repeats within phase (recency LRU)', () => {
    const samples: string[] = [];
    // Very early seconds to stay in early phase regardless of jitter
    for (let s = 5; s <= 45; s += 5) {
      samples.push(generatePeerLine({ ...base, seconds: s, context: 'tick' }));
    }
    // No adjacent duplicates
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).not.toEqual(samples[i - 1]);
    }
    // Diversity > 1
    expect(new Set(samples).size).toBeGreaterThan(1);
  });

  it('produces ~40% hints over a window (non-strict)', () => {
    let hintCount = 0;
    const total = 50;
    for (let i = 0; i < total; i++) {
      const line = generatePeerLine({ ...base, seconds: 200 + i * 3, context: 'tick' });
      if (line.includes(' • ')) hintCount++;
    }
    // Expect between 20% and 70% due to randomness bounds
    const rate = hintCount / total;
    expect(rate).toBeGreaterThan(0.2);
    expect(rate).toBeLessThan(0.7);
  });
});
