import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const events: Event[] = [
  {
    id: 'event-1min',
    title: '1분 전 알림 이벤트',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '1분 전에 알림이 오는 이벤트',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1, // 1분 전 알림
  },
  {
    id: 'event-5min',
    title: '5분 전 알림 이벤트',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '5분 전에 알림이 오는 이벤트',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5, // 5분 전 알림
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-07-01T09:59:00');
    const notifiedEvents: string[] = [];
    const expected = [events[0]];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(1);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-07-01T09:59:00');
    const notifiedEvents = ['event-1min'];
    const expected: Event[] = [];
    
    const result = getUpcomingEvents(events, now, notifiedEvents);
    
    expect(result).toEqual(expected);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T09:58:00');
    const notifiedEvents: string[] = [];
    const expected: Event[] = [];
    
    const result = getUpcomingEvents(events, now, notifiedEvents);
    
    expect(result).toEqual(expected);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
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
    const event = events[0];
    const expected = '1분 후 1분 전 알림 이벤트 일정이 시작됩니다.';
    
    const result = createNotificationMessage(event);
    
    expect(result).toBe(expected);
  });
});
