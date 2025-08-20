import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const notificationEvent = {
      id: '1',
      date: '2025-08-19',
      startTime: '16:00',
      notificationTime: 10,
    } as Event;

    const eventStartTime = new Date(`${notificationEvent.date}T${notificationEvent.startTime}`);
    const now = new Date(eventStartTime.getTime() - notificationEvent.notificationTime * 60000);

    const result = getUpcomingEvents([notificationEvent], now, []);
    const eventIndex = result.findIndex((event) => event.id === notificationEvent.id);

    expect(result[eventIndex]).toEqual({
      id: '1',
      date: '2025-08-19',
      startTime: '16:00',
      notificationTime: 10,
    });
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const alreadyNotificatedEvent = {
      id: '1',
      date: '2025-08-19',
      startTime: '16:00',
      notificationTime: 10,
    } as Event;

    const eventStartTime = new Date(
      `${alreadyNotificatedEvent.date}T${alreadyNotificatedEvent.startTime}`
    );
    const now = new Date(
      eventStartTime.getTime() - alreadyNotificatedEvent.notificationTime * 60000
    );

    const result = getUpcomingEvents([alreadyNotificatedEvent], now, [alreadyNotificatedEvent.id]);

    expect(result.length).toEqual(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const notCommingEvent = {
      id: '1',
      date: '2025-08-19',
      startTime: '16:00',
      notificationTime: 10,
    } as Event;

    const eventStartTime = new Date(`${notCommingEvent.date}T${notCommingEvent.startTime}`);
    const beforeEventStartTime = eventStartTime.getTime() - 60000 * 10;
    const now = new Date(beforeEventStartTime - notCommingEvent.notificationTime * 60000);

    const result = getUpcomingEvents([notCommingEvent], now, []);

    expect(result.length).toEqual(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const passedEvent = {
      id: '1',
      date: '2025-08-19',
      startTime: '16:00',
      notificationTime: 10,
    } as Event;

    const eventStartTime = new Date(`${passedEvent.date}T${passedEvent.startTime}`);
    const afterEventStartItme = eventStartTime.getTime() + 60000 * 10;
    const now = new Date(afterEventStartItme - passedEvent.notificationTime * 60000);

    const result = getUpcomingEvents([passedEvent], now, []);

    expect(result.length).toEqual(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = {
      title: '모각코',
      notificationTime: 10,
    } as Event;

    const result = createNotificationMessage(event);
    expect(result).toBe(`${event.notificationTime}분 후 ${event.title} 일정이 시작됩니다.`);
  });
});
