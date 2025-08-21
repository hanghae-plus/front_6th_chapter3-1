import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { DINNER_0901, LUNCH_0901, MOCK_EVENTS } from '../mockEvents';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-17-01', '12:30')).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '25:30')).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '12:30')).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    expect(convertEventToDateRange(LUNCH_0901)).toEqual({
      start: new Date('2025-09-01T12:00:00'),
      end: new Date('2025-09-01T13:00:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(convertEventToDateRange({ ...LUNCH_0901, date: '2025-17-01' })).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({ ...LUNCH_0901, startTime: '32:00', endTime: '33:00' })
    ).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  const overLappingEvent = {
    ...LUNCH_0901,
    startTime: '12:00',
    endTime: '14:00',
  };
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(isOverlapping(overLappingEvent, LUNCH_0901)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const unOverLappingEvent = {
      ...LUNCH_0901,
      startTime: '14:00',
      endTime: '17:00',
    };
    expect(isOverlapping(unOverLappingEvent, LUNCH_0901)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const overLappingEvent = {
    ...LUNCH_0901,
    id: '100',
    startTime: '12:00',
    endTime: '14:00',
  };
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    expect(
      findOverlappingEvents(overLappingEvent, [LUNCH_0901, DINNER_0901, ...MOCK_EVENTS])
    ).toEqual([LUNCH_0901, DINNER_0901]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(findOverlappingEvents(LUNCH_0901, MOCK_EVENTS)).toEqual([]);
  });
});
