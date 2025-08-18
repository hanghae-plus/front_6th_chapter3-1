import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { createTestEvents } from '../utils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 도래한 이벤트를 배열로 반환한다', () => {
    const events = createTestEvents([
      { id: '1', date: '2025-07-01', startTime: '09:00', notificationTime: 10 },
    ]);

    const now = new Date('2025-07-01T08:50:00');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents.map((event) => event.id)).toEqual(['1']);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = createTestEvents([
      { id: '1', date: '2025-07-01', startTime: '09:00', notificationTime: 10 },
      { id: '2', date: '2025-07-01', startTime: '09:00', notificationTime: 10 },
    ]);

    const now = new Date('2025-07-01T08:50:00');
    const notifiedEvents: string[] = ['1'];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents.map((event) => event.id)).toEqual(['2']);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = createTestEvents([
      { id: '1', date: '2025-07-01', startTime: '09:00', notificationTime: 10 },
    ]);

    const now = new Date('2025-07-01T08:40:00'); // 20분 전
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = createTestEvents([
      { id: '1', date: '2025-07-01', startTime: '09:00', notificationTime: 10 },
    ]);

    const now = new Date('2025-07-01T09:05:00'); // 5분 지남
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const [event] = createTestEvents([
      {
        id: '1',
        title: '팀 회의',
        notificationTime: 10,
      },
    ]);

    const notificationMessage = createNotificationMessage(event);

    expect(notificationMessage).toBe('10분 후 팀 회의 일정이 시작됩니다.');
  });
});
