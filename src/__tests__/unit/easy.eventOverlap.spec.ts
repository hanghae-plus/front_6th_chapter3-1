import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { createEventData } from './factories/eventFactory';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    // Invalid Date 를 반환 한다는 걸 어떻게 확인해야 좋을까?

    expect(parseDateTime('20250701', '14:30').getTime()).toBeNaN();
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '1430').getTime()).toBeNaN();
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '').getTime()).toBeNaN();
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const date = '2025-08-01';
    const startTime = '09:00';
    const endTime = '10:00';
    const event = createEventData({
      date,
      endTime,
      startTime,
    });

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date(`${date}T${startTime}`),
      end: new Date(`${date}T${endTime}`),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createEventData({
      date: '20250801',
      endTime: '10:00',
      startTime: '09:00',
    });
    const convertedDateRange = convertEventToDateRange(event);

    expect(convertedDateRange.start.getTime()).toBeNaN();
    expect(convertedDateRange.end.getTime()).toBeNaN();
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = createEventData({
      date: '2025-08-01',
      endTime: '1000',
      startTime: '0900',
    });
    const convertedDateRange = convertEventToDateRange(event);

    expect(convertedDateRange.start.getTime()).toBeNaN();
    expect(convertedDateRange.end.getTime()).toBeNaN();
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = createEventData({
      date: '2025-08-01',
      endTime: '11:00',
      startTime: '09:00',
    });
    const event2 = createEventData({
      date: '2025-08-01',
      endTime: '11:00',
      startTime: '10:00',
    });

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createEventData({
      date: '2025-08-01',
      endTime: '10:00',
      startTime: '09:00',
    });
    const event2 = createEventData({
      date: '2025-08-01',
      endTime: '11:00',
      startTime: '10:00',
    });

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const event1 = createEventData({
      id: '1',
      date: '2025-08-01',
      endTime: '11:00',
      startTime: '09:00',
    });
    const event2 = createEventData({
      id: '2',
      date: '2025-08-01',
      endTime: '11:00',
      startTime: '10:00',
    });
    const event3 = createEventData({
      id: '3',
      date: '2025-08-01',
      endTime: '11:00',
      startTime: '10:00',
    });

    expect(findOverlappingEvents(event1, [event1, event2, event3])).toEqual([event2, event3]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const event1 = createEventData({
      id: '1',
      date: '2025-08-02',
      endTime: '11:00',
      startTime: '09:00',
    });
    const event2 = createEventData({
      id: '2',
      date: '2025-08-01',
      endTime: '11:00',
      startTime: '10:00',
    });
    const event3 = createEventData({
      id: '3',
      date: '2025-08-01',
      endTime: '11:00',
      startTime: '10:00',
    });

    expect(findOverlappingEvents(event1, [event2, event3])).toEqual([]);
  });
});
