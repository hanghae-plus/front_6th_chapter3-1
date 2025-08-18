import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

function createTestEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: '1',
    title: 'Test Event',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10, // 기본 10분 전 알림
    ...overrides,
  };
}

describe('getUpcomingEvents', () => {
  it('알림 시간이 도래한 이벤트를 배열로 반환한다', () => {
    const events = [
      createTestEvent({ id: '1', date: '2025-07-01', startTime: '09:00', notificationTime: 10 }),
    ];

    const now = new Date('2025-07-01T08:50:00');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents.map((event) => event.id)).toEqual(['1']);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = [
      createTestEvent({ id: '1', date: '2025-07-01', startTime: '09:00', notificationTime: 10 }),
      createTestEvent({ id: '2', date: '2025-07-01', startTime: '09:00', notificationTime: 10 }),
    ];

    const now = new Date('2025-07-01T08:50:00');
    const notifiedEvents: string[] = ['1'];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents.map((event) => event.id)).toEqual(['2']);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = [
      createTestEvent({ id: '1', date: '2025-07-01', startTime: '09:00', notificationTime: 10 }),
    ];

    const now = new Date('2025-07-01T08:40:00'); // 20분 전
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = [
      createTestEvent({ id: '1', date: '2025-07-01', startTime: '09:00', notificationTime: 10 }),
    ];

    const now = new Date('2025-07-01T09:05:00'); // 5분 지남
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {});
});
