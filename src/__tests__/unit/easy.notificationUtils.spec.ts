import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const EVENTS: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-08-20',
      startTime: '09:00',
      endTime: '10:00',
      description: '9시~10시회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '10시~11시회의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ];

  const NOTIFIED_EVENTS: string[] = ['2'];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const baseTime = new Date('2025-08-20T08:50');
    const result = getUpcomingEvents(EVENTS, baseTime, []);
    expect(result).toEqual([EVENTS[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const baseTime = new Date('2025-08-20T09:50');
    const result = getUpcomingEvents(EVENTS, baseTime, NOTIFIED_EVENTS);
    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const baseTime = new Date('2025-08-20T08:40');
    const result = getUpcomingEvents(EVENTS, baseTime, []);
    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const baseTime = new Date('2025-08-20T09:11');
    const result = getUpcomingEvents(EVENTS, baseTime, []);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  const EVENT: Event = {
    id: '1',
    title: '이벤트 1',
    date: '2025-08-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '9시~10시회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result = createNotificationMessage(EVENT);
    expect(result).toEqual(`${EVENT.notificationTime}분 후 ${EVENT.title} 일정이 시작됩니다.`);
  });
});
