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
    expect(result).toEqual(new Date('2025-07-01T14:30'));
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
  const event: Event = {
    id: '1',
    title: '테스트 이벤트',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '테스트',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  };

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(event);
    expect(result.start).toEqual(new Date('2025-07-01T09:00'));
    expect(result.end).toEqual(new Date('2025-07-01T10:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = { ...event, date: 'invalid-date' };
    const result = convertEventToDateRange(invalidEvent);
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = { ...event, startTime: 'invalid-time', endTime: 'invalid-time' };
    const result = convertEventToDateRange(invalidEvent);
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    const event2: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    const event2: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    expect(isOverlapping(event1, event2)).toBe(false);
  });

  it('경계선상에서 만나는 이벤트는 겹치지 않는다', () => {
    const event1: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    const event2: Event = {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    expect(isOverlapping(event1, event2)).toBe(false);
  });

  it('하나의 이벤트가 다른 이벤트를 완전히 포함하는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '긴 이벤트',
      date: '2025-07-01',
      startTime: '08:00',
      endTime: '12:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    const event2: Event = {
      id: '2',
      title: '짧은 이벤트',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('날짜가 변경되는 자정에 두 이벤트가 경계선상에서 만나는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      title: '자정을 지나는 이벤트',
      date: '2025-07-01',
      startTime: '23:58:59',
      endTime: '23:59:59',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    const event2: Event = {
      id: '2',
      title: '다음 날 아침 이벤트',
      date: '2025-07-02',
      startTime: '00:00:00',
      endTime: '00:00:01',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    expect(isOverlapping(event1, event2)).toBe(false);
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
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    const existingEvents: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 15,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 15,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-01',
        startTime: '09:45',
        endTime: '10:15',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 15,
      },
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);

    expect(overlappingEvents).toHaveLength(3);
    expect(overlappingEvents.map((e) => e.id)).toContain('1');
    expect(overlappingEvents.map((e) => e.id)).toContain('2');
    expect(overlappingEvents.map((e) => e.id)).toContain('3');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: 'new',
      title: '새 이벤트',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    const existingEvents: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 15,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '08:00',
        endTime: '09:00',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 15,
      },
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);

    expect(overlappingEvents).toHaveLength(0);
  });

  it('자신과 같은 ID를 가진 이벤트는 제외한다', () => {
    const newEvent: Event = {
      id: '1',
      title: '기존 이벤트와 같은 ID',
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    const existingEvents: Event[] = [
      {
        id: '1',
        title: '기존 이벤트',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트 설명',
        location: '테스트 장소',
        category: '테스트',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 15,
      },
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);

    expect(overlappingEvents).toHaveLength(0);
  });

  // 엣지 케이스 추가
  it('기존 이벤트가 아무것도 등록되어있지 않다면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '1',
      title: '기존 이벤트와 같은 ID',
      date: '2025-07-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    const existingEvents: Event[] = [];
    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);
    expect(overlappingEvents).toHaveLength(0);
  });
});
