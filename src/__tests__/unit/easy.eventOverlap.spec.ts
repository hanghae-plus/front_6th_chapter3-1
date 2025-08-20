import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const targetDateTime = parseDateTime('2025-07-01', '14:30');

    // Date 객체인지 확인
    expect(targetDateTime).toBeInstanceOf(Date);
    expect(targetDateTime).toEqual(new Date('2025-07-01 14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date 겍체를 반환한다', () => {
    const targetDateTime = parseDateTime('2025-100-11', '12:30');

    // Date 객체인지 확인
    expect(targetDateTime).toBeInstanceOf(Date);
    expect(String(targetDateTime)).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const targetDateTime = parseDateTime('2025-06-11', '44:30');

    // Date 객체인지 확인
    expect(targetDateTime).toBeInstanceOf(Date);
    expect(String(targetDateTime)).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const targetDateTime = parseDateTime('', '12:30');

    // Date 객체인지 확인
    expect(targetDateTime).toBeInstanceOf(Date);
    expect(String(targetDateTime)).toBe('Invalid Date');
  });

  it('시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const targetDateTime = parseDateTime('2025-06-11', '');

    // Date 객체인지 확인
    expect(targetDateTime).toBeInstanceOf(Date);
    expect(String(targetDateTime)).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '회의',
      date: '2025-07-15',
      startTime: '09:00',
      endTime: '10:30',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const targetEvent = convertEventToDateRange(mockEvent);

    // 시작 시간 2025-07-15 09:00
    expect(targetEvent.start).toBeInstanceOf(Date);
    expect(targetEvent.start.getFullYear()).toBe(2025);
    expect(targetEvent.start.getMonth()).toBe(6);
    expect(targetEvent.start.getDate()).toBe(15);
    expect(targetEvent.start.getHours()).toBe(9);
    expect(targetEvent.start.getMinutes()).toBe(0);

    // 종료 시간 2025-07-15 10:30
    expect(targetEvent.end).toBeInstanceOf(Date);
    expect(targetEvent.end.getFullYear()).toBe(2025);
    expect(targetEvent.end.getMonth()).toBe(6);
    expect(targetEvent.end.getDate()).toBe(15);
    expect(targetEvent.end.getHours()).toBe(10);
    expect(targetEvent.end.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '회의2',
      date: '2025-123-123',
      startTime: '09:00',
      endTime: '10:30',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const targetEvent = convertEventToDateRange(mockEvent);

    expect(targetEvent.start).toBeInstanceOf(Date);
    expect(String(targetEvent.start)).toBe('Invalid Date');

    expect(targetEvent.end).toBeInstanceOf(Date);
    expect(String(targetEvent.end)).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '회의',
      date: '2025-12-23',
      startTime: '123:123',
      endTime: '123:123',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const targetEvent = convertEventToDateRange(mockEvent);

    expect(targetEvent.start).toBeInstanceOf(Date);
    expect(String(targetEvent.start)).toBe('Invalid Date');

    expect(targetEvent.end).toBeInstanceOf(Date);
    expect(String(targetEvent.end)).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  const createTestEvent = (startTime: string, endTime: string): EventForm => ({
    title: '테스트 회의',
    date: '2025-07-15',
    startTime,
    endTime,
    description: '테스트용 회의',
    location: '테스트 회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  });

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = createTestEvent('09:00', '11:00');
    const event2 = createTestEvent('10:00', '12:00');

    const result = isOverlapping(event1, event2);
    expect(result).toBe(true);

    // 어느 한 쪽이 전체를 포함
    const event3 = createTestEvent('08:00', '13:00');
    const event4 = createTestEvent('09:00', '10:00');

    expect(isOverlapping(event3, event4)).toBe(true);
    expect(isOverlapping(event4, event3)).toBe(true);

    // 같은 시작 시간
    const event5 = createTestEvent('09:00', '10:00');
    const event6 = createTestEvent('09:00', '11:00');

    expect(isOverlapping(event5, event6)).toBe(true);

    // 같은 종료 시간
    const event7 = createTestEvent('08:00', '11:00');
    const event8 = createTestEvent('09:00', '11:00');

    expect(isOverlapping(event7, event8)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createTestEvent('08:00', '10:00');
    const event2 = createTestEvent('10:00', '12:00');

    expect(isOverlapping(event1, event2)).toBe(false);
    expect(isOverlapping(event2, event1)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const prevEvents: Event[] = [
    {
      id: '1',
      title: '오전 회의',
      date: '2025-07-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '점심 회의',
      date: '2025-07-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 미팅',
      location: '레스토랑',
      category: '기타',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
    {
      id: '3',
      title: '오후 회의',
      date: '2025-07-15',
      startTime: '15:00',
      endTime: '16:00',
      description: '프로젝트 리뷰',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '4',
      title: '긴 회의',
      date: '2025-07-15',
      startTime: '09:30',
      endTime: '12:30',
      description: '긴 미팅',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    };

    const result = findOverlappingEvents(newEvent, prevEvents);
    expect(result).toHaveLength(2);

    const overlappingIds = result.map((event) => event.id);
    expect(overlappingIds).toContain('1');
    expect(overlappingIds).toContain('2');
    expect(overlappingIds).not.toContain('3');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: EventForm = {
      title: '저녁 이벤트',
      date: '2025-07-15',
      startTime: '18:00',
      endTime: '19:00',
      description: '저녁 모임',
      location: '카페',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    };

    const result = findOverlappingEvents(newEvent, prevEvents);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
