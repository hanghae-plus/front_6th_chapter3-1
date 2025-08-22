import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = [
      {
        id: '1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 10,
      },
      {
        id: '2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        notificationTime: 10,
      },
      {
        id: '3',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00',
        notificationTime: 10,
      },
    ] as Event[];

    const upcomingEvents = getUpcomingEvents(events, new Date('2025-07-01 10:50'), []);
    expect(upcomingEvents).toEqual([events[1]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = [
      {
        id: '1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 10,
      },
      {
        id: '2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        notificationTime: 10,
      },
      {
        id: '3',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00',
        notificationTime: 10,
      },
    ] as Event[];

    const upcomingEvents = getUpcomingEvents(events, new Date('2025-07-01 09:55'), ['1']);
    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = [
      {
        id: '1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 10,
      },
      {
        id: '2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        notificationTime: 10,
      },
      {
        id: '3',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00',
        notificationTime: 10,
      },
    ] as Event[];

    const upcomingEvents = getUpcomingEvents(events, new Date('2025-07-01 09:00'), []);
    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = [
      {
        id: '1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 10,
      },
      {
        id: '2',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        notificationTime: 10,
      },
      {
        id: '3',
        date: '2025-07-01',
        startTime: '12:00',
        endTime: '13:00',
        notificationTime: 10,
      },
    ] as Event[];

    const upcomingEvents = getUpcomingEvents(events, new Date('2025-07-01 13:30'), []);
    expect(upcomingEvents).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = {
      title: '이벤트 1',
      notificationTime: 10,
    } as Event;

    const message = createNotificationMessage(event);
    expect(message).toBe('10분 후 이벤트 1 일정이 시작됩니다.');
  });
});
