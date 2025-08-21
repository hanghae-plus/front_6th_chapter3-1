import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');

    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('invalid-date', '14:30');

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', 'invalid-time');

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');

    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);

    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);
    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(6);
    expect(result.start.getDate()).toBe(1);
    expect(result.start.getHours()).toBe(9);
    expect(result.start.getMinutes()).toBe(0);
    expect(result.end.getHours()).toBe(10);
    expect(result.end.getMinutes()).toBe(0);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: 'invalid-date',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);

    expect(isNaN(result.start.getTime())).toBeTruthy();
    expect(isNaN(result.end.getTime())).toBeTruthy();
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-07-01',
      startTime: 'invalid-time',
      endTime: 'invalid-time',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);

    expect(isNaN(result.start.getTime())).toBeTruthy();
    expect(isNaN(result.end.getTime())).toBeTruthy();
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '첫 번째 이벤트',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '첫 번째 이벤트',
      location: '장소1',
      category: '카테고리1',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const event2: Event = {
      id: '2',
      title: '두 번째 이벤트',
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '두 번째 이벤트',
      location: '장소2',
      category: '카테고리2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = isOverlapping(event1, event2);
    expect(result).toBeTruthy();
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '첫 번째 이벤트',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '첫 번째 이벤트',
      location: '장소1',
      category: '카테고리1',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const event2: Event = {
      id: '2',
      title: '두 번째 이벤트',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '두 번째 이벤트',
      location: '장소2',
      category: '카테고리2',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = isOverlapping(event1, event2);
    expect(result).toBeFalsy();
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: 'new',
      title: '새 이벤트',
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '새 이벤트',
      location: '새 장소',
      category: '새 카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const existingEvents: Event[] = [
      {
        id: '1',
        title: '겹치는 이벤트1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '겹치는 이벤트1',
        location: '장소1',
        category: '카테고리1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '겹치지 않는 이벤트',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '겹치지 않는 이벤트',
        location: '장소2',
        category: '카테고리2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '겹치는 이벤트2',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '겹치는 이벤트2',
        location: '장소3',
        category: '카테고리3',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result).toEqual([
      {
        id: '1',
        title: '겹치는 이벤트1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '겹치는 이벤트1',
        location: '장소1',
        category: '카테고리1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '겹치는 이벤트2',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '겹치는 이벤트2',
        location: '장소3',
        category: '카테고리3',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: 'new',
      title: '새 이벤트',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '새 이벤트',
      location: '새 장소',
      category: '새 카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const existingEvents: Event[] = [
      {
        id: '1',
        title: '기존 이벤트1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 이벤트1',
        location: '장소1',
        category: '카테고리1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '기존 이벤트2',
        date: '2025-07-01',
        startTime: '16:00',
        endTime: '17:00',
        description: '기존 이벤트2',
        location: '장소2',
        category: '카테고리2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result).toEqual([]);
  });
});
