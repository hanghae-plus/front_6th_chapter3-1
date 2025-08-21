import { expect } from 'vitest';

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
    const time = '18:30';
    const dateResult = parseDateTime(date, time);

    expect(dateResult).toEqual(new Date('2025-07-01 18:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-13-01';
    const time = '18:30';
    const dateResult = parseDateTime(date, time);

    expect(dateResult.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-08-19';
    const time = '18:999';
    const dateResult = parseDateTime(date, time);

    expect(dateResult.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '18:30';
    const dateResult = parseDateTime(date, time);

    expect(dateResult.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-08-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const eventResult = convertEventToDateRange(event);

    expect(eventResult).toEqual({
      start: new Date('2025-08-15 09:00:00'),
      end: new Date('2025-08-15 10:00:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-08-3511111',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const invalidEventResult = convertEventToDateRange(invalidEvent);

    expect(invalidEventResult).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2025-08-3511111',
      startTime: '09:9999',
      endTime: '10:8888',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const invalidEventResult = convertEventToDateRange(invalidEvent);

    expect(invalidEventResult).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

const sameEvent1: Event = {
  id: '1',
  title: '기존 회의',
  date: '2025-08-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '기존 팀 미팅',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};
const sameEvent2: Event = {
  id: '1',
  title: '기존 회의',
  date: '2025-08-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '기존 팀 미팅',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

const diffEvent1: Event = {
  id: '1',
  title: '기존 회의',
  date: '2025-08-16',
  startTime: '09:00',
  endTime: '13:00',
  description: '기존 팀 미팅3',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const overlapping = isOverlapping(sameEvent1, sameEvent2);

    expect(overlapping).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const nonOverlapping = isOverlapping(sameEvent1, diffEvent1);

    expect(nonOverlapping).toBe(false);
  });
});

const existingEvents: Event[] = [
  {
    id: '1',
    title: '기존 회의1',
    date: '2025-08-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '기존 회의2',
    date: '2025-08-15',
    startTime: '13:00',
    endTime: '17:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '3',
      title: '기존 회의2',
      date: '2025-08-15',
      startTime: '13:00',
      endTime: '17:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const findSameEvents = findOverlappingEvents(newEvent, existingEvents);
    expect(findSameEvents).toEqual([
      {
        id: '2',
        title: '기존 회의2',
        date: '2025-08-15',
        startTime: '13:00',
        endTime: '17:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '5',
      title: '기존 회의2',
      date: '2025-08-31',
      startTime: '13:00',
      endTime: '17:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const findSameEvents = findOverlappingEvents(newEvent, existingEvents);
    expect(findSameEvents).toEqual([]);
  });
});
