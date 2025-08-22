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
    const expectedDate = new Date('2025-07-01T14:30:00');
    expect(parseDateTime(date, time)).toEqual(expectedDate);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = 'invalid-date';
    const time = '14:30';
    expect(parseDateTime(date, time).toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const time = 'invalid-time';
    expect(parseDateTime(date, time).toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    expect(parseDateTime(date, time).toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  const event: Event = {
    id: '1',
    title: 'Test Event',
    date: '2025-07-21',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const { start, end } = convertEventToDateRange(event);
    expect(start).toEqual(new Date('2025-07-21T10:00:00'));
    expect(end).toEqual(new Date('2025-07-21T11:00:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = { ...event, date: 'invalid' };
    const { start, end } = convertEventToDateRange(invalidEvent);
    expect(start.toString()).toBe('Invalid Date');
    expect(end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = { ...event, startTime: 'invalid' };
    const { start, end } = convertEventToDateRange(invalidEvent);
    expect(start.toString()).toBe('Invalid Date');
    expect(end).toEqual(new Date('2025-07-21T11:00:00'));
  });
});

describe('isOverlapping', () => {
  const event1: Event = {
    id: '1',
    title: 'Event 1',
    date: '2025-07-21',
    startTime: '10:00',
    endTime: '12:00',
    description: '',
    location: '',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  it('두 이벤트가 겹치는 경우 (부분 겹침) true를 반환한다', () => {
    const event2: Event = { ...event1, id: '2', startTime: '11:00', endTime: '13:00' };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('한 이벤트가 다른 이벤트를 완전히 포함하는 경우 true를 반환한다', () => {
    const event2: Event = { ...event1, id: '2', startTime: '10:30', endTime: '11:30' };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트의 시작 시간이 같은 경우 true를 반환한다', () => {
    const event2: Event = { ...event1, id: '2', startTime: '10:00', endTime: '11:00' };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('한 이벤트의 종료 시간이 다른 이벤트의 시작 시간과 같은 경우 (경계) false를 반환한다', () => {
    const event2: Event = { ...event1, id: '2', startTime: '12:00', endTime: '13:00' };
    expect(isOverlapping(event1, event2)).toBe(false);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event2: Event = { ...event1, id: '2', startTime: '13:00', endTime: '14:00' };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const existingEvents: Event[] = [
    {
      id: '1',
      title: 'Event 1',
      date: '2025-07-21',
      startTime: '10:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: 'Event 2',
      date: '2025-07-21',
      startTime: '13:00',
      endTime: '14:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: 'Event 3',
      date: '2025-07-21',
      startTime: '11:30',
      endTime: '12:30',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '4',
      title: 'New Event',
      date: '2025-07-21',
      startTime: '11:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const overlapping = findOverlappingEvents(newEvent, existingEvents);
    expect(overlapping.map((e) => e.id)).toEqual(['1', '3']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '4',
      title: 'New Event',
      date: '2025-07-21',
      startTime: '15:00',
      endTime: '16:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const overlapping = findOverlappingEvents(newEvent, existingEvents);
    expect(overlapping).toEqual([]);
  });

  it('수정 중인 이벤트는 겹침 검사에서 제외되어야 한다', () => {
    const updatingEvent: Event = {
      id: '1',
      title: 'Event 1 Updated',
      date: '2025-07-21',
      startTime: '11:45',
      endTime: '12:15',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const overlapping = findOverlappingEvents(updatingEvent, existingEvents);
    expect(overlapping.map((e) => e.id)).toEqual(['3']);
  });
});
