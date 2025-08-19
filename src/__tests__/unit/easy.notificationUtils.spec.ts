import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const dummyEvent = {
      id: '1',
      date: '2025-08-19',
      startTime: '16:00',
      notificationTime: 10,
    } as Event;

    const eventStartTime = new Date(`${dummyEvent.date}T${dummyEvent.startTime}`);
    const now = new Date(eventStartTime.getTime() - dummyEvent.notificationTime * 60000);

    const result = getUpcomingEvents([dummyEvent], now, []);
    const eventIndex = result.findIndex((event) => event.id === dummyEvent.id);

    expect(result[eventIndex]).toEqual(dummyEvent);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const dummyEvent = {
      id: '1',
      date: '2025-08-19',
      startTime: '16:00',
      notificationTime: 10,
    } as Event;

    const eventStartTime = new Date(`${dummyEvent.date}T${dummyEvent.startTime}`);
    const now = new Date(eventStartTime.getTime() - dummyEvent.notificationTime * 60000);

    const result = getUpcomingEvents([dummyEvent], now, [dummyEvent.id]);

    expect(result.length).toEqual(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const dummyEvent = {
      id: '1',
      date: '2025-08-19',
      startTime: '16:00',
      notificationTime: 10,
    } as Event;

    const eventStartTime = new Date(`${dummyEvent.date}T${dummyEvent.startTime}`);
    const beforeEventStartTime = eventStartTime.getTime() - 60000 * 10;
    const now = new Date(beforeEventStartTime - dummyEvent.notificationTime * 6000);

    const result = getUpcomingEvents([dummyEvent], now, []);

    expect(result.length).toEqual(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const dummyEvent = {
      id: '1',
      date: '2025-08-19',
      startTime: '16:00',
      notificationTime: 10,
    } as Event;

    const eventStartTime = new Date(`${dummyEvent.date}T${dummyEvent.startTime}`);
    const afterEventStartItme = eventStartTime.getTime() + 60000 * 10;
    const now = new Date(afterEventStartItme - dummyEvent.notificationTime * 60000);

    const result = getUpcomingEvents([dummyEvent], now, []);

    expect(result.length).toEqual(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const dummyEvent = {
      title: '모각코',
      notificationTime: 10,
    } as Event;

    const result = createNotificationMessage(dummyEvent);
    expect(result).toBe(
      `${dummyEvent.notificationTime}분 후 ${dummyEvent.title} 일정이 시작됩니다.`
    );
  });
});
