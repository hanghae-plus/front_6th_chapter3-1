import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { createMockEvent } from '../utils';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-99-31', '14:30')).toEqual(new Date('Invalid Date'));
    expect(parseDateTime('2025-07-99', '14:30')).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '99:30')).toEqual(new Date('Invalid Date'));
    expect(parseDateTime('2025-07-01', '14:99')).toEqual(new Date('Invalid Date'));
    expect(parseDateTime('2025-07-01', '99:99')).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30')).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = createMockEvent(1, {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    });

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('2025-07-01T14:30'),
      end: new Date('2025-07-01T15:30'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const events = [
      createMockEvent(1, {
        date: '2025-99-31',
      }),
      createMockEvent(2, {
        date: '2025-07-99',
      }),
      createMockEvent(3, {
        date: '2025-99-99',
      }),
    ];

    events.forEach((event) => {
      expect(convertEventToDateRange(event)).toEqual({
        start: new Date('Invalid Date'),
        end: new Date('Invalid Date'),
      });
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const eventsStartTime = [
      createMockEvent(1, {
        date: '2025-07-01',
        startTime: '99:30',
        endTime: '15:30',
      }),
      createMockEvent(2, {
        date: '2025-07-01',
        startTime: '14:99',
        endTime: '15:30',
      }),
      createMockEvent(3, {
        date: '2025-07-01',
        startTime: '99:99',
        endTime: '15:30',
      }),
    ];
    const eventsEndTime = [
      createMockEvent(1, {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '99:30',
      }),
      createMockEvent(2, {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '14:99',
      }),
      createMockEvent(3, {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '99:99',
      }),
    ];

    eventsStartTime.forEach((event) => {
      expect(convertEventToDateRange(event)).toEqual({
        start: new Date('Invalid Date'),
        end: new Date(`${event.date}T${event.endTime}`),
      });
    });

    eventsEndTime.forEach((event) => {
      expect(convertEventToDateRange(event)).toEqual({
        start: new Date(`${event.date}T${event.startTime}`),
        end: new Date('Invalid Date'),
      });
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = createMockEvent(1, {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '16:00',
    });
    const event2 = createMockEvent(2, {
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:30',
    });

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createMockEvent(1, {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '16:00',
    });
    const event2 = createMockEvent(2, {
      date: '2025-07-01',
      startTime: '16:30',
      endTime: '17:30',
    });

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const events = [
      createMockEvent(1, {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '16:00',
      }),
      createMockEvent(2, {
        date: '2025-07-01',
        startTime: '17:00',
        endTime: '17:30',
      }),
      createMockEvent(3, {
        date: '2025-07-01',
        startTime: '15:00',
        endTime: '16:00',
      }),
    ];
    const newEvent = createMockEvent(2, {
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:30',
    });

    expect(findOverlappingEvents(newEvent, events)).toEqual([events[0], events[2]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const events = [
      createMockEvent(1, {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '16:00',
      }),
      createMockEvent(2, {
        date: '2025-07-01',
        startTime: '16:30',
        endTime: '17:30',
      }),
    ];
    const newEvent = createMockEvent(2, {
      date: '2025-07-01',
      startTime: '12:30',
      endTime: '13:30',
    });

    expect(findOverlappingEvents(newEvent, events)).toEqual([]);
  });
});
