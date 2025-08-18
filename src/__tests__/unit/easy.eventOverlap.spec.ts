import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2025-07-01', '14:30');
    expect(date.toISOString()).toBe('2025-07-01T14:30:00.000Z');
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('20250701', '14:30');

    expect(Number.isNaN(date.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-01', '14=30');

    expect(Number.isNaN(date.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '');

    expect(Number.isNaN(date.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트1',
      date: '2025-07-03',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const dateRange = convertEventToDateRange(event);

    expect(dateRange.start.toISOString()).toBe('2025-07-03T10:00:00.000Z');
    expect(dateRange.end.toISOString()).toBe('2025-07-03T11:00:00.000Z');
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트1',
      date: '20250703',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const dateRange = convertEventToDateRange(event);
    expect(Number.isNaN(dateRange.start.getTime())).toBe(true);
    expect(Number.isNaN(dateRange.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트1',
      date: '2025-07-03',
      startTime: '1000',
      endTime: '11=00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const dateRange = convertEventToDateRange(event);
    expect(Number.isNaN(dateRange.start.getTime())).toBe(true);
    expect(Number.isNaN(dateRange.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '테스트1',
      date: '2025-07-03',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const event2: Event = {
      id: '1',
      title: '테스트1',
      date: '2025-07-03',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const isOverlap = isOverlapping(event1, event2);

    expect(isOverlap).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '테스트1',
      date: '2025-07-03',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const event2: Event = {
      id: '1',
      title: '테스트1',
      date: '2025-07-04',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const isOverlap = isOverlapping(event1, event2);

    expect(isOverlap).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '1',
      title: '테스트1',
      date: '2025-07-03',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const events: Event[] = [
      {
        id: '1',
        title: '테스트1',
        date: '2025-07-03',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '테스트2',
        date: '2025-07-03',
        startTime: '10:30',
        endTime: '11:30',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '테스트3',
        date: '2025-07-04',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, events);

    expect(overlappingEvents).toHaveLength(1);
    expect(overlappingEvents[0].id).toBe('2');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '4',
      title: '테스트4',
      date: '2025-07-05',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const events: Event[] = [
      {
        id: '1',
        title: '테스트1',
        date: '2025-07-03',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '테스트2',
        date: '2025-07-03',
        startTime: '10:30',
        endTime: '11:30',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '테스트3',
        date: '2025-07-04',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, events);

    expect(overlappingEvents).toHaveLength(0);
  });
});
