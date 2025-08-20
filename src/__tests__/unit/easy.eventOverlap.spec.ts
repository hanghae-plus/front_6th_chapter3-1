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
    const date = parseDateTime('011-123-4567', '15:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-01', '26:80');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as EventForm;

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('2025-07-01T14:30'),
      end: new Date('2025-07-01T15:30'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      date: '011-123-4567',
      startTime: '14:30',
      endTime: '15:30',
    } as EventForm;

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      date: '2025-07-01',
      startTime: '29:30',
      endTime: '50:30',
    } as EventForm;

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as EventForm;

    const event2 = {
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
    } as EventForm;

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = {
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
    } as EventForm;

    const event2 = {
      date: '2025-07-02',
      startTime: '15:00',
      endTime: '16:00',
    } as EventForm;

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const events = [
      {
        id: '1',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
      },
      {
        id: '2',
        date: '2025-07-02',
        startTime: '15:00',
        endTime: '16:00',
      },
    ] as Event[];

    const newEvent = {
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '15:30',
    } as EventForm;

    expect(findOverlappingEvents(newEvent, events)).toEqual([events[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const events = [
      {
        id: '1',
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
      },
      {
        id: '2',
        date: '2025-07-02',
        startTime: '15:00',
        endTime: '16:00',
      },
      {
        id: '3',
        date: '2025-07-03',
        startTime: '15:00',
        endTime: '16:00',
      },
    ] as Event[];

    const newEvent = {
      date: '2025-08-01',
      startTime: '15:00',
      endTime: '16:00',
    } as EventForm;

    expect(findOverlappingEvents(newEvent, events)).toEqual([]);
  });
});
