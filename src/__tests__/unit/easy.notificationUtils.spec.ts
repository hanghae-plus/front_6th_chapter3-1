import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { createEvent, createEvents } from '../eventFactory';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = createEvents([
      { date: '2025-07-01', startTime: '10:00', notificationTime: 1 },
      { date: '2025-07-01', startTime: '14:00', notificationTime: 5 },
    ]);

    const now = new Date('2025-07-01T09:59:00');
    const notifiedEvents: string[] = [];

    const expected = [events[0]];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(1);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = createEvents([
      { id: 'event-1min', date: '2025-07-01', startTime: '10:00', notificationTime: 1 },
      { id: 'event-5min', date: '2025-07-01', startTime: '14:00', notificationTime: 5 },
    ]);

    const now = new Date('2025-07-01T09:59:00');
    const notifiedEvents = ['event-1min'];

    const expected: Event[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = createEvents([
      { date: '2025-07-01', startTime: '10:00', notificationTime: 1 },
      { date: '2025-07-01', startTime: '14:00', notificationTime: 5 },
    ]);

    const now = new Date('2025-07-01T09:58:00');
    const notifiedEvents: string[] = [];

    const expected: Event[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = createEvents([
      { date: '2025-07-01', startTime: '10:00', notificationTime: 1 },
      { date: '2025-07-01', startTime: '14:00', notificationTime: 5 },
    ]);

    const now = new Date('2025-07-01T10:01:00');
    const notifiedEvents: string[] = [];

    const expected: Event[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = createEvent({
      title: '알림 이벤트',
      notificationTime: 1,
    });

    const expected = '1분 후 알림 이벤트 일정이 시작됩니다.';

    const result = createNotificationMessage(event);

    expect(result).toBe(expected);
  });
});
