import { createTestEvent } from '../../__mocks__/handlersUtils';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('유효한 날짜와 시간을 파싱한다', () => {
    // Given: 유효한 날짜와 시간 문자열
    // When: parseDateTime 함수 호출
    const result = parseDateTime('2025-07-01', '14:30');

    // Then: 올바른 Date 객체 반환
    expect(result).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식은 Invalid Date를 반환한다', () => {
    // Given: 잘못된 날짜 형식
    // When: parseDateTime 함수 호출
    const result = parseDateTime('잘못된날짜', '14:30');

    // Then: Invalid Date 반환
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식은 Invalid Date를 반환한다', () => {
    // Given: 잘못된 시간 형식
    // When: parseDateTime 함수 호출
    const result = parseDateTime('2025-07-01', '잘못된시간');

    // Then: Invalid Date 반환
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('빈 값들은 Invalid Date를 반환한다', () => {
    // Given: 빈 날짜와 시간 문자열
    // When: parseDateTime 함수 호출
    const result = parseDateTime('', '');

    // Then: Invalid Date 반환
    expect(result).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('이벤트를 날짜 범위로 변환한다', () => {
    // Given: 유효한 이벤트 객체
    const event = createTestEvent({
      date: '2025-07-10',
      startTime: '09:00',
      endTime: '10:00',
    });

    // When: convertEventToDateRange 함수 호출
    const result = convertEventToDateRange(event);

    // Then: 시작과 종료 Date 객체가 포함된 범위 반환
    expect(result).toEqual({
      start: new Date('2025-07-10T09:00:00'),
      end: new Date('2025-07-10T10:00:00'),
    });
  });

  it('잘못된 날짜면 Invalid Date 객체를 반환한다', () => {
    // Given: 잘못된 날짜를 가진 이벤트
    const event = createTestEvent({
      date: '잘못된날짜',
      startTime: '09:00',
      endTime: '10:00',
    });

    // When: convertEventToDateRange 함수 호출
    const result = convertEventToDateRange(event);

    // Then: Invalid Date가 포함된 객체 반환
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간이면 Invalid Date 객체를 반환한다', () => {
    // Given: 잘못된 시간을 가진 이벤트
    const event = createTestEvent({
      date: '2025-07-10',
      startTime: '잘못된시간',
      endTime: '잘못된시간',
    });

    // When: convertEventToDateRange 함수 호출
    const result = convertEventToDateRange(event);

    // Then: Invalid Date가 포함된 객체 반환
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('시간이 겹치는 이벤트들은 true를 반환한다', () => {
    // Given: 시간이 겹치는 두 이벤트
    const event1 = createTestEvent({
      date: '2025-07-10',
      startTime: '12:00',
      endTime: '13:00',
    });

    const event2 = createTestEvent({
      date: '2025-07-10',
      startTime: '11:30',
      endTime: '13:00',
    });

    // When: isOverlapping 함수 호출
    const result = isOverlapping(event1, event2);

    // Then: true 반환
    expect(result).toBe(true);
  });

  it('시간이 안 겹치는 이벤트들은 false를 반환한다', () => {
    // Given: 시간이 겹치지 않는 두 이벤트
    const event1 = createTestEvent({
      date: '2025-07-10',
      startTime: '10:00',
      endTime: '11:00',
    });

    const event2 = createTestEvent({
      date: '2025-07-10',
      startTime: '14:00',
      endTime: '15:30',
    });

    // When: isOverlapping 함수 호출
    const result = isOverlapping(event1, event2);

    // Then: false 반환
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('겹치는 이벤트들을 모두 찾아서 반환한다', () => {
    // Given: 새 이벤트와 기존 이벤트들 (일부 겹침)
    const newEvent = createTestEvent({
      date: '2025-07-10',
      startTime: '10:00',
      endTime: '14:00',
    });

    const existingEvents = [
      createTestEvent({
        date: '2025-07-10',
        startTime: '12:00',
        endTime: '13:00',
      }),
      createTestEvent({
        date: '2025-07-10',
        startTime: '11:30',
        endTime: '12:30',
      }),
    ];

    // When: findOverlappingEvents 함수 호출
    const result = findOverlappingEvents(newEvent, existingEvents);

    // Then: 겹치는 이벤트들만 반환
    expect(result).toHaveLength(2);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    // Given: 새 이벤트와 기존 이벤트들 (겹치지 않음)
    const newEvent = createTestEvent({
      date: '2025-07-10',
      startTime: '17:00',
      endTime: '18:30',
    });

    const existingEvents = [
      createTestEvent({
        date: '2025-07-10',
        startTime: '08:00',
        endTime: '09:30',
      }),
      createTestEvent({
        date: '2025-07-10',
        startTime: '14:00',
        endTime: '15:30',
      }),
    ];

    // When: findOverlappingEvents 함수 호출
    const result = findOverlappingEvents(newEvent, existingEvents);

    // Then: 빈 배열 반환
    expect(result).toEqual([]);
  });
});
