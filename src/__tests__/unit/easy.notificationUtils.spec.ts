import { createEventData } from './factories/eventFactory';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const specificEvents = [
      createEventData({
        id: '1',
        date: '2025-08-20',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 1,
      }),
      createEventData({
        id: '2',
        date: '2025-08-20',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 1,
      }),
    ];
    const events = [
      ...specificEvents,
      createEventData({
        id: '3',
        date: '2025-08-20',
        startTime: '11:00',
        endTime: '12:00',
        notificationTime: 1,
      }),
    ];

    expect(getUpcomingEvents(events, new Date('2025-08-20T09:59'), [])).toEqual(specificEvents);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const specificEvents = [
      createEventData({
        id: '1',
        date: '2025-08-20',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 1,
      }),
    ];
    const events = [
      ...specificEvents,
      createEventData({
        id: '2',
        date: '2025-08-20',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 1,
      }),
      createEventData({
        id: '3',
        date: '2025-08-20',
        startTime: '11:00',
        endTime: '12:00',
        notificationTime: 1,
      }),
    ];

    expect(getUpcomingEvents(events, new Date('2025-08-20T09:59'), ['2'])).toEqual(specificEvents);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = [
      createEventData({
        id: '2',
        date: '2025-08-20',
        startTime: '11:00',
        endTime: '12:00',
        notificationTime: 1,
      }),
    ];

    expect(getUpcomingEvents(events, new Date('2025-08-20T10:00'), [])).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = [
      createEventData({
        id: '1',
        date: '2025-08-20',
        startTime: '09:00',
        endTime: '12:00',
        notificationTime: 1,
      }),
    ];

    expect(getUpcomingEvents(events, new Date('2025-08-20T10:01'), [])).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = createEventData({
      id: '1',
      title: '이벤트 1',
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
      notificationTime: 1,
    });

    expect(createNotificationMessage(event)).toEqual('1분 후 이벤트 1 일정이 시작됩니다.');
  });
});
