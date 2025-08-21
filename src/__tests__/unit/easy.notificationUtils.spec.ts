import type { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-08-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-08-20T09:50:00');
    const upcomingEvents = getUpcomingEvents(mockEvents, now, []);

    expect(upcomingEvents).toEqual(mockEvents);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-08-20T09:50:00');
    const upcomingEvents = getUpcomingEvents(mockEvents, now, ['1']);

    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-08-20T09:30:00');
    const upcomingEvents = getUpcomingEvents(mockEvents, now, []);

    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-08-20T10:00:00');
    const upcomingEvents = getUpcomingEvents(mockEvents, now, []);

    expect(upcomingEvents).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const [mockEvent] = mockEvents;
    const notificationMessage = createNotificationMessage(mockEvent);

    expect(notificationMessage).toBe('10분 후 팀 회의 일정이 시작됩니다');
  });
});
