import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { dummyEvent } from '../data/dummy';

describe('getUpcomingEvents', () => {
  let events: Event[];
  let event1: Event;
  let event2: Event;
  let event3: Event;
  let event4: Event;
  let event5: Event;
  let now: Date;

  beforeEach(() => {
    event1 = {
      ...dummyEvent,
      id: '1',
      title: '미팅',
      date: '2025-08-15',
      startTime: '10:00',
      notificationTime: 10,
    };
    event2 = {
      ...dummyEvent,
      id: '2',
      title: '점심 약속',
      date: '2025-08-15',
      startTime: '12:00',
      notificationTime: 30,
    };
    event3 = {
      ...dummyEvent,
      id: '3',
      title: '회의',
      date: '2025-08-15',
      startTime: '14:00',
      notificationTime: 5,
    };
    event4 = {
      ...dummyEvent,
      id: '4',
      title: '저녁 약속',
      date: '2025-08-15',
      startTime: '18:00',
      notificationTime: 60,
    };
    event5 = {
      ...dummyEvent,
      id: '5',
      title: '티타임',
      date: '2025-08-15',
      startTime: '11:50',
      notificationTime: 30,
    };

    events = [event1, event2, event3, event4, event5];

    now = new Date('2025-08-15T09:50:00');
  });

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([event1]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const notifiedEvents = ['1'];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-08-15T09:30:00'); // event1 시작 40분 전 (알림 시간은 10분 전)
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-08-15T10:05:00'); // event1 시작 5분 후 (알림 시간은 10분 전)
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('여러 이벤트의 알림 시간이 동시에 도래한 경우 모두 반환한다', () => {
    const now = new Date('2025-08-15T11:40:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([event2, event5]);
  });

  it('알림 시간이 정확히 일치하는 이벤트만 반환한다', () => {
    const now = new Date('2025-08-15T13:55:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([event3]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents([], now, notifiedEvents);

    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      ...dummyEvent,
      title: '중요한 미팅',
      notificationTime: 15,
    };

    const result = createNotificationMessage(event);

    expect(result).toBe('15분 후 중요한 미팅 일정이 시작됩니다.');
  });

  it('다양한 알림 시간에 대해 올바른 메시지를 생성한다', () => {
    const event1: Event = {
      ...dummyEvent,
      title: '5분 전 알림',
      notificationTime: 5,
    };
    const event2: Event = {
      ...dummyEvent,
      title: '60분 전 알림',
      notificationTime: 60,
    };

    const result1 = createNotificationMessage(event1);
    const result2 = createNotificationMessage(event2);

    expect(result1).toBe('5분 후 5분 전 알림 일정이 시작됩니다.');
    expect(result2).toBe('60분 후 60분 전 알림 일정이 시작됩니다.');
  });

  it('특수 문자가 포함된 제목에 대해서도 올바른 메시지를 생성한다', () => {
    const event: Event = {
      ...dummyEvent,
      title: '미팅 (회의실 A)',
      notificationTime: 10,
    };

    const result = createNotificationMessage(event);

    expect(result).toBe('10분 후 미팅 (회의실 A) 일정이 시작됩니다.');
  });
});
