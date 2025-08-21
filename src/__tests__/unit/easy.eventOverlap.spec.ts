import { expect } from 'vitest';

import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { factoriesEvents, overlapingEvents } from '../__fixture__/eventFactory.ts';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2025-07-01';
    const time = '14:30';

    expect(parseDateTime(date, time)).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    //Date { NaN }
    expect(parseDateTime('2025-09-666', '12:00').getDate()).toBeNaN();
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-09-666', '299:00').getDate()).toBeNaN();
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '12:00').toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange({
      id: '1',
      title: '기존 회의',
      date: '2025-05-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });

    expect(result).toEqual({
      start: new Date(2025, 4, 1, 9),
      end: new Date(2025, 4, 1, 10),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      id: '1',
      title: '기존 회의',
      date: '2025-05-2000',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      id: '1',
      title: '기존 회의',
      date: '2025-05-2000',
      startTime: '500:000',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });

    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(isOverlapping(overlapingEvents[0], overlapingEvents[1])).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(isOverlapping(factoriesEvents[0], factoriesEvents[1])).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const existingEvents = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-05-01',
        startTime: '09:00',
        endTime: '11:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-05-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '동료와 점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 5,
      },
      {
        id: '3',
        title: '점심 약속',
        date: '2025-05-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '동료와 점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 5,
      },
    ] as Event[];

    expect(findOverlappingEvents(existingEvents[0], existingEvents)).toEqual([
      existingEvents[1],
      existingEvents[2],
    ]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const existingEvents = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-05-01',
        startTime: '09:00',
        endTime: '11:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-05-03',
        startTime: '10:00',
        endTime: '11:00',
        description: '동료와 점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 5,
      },
      {
        id: '3',
        title: '점심 약속',
        date: '2025-05-04',
        startTime: '10:00',
        endTime: '11:00',
        description: '동료와 점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 5,
      },
    ] as Event[];

    expect(findOverlappingEvents(existingEvents[0], existingEvents)).toEqual([]);
  });
});
