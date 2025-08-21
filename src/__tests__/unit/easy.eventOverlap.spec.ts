import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

const makeEvent = (overrides?: Partial<Event>): Event => ({
  id: '1',
  title: 'title',
  date: '2025-07-01',
  startTime: '10:00',
  endTime: '11:00',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 0,
  ...overrides,
});

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const parsedDateTime = parseDateTime('2025-07-01', '14:30');
    expect(parsedDateTime.getTime()).toBe(new Date('2025-07-01T14:30').getTime());
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const parsedDateTime = parseDateTime('invalid-date', '14:30');
    expect(Number.isNaN(parsedDateTime.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const parsedDateTime = parseDateTime('2025-07-01', '25:61');
    expect(Number.isNaN(parsedDateTime.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const parsedDateTime = parseDateTime('', '10:00');
    expect(Number.isNaN(parsedDateTime.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = makeEvent({ date: '2025-07-01', startTime: '09:15', endTime: '10:45' });
    const range = convertEventToDateRange(event);
    expect(range.start.getTime()).toBe(new Date('2025-07-01T09:15').getTime());
    expect(range.end.getTime()).toBe(new Date('2025-07-01T10:45').getTime());
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = makeEvent({ date: 'invalid-date' });
    const range = convertEventToDateRange(event);
    expect(Number.isNaN(range.start.getTime())).toBe(true);
    expect(Number.isNaN(range.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = makeEvent({ startTime: '25:00' });
    const range = convertEventToDateRange(event);
    expect(Number.isNaN(range.start.getTime())).toBe(true);
    expect(range.end.getTime()).toBe(new Date('2025-07-01T11:00').getTime());
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const a = makeEvent({ startTime: '10:00', endTime: '11:00' });
    const b = makeEvent({ id: 'e2', startTime: '10:30', endTime: '11:30' });
    expect(isOverlapping(a, b)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const a = makeEvent({ startTime: '10:00', endTime: '11:00' });
    const b = makeEvent({ id: 'e2', startTime: '11:00', endTime: '12:00' });
    expect(isOverlapping(a, b)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = makeEvent({ id: '1', startTime: '10:00', endTime: '11:00' });
    const events: Event[] = [
      makeEvent({ id: '1', startTime: '10:00', endTime: '11:00' }),
      makeEvent({ id: '2', startTime: '10:30', endTime: '10:55' }),
      makeEvent({ id: '3', startTime: '11:00', endTime: '12:00' }),
      makeEvent({ id: '4', startTime: '09:00', endTime: '10:00' }),
      makeEvent({ id: '5', startTime: '10:59', endTime: '11:01' }),
    ];
    const result = findOverlappingEvents(newEvent, events);
    expect(result.map((e) => e.id).sort()).toEqual(['2', '5']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = makeEvent({ id: '10', startTime: '10:00', endTime: '11:00' });
    const events: Event[] = [
      makeEvent({ id: 'a', startTime: '08:00', endTime: '09:00' }),
      makeEvent({ id: 'b', startTime: '11:00', endTime: '12:00' }),
    ];
    const result = findOverlappingEvents(newEvent, events);
    expect(result).toEqual([]);
  });
});
