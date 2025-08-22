import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const expectedDate = new Date('2025-07-01T14:30');

    expect(parseDateTime(date, time)).toEqual(expectedDate);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-32';
    const time = '14:30';
    const result = parseDateTime(date, time);

    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = '25:30';
    const result = parseDateTime(date, time);

    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    const result = parseDateTime(date, time);

    expect(result).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = {
      id: '1',
      title: 'Test Event',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '16:00',
      description: '',
      location: '',
    } as Event;

    const expectedRange = {
      start: new Date('2025-07-01T14:30'),
      end: new Date('2025-07-01T16:00'),
    };

    expect(convertEventToDateRange(event)).toEqual(expectedRange);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      id: '2',
      title: 'Invalid Date Event',
      date: '2025-07-32',
      startTime: '14:30',
      endTime: '16:00',
      description: '',
      location: '',
    } as Event;

    const expectedRange = {
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    };

    expect(convertEventToDateRange(event)).toEqual(expectedRange);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      id: '3',
      title: 'Invalid Time Event',
      date: '2025-07-01',
      startTime: '25:30',
      endTime: '26:00',
      description: '',
      location: '',
    } as Event;

    const expectedRange = {
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    };

    expect(convertEventToDateRange(event)).toEqual(expectedRange);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
    } as Event;

    const event2 = {
      id: '2',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
    } as Event;

    const event2 = {
      id: '2',
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:30',
    } as Event;

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = {
      id: '1',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as Event;

    const existingEvents = [
      {
        id: '2',
        date: '2025-07-01',
        startTime: '14:00',
        endTime: '15:00',
      } as Event,
      {
        id: '3',
        date: '2025-07-01',
        startTime: '15:30',
        endTime: '16:30',
      } as Event,
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);
    console.log(overlappingEvents, existingEvents);
    expect(overlappingEvents).toEqual([existingEvents[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = {
      id: '4',
      date: '2025-07-01',
      startTime: '16:30',
      endTime: '17:30',
    } as Event;

    const existingEvents = [
      {
        id: '2',
        date: '2025-07-01',
        startTime: '14:00',
        endTime: '15:00',
      } as Event,
      {
        id: '3',
        date: '2025-07-01',
        startTime: '15:30',
        endTime: '16:30',
      } as Event,
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);
    expect(overlappingEvents).toEqual([]);
  });
});
