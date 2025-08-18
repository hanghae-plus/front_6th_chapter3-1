import { Event } from '../../types';
import realEvents from '../../__mocks__/response/realEvents.json';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const time = parseDateTime('2025-08-01', '14:30');
    const expected = new Date('2025-08-01T14:30:00');
    expect(time).toEqual(expected);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const time = parseDateTime('2025-08-40', '14:30');
    expect(time.getDate()).toBeNaN();
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const time = parseDateTime('2025-08-01', '25:30');
    expect(time.getDate()).toBeNaN();
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const time = parseDateTime('', '14:30');
    expect(time.getDate()).toBeNaN();
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const eventObj = { date: '2025-08-01', startTime: '10:00', endTime: '15:00' } as Event;
    const dateRange = convertEventToDateRange(eventObj);

    const startTime = parseDateTime('2025-08-01', '10:00');
    const endTime = parseDateTime('2025-08-01', '15:00');

    const expected = { start: startTime, end: endTime };
    expect(dateRange).toEqual(expected);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const eventObj = { date: '2025-13-01', startTime: '10:00', endTime: '15:00' } as Event;
    const dateRange = convertEventToDateRange(eventObj);

    expect(dateRange.start.getTime()).toBeNaN();
    expect(dateRange.end.getTime()).toBeNaN();
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const eventObj = { date: '2025-08-01', startTime: '25:00', endTime: '27:00' } as Event;
    const dateRange = convertEventToDateRange(eventObj);

    expect(dateRange.start.getTime()).toBeNaN();
    expect(dateRange.end.getTime()).toBeNaN();
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const eventObj1 = { date: '2025-08-01', startTime: '10:00', endTime: '15:00' } as Event;
    const eventObj2 = { date: '2025-08-01', startTime: '12:00', endTime: '17:00' } as Event;
    const isOverlapped = isOverlapping(eventObj1, eventObj2);

    expect(isOverlapped).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const eventObj1 = { date: '2025-08-01', startTime: '10:00', endTime: '15:00' } as Event;
    const eventObj2 = { date: '2025-08-01', startTime: '16:00', endTime: '20:00' } as Event;
    const isOverlapped = isOverlapping(eventObj1, eventObj2);

    expect(isOverlapped).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const events = realEvents.events as Event[];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = { date: '2025-08-20', startTime: '10:00', endTime: '15:00' } as Event;
    const overlappedEvent = findOverlappingEvents(newEvent, events);
    const expected = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2025-08-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    expect(overlappedEvent).toEqual(expected);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = { date: '2025-08-15', startTime: '10:00', endTime: '15:00' } as Event;
    const overlappedEvent = findOverlappingEvents(newEvent, events);

    expect(overlappedEvent).toEqual([]);
  });
});
