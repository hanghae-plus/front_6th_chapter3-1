import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const testDate = new Date('2025-08-22T09:40');

  it('알림을 보내야 할 정확한 시점의 이벤트를 반환한다', () => {
    const events: Partial<Event>[] = [
      { id: '1', date: '2025-08-22', startTime: '10:00', endTime: '11:00', notificationTime: 20 },
      { id: '2', date: '2025-08-22', startTime: '11:30', endTime: '11:40', notificationTime: 5 },
      { id: '3', date: '2025-08-22', startTime: '13:00', endTime: '14:00', notificationTime: 21 },
    ];
    const result = getUpcomingEvents(events as Event[], testDate, []);
    expect(result).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events: Partial<Event>[] = [
      { id: '1', date: '2025-08-21', startTime: '10:00', endTime: '11:00', notificationTime: 20 },
      { id: '2', date: '2025-08-21', startTime: '11:30', endTime: '11:40', notificationTime: 5 },
      { id: '3', date: '2025-08-22', startTime: '10:00', endTime: '11:00', notificationTime: 21 },
      { id: '4', date: '2025-08-25', startTime: '03:00', endTime: '04:13', notificationTime: 3930 },
    ];
    const result = getUpcomingEvents(events as Event[], testDate, []);
    expect(result).toEqual([events[2], events[3]]);
  });

  it('아직 알림을 보낼 시간이 되지 않은 이벤트는 반환하지 않는다', () => {
    const events: Partial<Event>[] = [
      { id: '1', date: '2025-08-22', startTime: '10:00', endTime: '11:00', notificationTime: 20 },
      { id: '2', date: '2025-08-22', startTime: '11:30', endTime: '11:40', notificationTime: 5 },
      { id: '3', date: '2025-08-22', startTime: '13:00', endTime: '14:00', notificationTime: 21 },
    ];
    const result = getUpcomingEvents(events as Event[], testDate, []);
    expect(result).toEqual([events[0]]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events: Partial<Event>[] = [
      { id: '1', date: '2025-08-22', startTime: '10:00', endTime: '11:00', notificationTime: 20 },
      { id: '2', date: '2025-08-22', startTime: '11:30', endTime: '11:40', notificationTime: 112 },
      { id: '3', date: '2025-08-22', startTime: '13:00', endTime: '14:00', notificationTime: 201 },
      { id: '4', date: '2025-08-22', startTime: '08:00', endTime: '08:10', notificationTime: -100 },
      { id: '5', date: '2025-08-22', startTime: '18:00', endTime: '18:10', notificationTime: 501 },
    ];
    const result = getUpcomingEvents(events as Event[], testDate, ['1', '4']);
    expect(result).toEqual([events[1], events[2], events[4]]);
  });
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
