import { expect } from 'vitest';

import { Event } from '../../types.ts';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const parsedDate = parseDateTime('2025-07-01', '14:30');

    expect(parsedDate).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const parsedDate = parseDateTime('2025-13-01', '14:30');

    expect(isNaN(parsedDate.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const parsedDate = parseDateTime('2025-13-01', '142:300');

    expect(isNaN(parsedDate.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const parsedDate = parseDateTime('', '14:30');

    expect(isNaN(parsedDate.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      date: '2025-08-01',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    const dateRange = convertEventToDateRange(event);

    const expected = {
      start: new Date(2025, 7, 1, 14, 30),
      end: new Date(2025, 7, 1, 15, 30),
    };

    expect(dateRange).toEqual(expected);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      date: '2025-8-1',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    const dateRange = convertEventToDateRange(event);

    expect(Number.isNaN(dateRange.start.getTime())).toBe(true);
    expect(Number.isNaN(dateRange.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      date: '2025-8-1',
      startTime: '14-30',
      endTime: '15-30',
    } as Event;

    const dateRange = convertEventToDateRange(event);

    expect(Number.isNaN(dateRange.start.getTime())).toBe(true);
    expect(Number.isNaN(dateRange.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-08-01',
        startTime: '14:30',
        endTime: '15:30',
      },
      {
        id: '2',
        date: '2025-08-01',
        startTime: '14:30',
        endTime: '15:30',
      },
    ] as Event[];

    const result = isOverlapping(events[0], events[1]);

    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        date: '2025-08-01',
        startTime: '14:30',
        endTime: '15:30',
      },
      {
        id: '2',
        date: '2025-08-05',
        startTime: '08:30',
        endTime: '20:30',
      },
    ] as Event[];

    const result = isOverlapping(events[0], events[1]);

    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      date: '2025-08-01',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    const events: Event[] = [
      {
        id: '1',
        date: '2025-08-01',
        startTime: '14:30',
        endTime: '15:30',
      },
      {
        id: '2',
        date: '2025-08-05',
        startTime: '08:30',
        endTime: '20:30',
      },
    ] as Event[];

    const overlappingEvents = findOverlappingEvents(newEvent, events);

    expect(overlappingEvents).toEqual([events[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      date: '2025-08-03',
      startTime: '02:00',
      endTime: '05:00',
    } as Event;

    const events: Event[] = [
      {
        id: '1',
        date: '2025-08-01',
        startTime: '14:30',
        endTime: '15:30',
      },
      {
        id: '2',
        date: '2025-08-05',
        startTime: '08:30',
        endTime: '20:30',
      },
    ] as Event[];

    const overlappingEvents = findOverlappingEvents(newEvent, events);

    expect(overlappingEvents).toEqual([]);
  });
});
