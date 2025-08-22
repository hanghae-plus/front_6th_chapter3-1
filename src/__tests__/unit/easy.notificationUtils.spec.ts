import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { minutesBefore } from '../utils/date';
import { buildEvent, getEventStartDate } from '../utils/event';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events: Event[] = [buildEvent()];
    const eventStart = getEventStartDate(events[0]);
    const now = minutesBefore(eventStart, events[0].notificationTime);

    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events: Event[] = [buildEvent()];
    const eventStart = getEventStartDate(events[0]);
    const now = minutesBefore(eventStart, events[0].notificationTime);

    const notifiedEvents: string[] = [events[0].id];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [buildEvent()];
    const eventStart = getEventStartDate(events[0]);
    const now = minutesBefore(eventStart, events[0].notificationTime + 1);
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [buildEvent()];
    const eventStart = getEventStartDate(events[0]);
    const now = new Date(eventStart.getTime());
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = buildEvent({ title: '회의', notificationTime: 10 });
    const message = createNotificationMessage(event);
    expect(message).toBe('10분 후 회의 일정이 시작됩니다.');
  });
});
