import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('invalid', '14:30');

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', 'invalid');

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '');

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('둘 다 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '');

    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  const createTestEvent = (date: string, startTime: string, endTime: string): EventForm => ({
    title: '이벤트',
    date,
    startTime,
    endTime,
    description: '설명',
    location: '위치',
    category: '카테고리',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  });

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = createTestEvent('2025-07-01', '10:00', '11:00');
    const result = convertEventToDateRange(event);

    expect(result.start.getHours()).toBe(10);
    expect(result.start.getMinutes()).toBe(0);
    expect(result.end.getHours()).toBe(11);
    expect(result.end.getMinutes()).toBe(0);
    expect(result.start.getDate()).toBe(1);
    expect(result.end.getDate()).toBe(1);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createTestEvent('invalid', '10:00', '11:00');
    const result = convertEventToDateRange(event);

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createTestEvent('2025-07-01', 'invalid', '11:00');
    const result = convertEventToDateRange(event);

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(result.end.getHours()).toBe(11);
  });

  it('다양한 시간대를 올바르게 변환한다', () => {
    const event = createTestEvent('2025-12-25', '23:59', '23:59');
    const result = convertEventToDateRange(event);

    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(11);
    expect(result.start.getDate()).toBe(25);
    expect(result.start.getHours()).toBe(23);
    expect(result.start.getMinutes()).toBe(59);
  });
});

describe('isOverlapping', () => {
  const generateMockEvent = (
    id: string,
    date: string,
    startTime: string,
    endTime: string
  ): Event => ({
    id,
    title: `이벤트${id}`,
    date,
    startTime,
    endTime,
    description: '설명',
    location: '위치',
    category: '카테고리',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  });

  describe('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    it('완전히 포함되는 경우', () => {
      const event1 = generateMockEvent('1', '2025-07-01', '10:00', '12:00');
      const event2 = generateMockEvent('2', '2025-07-01', '10:30', '11:30');

      expect(isOverlapping(event1, event2)).toBe(true);
      expect(isOverlapping(event2, event1)).toBe(true);
    });

    it('부분적으로 겹치는 경우', () => {
      const event1 = generateMockEvent('1', '2025-07-01', '10:00', '11:00');
      const event2 = generateMockEvent('2', '2025-07-01', '10:30', '12:00');

      expect(isOverlapping(event1, event2)).toBe(true);
      expect(isOverlapping(event2, event1)).toBe(true);
    });

    it('시작 시간이 일치하는 경우', () => {
      const event1 = generateMockEvent('1', '2025-07-01', '10:00', '11:00');
      const event2 = generateMockEvent('2', '2025-07-01', '10:00', '12:00');

      expect(isOverlapping(event1, event2)).toBe(true);
    });

    it('종료 시간이 일치하는 경우', () => {
      const event1 = generateMockEvent('1', '2025-07-01', '10:00', '11:00');
      const event2 = generateMockEvent('2', '2025-07-01', '09:00', '11:00');

      expect(isOverlapping(event1, event2)).toBe(true);
    });

    it('1분 겹치는 경우', () => {
      const event1 = generateMockEvent('1', '2025-07-01', '10:00', '11:01');
      const event2 = generateMockEvent('2', '2025-07-01', '11:00', '12:00');

      expect(isOverlapping(event1, event2)).toBe(true);
    });
  });

  describe('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    it('시간 간격이 있는 경우', () => {
      const event1 = generateMockEvent('1', '2025-07-01', '10:00', '11:00');
      const event2 = generateMockEvent('2', '2025-07-01', '12:00', '13:00');

      expect(isOverlapping(event1, event2)).toBe(false);
      expect(isOverlapping(event2, event1)).toBe(false);
    });

    it('연속된 시간 (경계가 맞닿는 경우)', () => {
      const event1 = generateMockEvent('1', '2025-07-01', '10:00', '11:00');
      const event2 = generateMockEvent('2', '2025-07-01', '11:00', '12:00');

      expect(isOverlapping(event1, event2)).toBe(false);
      expect(isOverlapping(event2, event1)).toBe(false);
    });

    it('다른 날짜의 경우', () => {
      const event1 = generateMockEvent('1', '2025-07-01', '10:00', '11:00');
      const event2 = generateMockEvent('2', '2025-07-02', '10:00', '11:00');

      expect(isOverlapping(event1, event2)).toBe(false);
    });
  });

  it('EventForm 타입과도 정상적으로 작동한다', () => {
    const eventForm: EventForm = {
      title: 'Form Event',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const event = generateMockEvent('1', '2025-07-01', '10:30', '11:30');

    expect(isOverlapping(eventForm, event)).toBe(true);
  });
});

describe('findOverlappingEvents', () => {
  const generateMockEvent = (
    id: string,
    date: string,
    startTime: string,
    endTime: string
  ): Event => ({
    id,
    title: `Event ${id}`,
    date,
    startTime,
    endTime,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  });

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = generateMockEvent('new', '2025-07-01', '10:00', '11:00');
    const events = [
      generateMockEvent('1', '2025-07-01', '10:30', '11:30'), // 겹침
      generateMockEvent('2', '2025-07-01', '12:00', '13:00'),
      generateMockEvent('3', '2025-07-01', '09:00', '10:30'), // 겹침
      generateMockEvent('4', '2025-07-02', '10:00', '11:00'),
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, events);

    expect(overlappingEvents).toHaveLength(2);
    expect(overlappingEvents.map((e) => e.id)).toEqual(['1', '3']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = generateMockEvent('new', '2025-07-01', '10:00', '11:00');
    const events = [
      generateMockEvent('1', '2025-07-01', '12:00', '13:00'),
      generateMockEvent('2', '2025-07-01', '08:00', '09:00'),
      generateMockEvent('3', '2025-07-02', '10:00', '11:00'),
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, events);

    expect(overlappingEvents).toHaveLength(0);
    expect(overlappingEvents).toEqual([]);
  });

  it('동일한 ID의 이벤트는 제외한다 (자기 자신 제외)', () => {
    const newEvent = generateMockEvent('1', '2025-07-01', '10:00', '11:00');
    const events = [
      generateMockEvent('1', '2025-07-01', '10:00', '11:00'),
      generateMockEvent('2', '2025-07-01', '10:30', '11:30'),
      generateMockEvent('3', '2025-07-01', '09:00', '10:30'),
    ];

    const overlappingEvents = findOverlappingEvents(newEvent, events);

    expect(overlappingEvents).toHaveLength(2);
    expect(overlappingEvents.map((e) => e.id)).toEqual(['2', '3']);
  });

  it('EventForm 타입의 새 이벤트도 처리한다', () => {
    const newEventForm: EventForm = {
      title: '새 이벤트',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    };
    const events = [
      generateMockEvent('1', '2025-07-01', '10:30', '11:30'),
      generateMockEvent('2', '2025-07-01', '12:00', '13:00'),
    ];

    const overlappingEvents = findOverlappingEvents(newEventForm, events);

    expect(overlappingEvents).toHaveLength(1);
    expect(overlappingEvents[0].id).toBe('1');
  });

  it('빈 이벤트 배열에 대해 빈 배열을 반환한다', () => {
    const newEvent = generateMockEvent('new', '2025-07-01', '10:00', '11:00');
    const events: Event[] = [];

    const overlappingEvents = findOverlappingEvents(newEvent, events);

    expect(overlappingEvents).toHaveLength(0);
    expect(overlappingEvents).toEqual([]);
  });
});
