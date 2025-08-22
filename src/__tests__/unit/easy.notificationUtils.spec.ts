import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const event1: Event = {
    id: '1',
    title: '이벤트1',
    description: '이벤트설명',
    category: '카테고리1',
    date: '2025-08-19',
    startTime: '09:30',
    endTime: '14:30',
    location: '어딘가',
    notificationTime: 30,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  const event2: Event = {
    id: '2',
    title: '이벤트2',
    description: '이벤트설명',
    category: '카테고리1',
    date: '2025-08-21',
    startTime: '09:00',
    endTime: '14:30',
    location: '어딘가',
    notificationTime: 30,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  const event3: Event = {
    id: '3',
    title: '이벤트3',
    description: '이벤트설명',
    category: '카테고리1',
    date: '2025-08-21',
    startTime: '09:00',
    endTime: '14:30',
    location: '어딘가',
    notificationTime: 30,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  const events = [event1, event2, event3];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(events, new Date('2025-08-19T09:00'), [])).toEqual([event1]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(getUpcomingEvents(events, new Date('2025-08-19T09:00'), [event1.id])).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2025-10-19T09:00'), [])).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2025-03-19T09:00'), [])).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  const event1: Event = {
    id: '',
    title: '이벤트 2',
    description: '이벤트설명',
    category: '카테고리1',
    date: '2025-08-21',
    startTime: '09:00',
    endTime: '14:30',
    location: '어딘가',
    notificationTime: 30,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  it('올바른 알림 메시지를 생성해야 한다', () => {
    expect(createNotificationMessage(event1)).toBe(
      `${event1.notificationTime}분 후 ${event1.title} 일정이 시작됩니다.`
    );
  });
});
