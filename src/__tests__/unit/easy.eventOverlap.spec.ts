import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { createEventForm, createEvents } from '../eventFactory';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const expected = new Date('2025-07-01T14:30');

    const result = parseDateTime(date, time);

    expect(result).toEqual(expected);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '20251301';
    const time = '14:30';
    const expected = new Date('Invalid Date');

    const result = parseDateTime(date, time);

    expect(result).toEqual(expected);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = '25:30';
    const expected = new Date('Invalid Date');

    const result = parseDateTime(date, time);

    expect(result).toEqual(expected);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    const expected = new Date('Invalid Date');

    const result = parseDateTime(date, time);

    expect(result).toEqual(expected);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: EventForm = createEventForm({
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
    });

    const expected = {
      start: new Date('2025-08-20T10:00'),
      end: new Date('2025-08-20T11:00'),
    };

    const result = convertEventToDateRange(event);

    expect(result).toEqual(expected);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = createEventForm({
      date: '20250820',
      startTime: '10:00',
      endTime: '11:00',
    });

    const expected = {
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    };

    const result = convertEventToDateRange(event);

    expect(result).toEqual(expected);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: EventForm = createEventForm({
      date: '2025-08-20',
      startTime: '25:00',
      endTime: '26:00',
    });

    const expected = {
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    };

    const result = convertEventToDateRange(event);

    expect(result).toEqual(expected);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: EventForm = createEventForm({
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
    });

    const event2: EventForm = createEventForm({
      date: event1.date,
      startTime: '10:30',
      endTime: '11:30',
    });

    const expected = true;

    const result = isOverlapping(event1, event2);

    expect(result).toEqual(expected);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: EventForm = createEventForm({
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
    });

    const event2: EventForm = createEventForm({
      date: event1.date,
      startTime: '11:30',
      endTime: '12:30',
    });

    const expected = false;

    const result = isOverlapping(event1, event2);

    expect(result).toEqual(expected);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: EventForm = createEventForm({
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
    });

    const events = createEvents([
      {
        date: newEvent.date,
        startTime: '09:30',
        endTime: '10:30',
      },
      {
        date: newEvent.date,
        startTime: '10:30',
        endTime: '11:30',
      },
      {
        date: newEvent.date,
        startTime: '12:00',
        endTime: '13:00',
      },
    ]);

    const expected: Event[] = events.filter((event) => isOverlapping(newEvent, event));

    const result = findOverlappingEvents(newEvent, events);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(2);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: EventForm = createEventForm({
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
    });

    const events = createEvents([
      {
        date: newEvent.date,
        startTime: '06:30',
        endTime: '07:30',
      },
      {
        date: newEvent.date,
        startTime: '12:00',
        endTime: '13:00',
      },
    ]);

    const expected: Event[] = [];

    const result = findOverlappingEvents(newEvent, events);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(0);
  });
});
