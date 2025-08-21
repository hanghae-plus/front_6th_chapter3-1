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
    expect(date).toBeInstanceOf(Date); // Date 객체인지 확인
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(6); // 0부터 시작하므로 7월 = 6
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('20225-07-01', '14:30');
    expect(date).toBeInstanceOf(Date);
    expect(isNaN(date.getFullYear())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2025-07-01', '124:30');
    expect(date).toBeInstanceOf(Date);
    expect(isNaN(date.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '124:30');
    expect(date).toBeInstanceOf(Date);
    expect(isNaN(date.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const testEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '12:00',
      description: '테스트 설명',
      location: '회의실',
      category: '업무',
      notificationTime: 5,
    } as Event;

    const result = convertEventToDateRange(testEvent);

    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);

    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(7);
    expect(result.start.getDate()).toBe(21);
    expect(result.start.getHours()).toBe(10);
    expect(result.start.getMinutes()).toBe(0);

    expect(result.end.getHours()).toBe(12);
    expect(result.end.getMinutes()).toBe(0);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const testEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '20225-08-21',
      startTime: '10:00',
      endTime: '12:00',
      description: '테스트 설명',
      location: '회의실',
      category: '업무',
      notificationTime: 5,
    } as Event;
    const result = convertEventToDateRange(testEvent);
    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const testEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-08-21',
      startTime: '101:00',
      endTime: '122:00',
      description: '테스트 설명',
      location: '회의실',
      category: '업무',
      notificationTime: 5,
    } as Event;
    const result = convertEventToDateRange(testEvent);
    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = {
      id: '1',
      title: '회의 1',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      notificationTime: 5,
    } as Event;

    const event2 = {
      id: '2',
      title: '회의 2',
      date: '2025-08-21',
      startTime: '11:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      notificationTime: 5,
    } as Event;

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = {
      id: '1',
      title: '회의 1',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      notificationTime: 5,
    } as Event;

    const event2 = {
      id: '2',
      title: '회의 2',
      date: '2025-08-21',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      notificationTime: 5,
    } as Event;

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const existingEvents = [
      {
        id: '1',
        title: '회의 1',
        date: '2025-08-21',
        startTime: '10:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        notificationTime: 5,
      },
      {
        id: '2',
        title: '회의 2',
        date: '2025-08-21',
        startTime: '13:00',
        endTime: '14:00',
        description: '',
        location: '',
        category: '',
        notificationTime: 5,
      },
    ] as Event[];

    const newEvent = {
      id: '3',
      title: '새 회의',
      date: '2025-08-21',
      startTime: '11:00',
      endTime: '13:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' },
      notificationTime: 5,
    } as Event;

    const overlapping = findOverlappingEvents(newEvent, existingEvents);
    expect(overlapping).toHaveLength(2);
    expect(overlapping.map((e) => e.id)).toContain('1');
    expect(overlapping.map((e) => e.id)).toContain('2');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const existingEvents = [
      {
        id: '1',
        title: '회의 1',
        date: '2025-08-21',
        startTime: '10:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        notificationTime: 5,
      },
    ] as Event[];

    const newEvent = {
      id: '2',
      title: '새 회의',
      date: '2025-08-21',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      notificationTime: 5,
    } as Event;

    const overlapping = findOverlappingEvents(newEvent, existingEvents);
    expect(overlapping).toHaveLength(0);
  });
});
