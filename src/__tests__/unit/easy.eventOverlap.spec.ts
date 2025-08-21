import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { createMockEvent } from '../utils';
describe('parseDateTime: 날짜와 시간을 합쳐 Date 객체로 변환', () => {
  it('2025-07-01 날짜와 14:30 시간을 합쳐 Date 객체로 변환한다', () => {
    const date = parseDateTime('2025-08-01', '14:30');
    expect(date).toEqual(new Date('2025-08-01T14:30:00'));
  });

  it('잘못된 날짜 형식(2025-13-01)에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-13-01', '14:30');
    expect(date.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식(25:00)에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-01', '25:00');
    expect(date.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14:30');
    expect(date.toString()).toBe('Invalid Date');
  });

  it('시간 문자열이 비어있으면 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-01', '');
    expect(date.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange: 이벤트의 date, startTime, endTime을 동일한 날짜의 시작/종료 Date로 변환', () => {
  //이벤트 생성
  const [defaultEvent, wrongDateEvent, wrongTimeEvent] = [
    createMockEvent(1, { date: '2025-08-01', startTime: '09:00', endTime: '10:00' }),
    createMockEvent(2, { date: '2025-08-32', startTime: '10:00', endTime: '11:00' }), //잘못된 날짜
    createMockEvent(3, { date: '2025-08-28', startTime: '25:00', endTime: '12:00' }), //잘못된 시간
  ];

  it('이벤트의 date, startTime, endTime을 동일한 날짜의 시작/종료 Date로 변환한다', () => {
    const dateRange = convertEventToDateRange(defaultEvent);
    expect(dateRange).toEqual({
      start: new Date('2025-08-01T09:00:00'),
      end: new Date('2025-08-01T10:00:00'),
    });
  });

  it('잘못된 날짜(2025-08-32)의 이벤트는 start와 end 모두 Invalid Date가 된다', () => {
    const dateRange = convertEventToDateRange(wrongDateEvent);

    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식(25:00)의 이벤트에 대해서는 해당 시간대를 Invalid Date로 반환한다', () => {
    const dateRange = convertEventToDateRange(wrongTimeEvent);

    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('2025-08-28T12:00:00'),
    });
  });
});

describe('isOverlapping: 두 이벤트의 시간이 겹치는지 확인', () => {
  it('두 이벤트 시간이 겹치는 경우 true를 반환한다', () => {
    const event1 = createMockEvent(1, { date: '2025-08-01', startTime: '09:00', endTime: '10:00' });
    const event2 = createMockEvent(2, { date: '2025-08-01', startTime: '09:30', endTime: '10:30' });

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트 시간이 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createMockEvent(1, { date: '2025-08-01', startTime: '09:00', endTime: '10:00' });
    const event2 = createMockEvent(2, { date: '2025-08-01', startTime: '10:30', endTime: '11:30' });

    expect(isOverlapping(event1, event2)).toBe(false);
  });

  it('두 이벤트의 시작과 끝이 맞닿는 경우에도 false를 반환한다', () => {
    const event1 = createMockEvent(1, { date: '2025-08-01', startTime: '09:00', endTime: '10:00' });
    const event2 = createMockEvent(2, { date: '2025-08-01', startTime: '10:00', endTime: '11:00' });

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents: 새 이벤트와 겹치는 모든 이벤트를 반환', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const events = [
      createMockEvent(1, { date: '2025-08-01', startTime: '09:00', endTime: '10:00' }),
      createMockEvent(2, { date: '2025-08-01', startTime: '09:30', endTime: '10:30' }),
      createMockEvent(3, { date: '2025-08-01', startTime: '12:00', endTime: '13:00' }), // 겹치지 않음
    ];

    const newEvent = createMockEvent(5, {
      date: '2025-08-01',
      startTime: '09:45',
      endTime: '10:15',
    });

    const result = findOverlappingEvents(newEvent, events);

    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    //겹치지 않는 이벤트들
    const events = [
      createMockEvent(1, { date: '2025-08-02', startTime: '07:00', endTime: '08:00' }),
      createMockEvent(2, { date: '2025-08-02', startTime: '12:00', endTime: '13:00' }),
      createMockEvent(3, { date: '2025-08-02', startTime: '09:00', endTime: '10:00' }),
    ];

    const newEvent = createMockEvent(4, {
      date: '2025-08-01',
      startTime: '13:00',
      endTime: '14:00',
    });

    const result = findOverlappingEvents(newEvent, events);
    expect(result).toEqual([]);
  });
});
