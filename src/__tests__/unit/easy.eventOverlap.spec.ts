import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

function createTestEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: '1',
    title: 'Test Event',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
    ...overrides,
  };
}

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 동일한 날짜와 시간을 가진 Date 객체로 변환한다', () => {
    const expectedDateTime = new Date('2025-07-01T14:30');
    const parsedDateTime = parseDateTime('2025-07-01', '14:30');
    expect(parsedDateTime).toBeInstanceOf(Date);
    expect(parsedDateTime.getTime()).toBe(expectedDateTime.getTime());
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const parsedDateTime = parseDateTime('2025년7월1일', '14:30');
    expect(parsedDateTime).toBeInstanceOf(Date);
    expect(parsedDateTime.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const parsedDateTime = parseDateTime('2025-07-01', '14시30분');
    expect(parsedDateTime).toBeInstanceOf(Date);
    expect(parsedDateTime.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const parsedDateTime = parseDateTime('', '14:30');
    expect(parsedDateTime).toBeInstanceOf(Date);
    expect(parsedDateTime.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = createTestEvent();
    const dateRange = convertEventToDateRange(event);
    expect(dateRange.start).toBeInstanceOf(Date);
    expect(dateRange.end).toBeInstanceOf(Date);
    // UTC 기준의 시간을 getTime() 메소드로 정상적인 시간대로 가져옴
    expect(dateRange.start.getTime()).toBe(new Date('2025-07-01T09:00').getTime());
    expect(dateRange.end.getTime()).toBe(new Date('2025-07-01T10:00').getTime());
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createTestEvent({ date: '2025년7월1일' });
    const dateRange = convertEventToDateRange(event);

    expect(dateRange.start.toString()).toBe('Invalid Date');
    expect(dateRange.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createTestEvent({ startTime: '14시30분', endTime: '15시30분' });
    const dateRange = convertEventToDateRange(event);
    expect(dateRange.start.toString()).toBe('Invalid Date');
    expect(dateRange.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    // 시간대가 완전히 동일한 두 이벤트
    const event1 = createTestEvent();
    const event2 = createTestEvent({ id: '2' });
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createTestEvent();
    const event2 = createTestEvent({ id: '2', date: '2025-07-02' });
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {});

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {});
});
