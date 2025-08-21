import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { dummyEvent } from '../data/dummy';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-0', '14:30')).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-0', '14:3')).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30')).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      ...dummyEvent,
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    };

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('2025-07-01T14:30'),
      end: new Date('2025-07-01T15:30'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      ...dummyEvent,
      date: '2025-07-0',
      startTime: '14:30',
      endTime: '15:30',
    };

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      ...dummyEvent,
      date: '2025-07-0',
      startTime: '14:3',
      endTime: '15:30',
    };

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  let event1: Event;
  let event2: Event;
  let event3: Event;

  beforeEach(() => {
    event1 = {
      ...dummyEvent,
      date: '2025-08-15',
      startTime: '14:00',
      endTime: '15:00',
    };
    event2 = {
      ...dummyEvent,
      date: '2025-08-15',
      startTime: '14:30',
      endTime: '15:30',
    };
    event3 = {
      ...dummyEvent,
      date: '2025-08-15',
      startTime: '16:00',
      endTime: '17:00',
    };
  });

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(isOverlapping(event1, event3)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  let events: Event[];

  beforeEach(() => {
    events = [
      {
        ...dummyEvent,
        id: 'event-1',
        date: '2025-08-15',
        startTime: '14:00',
        endTime: '15:00',
      },

      {
        ...dummyEvent,
        id: 'event-2',
        date: '2025-08-15',
        startTime: '16:00',
        endTime: '17:00',
      },
    ];
  });

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = {
      ...dummyEvent,
      id: 'new-event',
      date: '2025-08-15',
      startTime: '14:30',
      endTime: '15:30',
    };

    expect(findOverlappingEvents(newEvent, events)).toEqual([events[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = {
      ...dummyEvent,
      id: 'new-event',
      date: '2025-08-15',
      startTime: '17:00',
      endTime: '18:00',
    };

    expect(findOverlappingEvents(newEvent, events)).toEqual([]);
  });
});
