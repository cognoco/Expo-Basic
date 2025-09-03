import { buildCheckInNotifications } from './notificationsSchedule';

describe('buildCheckInNotifications', () => {
  it('produces 3 scheduled notifications with increasing triggers', () => {
    const intervalMs = 6000; // 6s for test profile
    const out = buildCheckInNotifications({
      ageGroup: 'tween',
      subjectId: 'science',
      sessionTime: 120, // 2 min elapsed
      intervalMs,
      sessionLength: 1200,
      sessionId: 'seed-123',
    });
    expect(out).toHaveLength(3);
    expect(out[0].trigger.seconds).toBeGreaterThan(0);
    expect(out[1].trigger.seconds).toBeGreaterThan(out[0].trigger.seconds);
    expect(out[2].trigger.seconds).toBeGreaterThan(out[1].trigger.seconds);
    expect(out[0].content.title).toBe('Study Buddy');
    expect(typeof out[0].content.body).toBe('string');
    expect(out[0].content.body.length).toBeGreaterThan(0);
  });
});
