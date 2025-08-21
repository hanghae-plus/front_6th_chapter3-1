import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { createEvent } from '../utils';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-00', '14:30')).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '25:30')).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '25:30')).toEqual(new Date('Invalid Date'));
  });

  it('시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '')).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = createEvent({ id: '1', date: '2025-01-01' });

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('2025-01-01T09:00'),
      end: new Date('2025-01-01T10:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createEvent({ id: '1', date: '2025-08-32' });

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('IInvalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createEvent({
      id: '1',
      date: '2025-08-18',
      title: 'wrongTimeEvent',
      startTime: '24:00',
      endTime: '25:00',
    });

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('2025-08-18T24:00'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  const events = [
    createEvent({ id: '1', date: '2025-08-18' }),
    createEvent({ id: '2', date: '2025-08-18' }),
    createEvent({ id: '3', date: '2025-08-28' }),
  ];
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(isOverlapping(events[0], events[1])).toBeTruthy();
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(isOverlapping(events[0], events[2])).toBeFalsy();
  });
});

describe('findOverlappingEvents', () => {
  const events = [
    createEvent({ id: '1', date: '2025-08-08' }),
    createEvent({ id: '2', date: '2025-08-18' }),
    createEvent({ id: '3', date: '2025-08-28' }),
    createEvent({ id: '4', date: '2025-08-18' }),
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = createEvent({ id: '5', date: '2025-08-18' });

    expect(findOverlappingEvents(newEvent, events)).toEqual([events[1], events[3]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = createEvent({ id: '5', date: '2025-09-08' });

    expect(findOverlappingEvents(newEvent, events)).toEqual([]);
  });
});
