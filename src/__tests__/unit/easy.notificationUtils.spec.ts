import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '오전 회의',
    date: '2025-07-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('getUpcomingEvents', () => {
  describe('알림 시간이 도래한 이벤트', () => {
    test('오전 회의(09:00 시작, 10분 전 알림)가 08:50에 알림 대상으로 반환된다', () => {
      const now = new Date('2025-07-15T08:50:00');
      const upcomingEvents = getUpcomingEvents(mockEvents, now, []);
      expect(upcomingEvents).toEqual([mockEvents[0]]);
    });
  });

  describe('이미 알림이 간 이벤트 제외', () => {
    test('이미 알림이 간 오전 회의는 알림 대상에서 제외된다', () => {
      const now = new Date('2025-07-15T08:50:00');
      const notifiedEvents = ['1'];
      const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
      expect(upcomingEvents).toEqual([]);
    });
  });

  describe('알림 시간이 아직 도래하지 않은 이벤트', () => {
    test('오전 회의 알림 시간(08:50) 이전인 08:40에는 알림 대상이 없다', () => {
      const now = new Date('2025-07-15T08:40:00');
      const upcomingEvents = getUpcomingEvents(mockEvents, now, []);
      expect(upcomingEvents).toEqual([]);
    });
  });

  describe('알림 시간이 지난 이벤트', () => {
    test('오전 회의 알림 시간(08:50) 이후인 09:00에는 알림 대상이 없다', () => {
      const now = new Date('2025-07-15T09:00:00');
      const upcomingEvents = getUpcomingEvents(mockEvents, now, []);
      expect(upcomingEvents).toEqual([]);
    });
  });
});

describe('createNotificationMessage', () => {
  test('올바른 알림 메시지를 생성해야 한다', () => {
    const event = mockEvents[0];
    const message = createNotificationMessage(event);
    expect(message).toBe('10분 후 오전 회의 일정이 시작됩니다.');
  });
});
