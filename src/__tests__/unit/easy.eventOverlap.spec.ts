import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { createMockEvent } from '../utils';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');

    expect(result).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-08-181818', '14:30');

    expect(result).toBeInstanceOf(Date);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-08-18', '14:31230:00');

    expect(result).toBeInstanceOf(Date);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');

    expect(result).toBeInstanceOf(Date);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(createMockEvent());

    expect(result.start).toEqual(new Date('2025-08-01T09:00'));
    expect(result.end).toEqual(new Date('2025-08-01T10:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange(createMockEvent(1, { date: '2025-08-182838' }));

    expect(result.start).toEqual(new Date('Invalid Date'));
    expect(result.end).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange(
      createMockEvent(1, { startTime: '141:30:00', endTime: '15K:30:00' })
    );

    expect(result.start).toEqual(new Date('Invalid Date'));
    expect(result.end).toEqual(new Date('Invalid Date'));
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = createMockEvent();
    const event2 = createMockEvent();

    const result = isOverlapping(event1, event2);

    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createMockEvent(1, {
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '10:00',
    });
    const event2 = createMockEvent(2, {
      date: '2025-08-18',
      startTime: '19:00',
      endTime: '21:00',
    });

    const result = isOverlapping(event1, event2);

    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = createMockEvent(1, {
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '11:00',
    });
    const overlapEvent1 = createMockEvent(2, {
      date: '2025-08-01',
      startTime: '10:00',
      endTime: '12:00',
    });
    const overlapEvent2 = createMockEvent(3, {
      date: '2025-08-01',
      startTime: '08:00',
      endTime: '10:00',
    });
    const nonOverlapEvent = createMockEvent(4, {
      date: '2025-08-02',
      startTime: '09:00',
      endTime: '10:00',
    });

    const existingEvents = [overlapEvent1, overlapEvent2, nonOverlapEvent];

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result).toHaveLength(2);
    //toContain 은 배열이나 문자열에 특정 요소가 포함되어 있는지 확인해주는 매처!
    expect(result).toContain(overlapEvent1);
    expect(result).toContain(overlapEvent2);
    expect(result).not.toContain(nonOverlapEvent);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = createMockEvent(1, {
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '10:00',
    });
    const nonOverlapEvent1 = createMockEvent(2, {
      date: '2025-08-01',
      startTime: '11:00',
      endTime: '12:00',
    });
    const nonOverlapEvent2 = createMockEvent(3, {
      date: '2025-08-02',
      startTime: '09:00',
      endTime: '10:00',
    });

    const existingEvents = [nonOverlapEvent1, nonOverlapEvent2];

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
