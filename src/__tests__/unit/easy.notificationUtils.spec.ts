import { expect } from 'vitest';

import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '알림 1',
        date: '2025-08-20',
        startTime: '14:15',
        notificationTime: 15,
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '알림 2',
        date: '2025-08-20',
        startTime: '16:00',
        notificationTime: 10,
        description: '이벤트',
        location: '회사',
      },
    ] as Event[];

    const now = new Date('2025-08-20T14:00:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([
      {
        id: '1',
        title: '알림 1',
        date: '2025-08-20',
        startTime: '14:15',
        notificationTime: 15,
        description: '이벤트',
        location: '회사',
      },
    ]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이미 보낸 알림',
        date: '2025-08-20',
        startTime: '14:15',
        notificationTime: 15,
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '아직 보내지 않은 알림',
        date: '2025-08-20',
        startTime: '14:15',
        notificationTime: 10,
        description: '이벤트',
        location: '회사',
      },
    ] as Event[];

    const now = new Date('2025-08-20T14:05:00');
    const notifiedEvents: string[] = ['1'];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([
      {
        id: '2',
        title: '아직 보내지 않은 알림',
        date: '2025-08-20',
        startTime: '14:15',
        notificationTime: 10,
        description: '이벤트',
        location: '회사',
      },
    ]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '알림 1',
        date: '2025-08-20',
        startTime: '15:15',
        notificationTime: 15,
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '알림 2',
        date: '2025-08-20',
        startTime: '16:00',
        notificationTime: 10,
        description: '이벤트',
        location: '회사',
      },
    ] as Event[];

    const now = new Date('2025-08-20T14:00:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '알림 1',
        date: '2025-08-20',
        startTime: '14:15',
        notificationTime: 15,
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '알림 2',
        date: '2025-08-20',
        startTime: '14:00',
        notificationTime: 10,
        description: '이벤트',
        location: '회사',
      },
    ] as Event[];

    const now = new Date('2025-08-20T14:30:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '알림 1',
      date: '2025-08-20',
      startTime: '14:15',
      notificationTime: 15,
      description: '이벤트',
      location: '회사',
    } as Event;

    const notificationMessage = createNotificationMessage(event);

    expect(notificationMessage).toBe('15분 후 알림 1 일정이 시작됩니다.');
  });
});
