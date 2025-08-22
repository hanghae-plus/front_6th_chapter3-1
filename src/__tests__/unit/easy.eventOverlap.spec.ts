import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2025-07-01', '14:30');
    expect(date).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const cases = [
      { date: '2025-13-01', time: '14:12' },
      { date: '2025-12-32', time: '14:12' },
    ];
    cases.forEach(({ date, time }) => {
      const result = parseDateTime(date, time);
      expect(result).toEqual(new Date('Invalid Date'));
    });
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const cases = [
      { date: '2025-07-01', time: '14:72' },
      { date: '2025-07-01', time: '25:12' },
    ];
    cases.forEach(({ date, time }) => {
      const result = parseDateTime(date, time);
      expect(result).toEqual(new Date('Invalid Date'));
    });
  });

  it('날짜 또는 시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const cases = [
      { date: '', time: '14:12' },
      { date: '2025-07-01', time: '' },
    ];
    cases.forEach(({ date, time }) => {
      const result = parseDateTime(date, time);
      expect(result).toEqual(new Date('Invalid Date'));
    });
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Partial<EventForm> = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    };
    const result = convertEventToDateRange(event as EventForm);
    expect(result).toEqual({
      start: new Date('2025-07-01T14:30'),
      end: new Date('2025-07-01T15:30'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Partial<EventForm> = {
      date: '2025-13-01',
      startTime: '14:30',
      endTime: '15:30',
    };
    const result = convertEventToDateRange(event as EventForm);
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Partial<EventForm> = {
      date: '2025-12-01',
      startTime: '14:70',
      endTime: '15:00',
    };
    const result = convertEventToDateRange(event as EventForm);
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('2025-12-01T15:00'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Partial<EventForm> = {
      date: '2025-12-01',
      startTime: '14:20',
      endTime: '15:00',
    };
    const event2: Partial<EventForm> = {
      date: '2025-12-01',
      startTime: '14:30',
      endTime: '14:50',
    };
    const result = isOverlapping(event1 as EventForm, event2 as EventForm);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Partial<EventForm> = {
      date: '2025-12-01',
      startTime: '14:20',
      endTime: '15:00',
    };
    const event2: Partial<EventForm> = {
      date: '2025-12-01',
      startTime: '15:05',
      endTime: '15:10',
    };
    const result = isOverlapping(event1 as EventForm, event2 as EventForm);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 이벤트를 반환한다', () => {
    const newEvent: Partial<Event> = {
      id: '1',
      date: '2025-12-01',
      startTime: '14:30',
      endTime: '14:50',
    };
    const events: Partial<Event>[] = [
      {
        id: '2',
        date: '2025-12-01',
        startTime: '14:20',
        endTime: '14:40',
      },
    ];
    const result = findOverlappingEvents(newEvent as Event, events as Event[]);
    expect(result).toEqual([
      {
        id: '2',
        date: '2025-12-01',
        startTime: '14:20',
        endTime: '14:40',
      },
    ]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Partial<Event> = {
      id: '1',
      date: '2025-12-02',
      startTime: '14:30',
      endTime: '14:50',
    };
    const events: Partial<Event>[] = [
      {
        id: '2',
        date: '2025-12-01',
        startTime: '14:20',
        endTime: '14:40',
      },
    ];
    const result = findOverlappingEvents(newEvent as Event, events as Event[]);
    expect(result).toEqual([]);
  });
});
