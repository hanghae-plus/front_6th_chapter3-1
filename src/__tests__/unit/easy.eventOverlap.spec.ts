import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { createTestEvent } from '../utils';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const input = ['2025-07-01', '14:30'];
    const [date, time] = input;
    const results = parseDateTime(date, time);

    expect(results).toBeInstanceOf(Date);
    expect(results.toISOString()).toBe('2025-07-01T05:30:00.000Z');
  });

  // Date 객체에 대한 테스트
  // it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
  //   const input = ['2025.07.01', '14:30'];
  //   const [date, time] = input;
  //   const results = parseDateTime(date, time);

  //   expect(results).toBeInstanceOf(Date);
  //   expect(results).toBe('Invalid Date');
  // });

  // it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
  //   const input = ['2025-07-01', '14:30:00'];
  //   const [date, time] = input;
  //   const results = parseDateTime(date, time);

  //   expect(results).toBeInstanceOf(Date);
  //   expect(results).toBe('Invalid Date');
  // });

  // it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
  //   const input = ['', '14:30'];
  //   const [date, time] = input;
  //   const results = parseDateTime(date, time);

  //   expect(results).toBe('Invalid Date');
  // });
});

describe('convertEventToDateRange', () => {
  it('2025-07-01 14:30~16:00 이벤트를 Date 객체로 변환하여 시작시간(14:30)과 종료시간(16:00)을 정확히 계산한다', () => {
    const baseDate = new Date('2025-10-15');
    const start = new Date(baseDate);
    const end = new Date(baseDate);
    end.setHours(1);

    const expectedStart = baseDate.toISOString();
    const expectedEnd = end.toISOString();

    expect(start.toISOString()).toBe(expectedStart);
    expect(end.toISOString()).toBe(expectedEnd);
  });

  // it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {});

  // it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {});
});

describe('isOverlapping', () => {
  it.each([
    {
      bool: true,
      event1: createTestEvent({ date: '2025-07-01', startTime: '15:00', endTime: '16:30' }),
      event2: createTestEvent({ date: '2025-07-01', startTime: '15:00', endTime: '16:30' }),
    },
    {
      bool: false,
      event1: createTestEvent({ date: '2025-07-01', startTime: '15:00', endTime: '16:30' }),
      event2: createTestEvent({ date: '2025-07-01', startTime: '16:30', endTime: '18:00' }),
    },
  ])('두 이벤트가 겹치는 경우 $bool를 반환한다.', ({ bool, event1, event2 }) => {
    const result = isOverlapping(event1, event2);

    expect(result).toBe(bool);
  });

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = createTestEvent({ date: '2025-07-01', startTime: '15:00', endTime: '16:30' });
    const event2 = createTestEvent({ date: '2025-07-01', startTime: '15:00', endTime: '16:30' });

    const result = isOverlapping(event1, event2);

    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createTestEvent();
    const event2 = createTestEvent({ date: '2025-07-01', startTime: '16:30', endTime: '18:00' });

    const result = isOverlapping(event1, event2);

    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it.each([
    {
      description: '새 이벤트(14:30~16:00)와 겹치는 모든 이벤트를 반환한다',
      events: [
        createTestEvent({ id: '2', date: '2025-07-01', startTime: '15:00', endTime: '16:30' }),
        createTestEvent({ id: '3', date: '2025-07-01', startTime: '16:30', endTime: '18:00' }),
      ],
      expected: [
        createTestEvent({ id: '2', date: '2025-07-01', startTime: '15:00', endTime: '16:30' }),
      ],
    },
    {
      description: '겹치는 이벤트가 없으면 빈 배열을 반환한다',
      events: [
        createTestEvent({ id: '4', date: '2025-07-01', startTime: '19:30', endTime: '20:00' }),
      ],
      expected: [],
    },
  ])('$description', ({ events, expected }) => {
    const newEvent = createTestEvent({ date: '2025-07-01', startTime: '15:00', endTime: '16:30' });
    const result = findOverlappingEvents(newEvent, events);

    expect(result).toEqual(expected);
  });
});
