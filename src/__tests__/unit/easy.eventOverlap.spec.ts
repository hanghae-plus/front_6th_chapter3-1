import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-13-01', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '25:00');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  const event: Event = {
    id: '1',
    title: '테스트 이벤트',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '16:00',
    notificationTime: 10,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  };

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const { start, end } = convertEventToDateRange(event);
    expect(start).toEqual(new Date('2025-07-01T14:00:00'));
    expect(end).toEqual(new Date('2025-07-01T16:00:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = { ...event, date: 'invalid-date' };
    const { start, end } = convertEventToDateRange(invalidEvent);
    expect(start.toString()).toBe('Invalid Date');
    expect(end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = { ...event, startTime: '99:00', endTime: '99:00' };
    const { start, end } = convertEventToDateRange(invalidEvent);
    expect(start.toString()).toBe('Invalid Date');
    expect(end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  const baseEvent: Event = {
    id: 'base',
    title: 'Base Event',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '12:00',
    notificationTime: 10,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const overlappingEvent: Event = {
      ...baseEvent,
      id: 'overlapping',
      startTime: '11:00',
      endTime: '13:00',
    };
    expect(isOverlapping(baseEvent, overlappingEvent)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const overlappingEvent = {
      ...baseEvent,
      id: 'overlapping',
      startTime: '13:00',
      endTime: '15:00',
    };
    expect(isOverlapping(baseEvent, overlappingEvent)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const testEvents: Event[] = [
    {
      id: '1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '11:00',
      title: '이벤트 1',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
    },
    {
      id: '2',
      date: '2025-07-01',
      startTime: '11:30',
      endTime: '13:00',
      title: '이벤트 2',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
    },
    {
      id: '3',
      date: '2025-07-01',
      startTime: '15:30',
      endTime: '16:00',
      title: '이벤트 3',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
    },
  ];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '4',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:45',
      title: '새 이벤트',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
    };
    const overlapping = findOverlappingEvents(newEvent, testEvents);
    expect(overlapping).toHaveLength(2);
    expect(overlapping.some((e) => e.id === '1')).toBe(true);
    expect(overlapping.some((e) => e.id === '2')).toBe(true);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '4',
      date: '2025-07-01',
      startTime: '22:00',
      endTime: '23:45',
      title: '새 이벤트',
      notificationTime: 10,
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
    };
    const overlapping = findOverlappingEvents(newEvent, testEvents);
    expect(overlapping).toHaveLength(0);
  });
});
