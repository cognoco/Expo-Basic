import type { AgeGroup } from '@types/index';
import { generatePeerLine } from '@utils/content/peerLines';
import { t } from '@utils/intl/i18n';

type BuildArgs = {
  ageGroup: AgeGroup;
  subjectId: string;
  sessionTime: number; // seconds elapsed at scheduling time
  intervalMs: number;  // base check-in interval in ms
  sessionLength: number; // seconds
  sessionId: string; // seed string (e.g., `${startTime}:${salt}`)
};

export function buildCheckInNotifications({
  ageGroup,
  subjectId,
  sessionTime,
  intervalMs,
  sessionLength,
  sessionId,
}: BuildArgs): Array<{ content: { title: string; body: string; categoryIdentifier: string }; trigger: { seconds: number } }> {
  const items = [1, 2, 3].map((i) => {
    const secondsOffset = Math.floor((intervalMs * i) / 1000);
    const seconds = sessionTime + secondsOffset;
    const body = generatePeerLine({
      ageGroup,
      subjectId: subjectId || 'other',
      seconds,
      sessionLength,
      context: 'backgroundReturn',
      sessionId,
    }).replace(/[^\w\s]/g, '');
    return {
      content: {
        title: t('checkinTitle'),
        body,
        categoryIdentifier: 'checkin-actions',
      },
      trigger: { seconds: Math.max(5, secondsOffset) },
    };
  });
  return items;
}
