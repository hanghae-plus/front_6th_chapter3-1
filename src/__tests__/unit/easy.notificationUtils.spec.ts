import realEvents from '../../__mocks__/response/realEvents.json';
import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const events = realEvents.events as Event[];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const date = new Date('2025-08-20T09:59:00');
    const upcomingEvents: Event[] = getUpcomingEvents(events, date, []);
    const expected: Event[] = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-08-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];
    expect(upcomingEvents).toEqual(expected);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const date = new Date('2025-08-20T09:59:00');
    const notifiedEvents = ['2b7545a6-ebee-426c-b906-2329bc8d62bd'];
    const upcomingEvents: Event[] = getUpcomingEvents(events, date, notifiedEvents);

    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const date = new Date('2025-08-20T09:58:00');
    const upcomingEvents: Event[] = getUpcomingEvents(events, date, []);
    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const date = new Date('2025-08-20T10:05:00');
    const upcomingEvents = getUpcomingEvents(events, date, []);
    expect(upcomingEvents).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  const events = realEvents.events as Event[];

  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = events[0];
    const message = createNotificationMessage(event);
    const expected = '1분 후 팀 회의 일정이 시작됩니다.';
    expect(message).toBe(expected);
  });
});
