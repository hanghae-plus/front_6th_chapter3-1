import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const notifiedEvents: string[] = ['1', '3'];
  const events: Partial<Event>[] = [
    { id: '1', date: '2025-08-21', startTime: '10:00', endTime: '11:00', notificationTime: 20 },
    { id: '2', date: '2025-08-21', startTime: '11:30', endTime: '11:40', notificationTime: 5 },
    { id: '3', date: '2025-08-22', startTime: '10:00', endTime: '11:00', notificationTime: 10 },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {});

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const result = getUpcomingEvents(
      events as Event[],
      new Date('2025-08-21T09:40'),
      notifiedEvents
    );
    expect(result).toEqual([events[1]]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {});

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {});
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Partial<Event> = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 이벤트 설명',
      notificationTime: 10,
    };
    const result = createNotificationMessage(event as Event);
    expect(result).toBe('10분 후 테스트 이벤트 일정이 시작됩니다.');
  });
});
