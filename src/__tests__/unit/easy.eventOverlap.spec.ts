import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2025-07-01', '14:30');
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('invalid-date', '14:30');
    expect(date.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-01', 'invalid-time');
    expect(date.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14:30');
    expect(date.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: 'Test Event',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const range = convertEventToDateRange(event);
    expect(range.start.getFullYear()).toBe(2025);
    expect(range.start.getMonth()).toBe(6);
    expect(range.start.getDate()).toBe(1);
    expect(range.start.getHours()).toBe(9);
    expect(range.start.getMinutes()).toBe(0);
    expect(range.end.getHours()).toBe(10);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: 'Test Event',
      date: 'invalid-date',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const range = convertEventToDateRange(event);
    expect(range.start.toString()).toBe('Invalid Date');
    expect(range.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: 'Test Event',
      date: '2025-07-01',
      startTime: '25:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const range = convertEventToDateRange(event);
    expect(isNaN(range.start.getTime())).toBe(true);
    expect(isNaN(range.end.getTime())).toBe(false);
  });
});

describe('isOverlapping', () => {
  const baseEvent: Event = {
    id: 'test-id',
    title: 'Test Event',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = { ...baseEvent, startTime: '09:00', endTime: '10:00' };
    const event2 = { ...baseEvent, startTime: '09:30', endTime: '10:30' };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = { ...baseEvent, startTime: '09:00', endTime: '10:00' };
    const event2 = { ...baseEvent, startTime: '10:00', endTime: '11:00' };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: 'Test Event',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  };

  const events: Event[] = [
    { ...baseEvent, id: '2', startTime: '09:30', endTime: '10:30' },
    { ...baseEvent, id: '3', startTime: '10:00', endTime: '11:00' },
    { ...baseEvent, id: '4', startTime: '08:00', endTime: '09:30' },
    { ...baseEvent, id: '5', date: '2025-07-02' },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = { ...baseEvent, id: '1', startTime: '09:00', endTime: '10:00' };
    const overlapping = findOverlappingEvents(newEvent, events);
    expect(overlapping).toHaveLength(2);
    expect(overlapping.map(e => e.id)).toEqual(expect.arrayContaining(['2', '4']));
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = { ...baseEvent, id: '1', startTime: '12:00', endTime: '13:00' };
    const overlapping = findOverlappingEvents(newEvent, events);
    expect(overlapping).toHaveLength(0);
  });
});