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

    expect(parseDateTime(date, time)).toEqual(new Date(2025, 6, 1, 14, 30));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const wrongDate = '2025-072-01';
    const time = '14:30';

    const parsingWrongDate = parseDateTime(wrongDate, time).getTime();
    expect(isNaN(parsingWrongDate)).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const wrongTime = '141:30';

    const parsingWrongTime = parseDateTime(date, wrongTime).getTime();
    expect(isNaN(parsingWrongTime)).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const emptyDate = '';
    const time = '14:30';

    const parsingWrongTime = parseDateTime(emptyDate, time).getTime();
    expect(isNaN(parsingWrongTime)).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = {
      date: '2025-08-22',
      startTime: '10:00',
      endTime: '16:00',
    } as Event;

    expect(convertEventToDateRange(event)).toEqual({
      start: new Date(2025, 7, 22, 10), // 2025-08-22 10:00
      end: new Date(2025, 7, 22, 16), // 2025-08-22 16:00
    });
  });

  // wrongDateEvent의 반환값은 parseDateTime을 그대로 반환하는 것으로 Invalid Date 여부는 parseDateTime의 책임이다
  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const wrongDateEvent = {
      date: '2025-08-228088',
      startTime: '10:00',
      endTime: '16:00',
    } as Event;

    const startTime = convertEventToDateRange(wrongDateEvent).start.getTime();
    const endTime = convertEventToDateRange(wrongDateEvent).end.getTime();

    expect(isNaN(startTime) || isNaN(endTime)).toBe(true);
  });

  // wrongDateEvent의 반환값은 parseDateTime을 그대로 반환하는 것으로 Invalid Date 여부는 parseDateTime의 책임이다
  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const wrongTimeEvent = {
      date: '2025-08-22',
      startTime: '시작시간은 열시다!',
      endTime: '16:00',
    } as Event;

    const startTime = convertEventToDateRange(wrongTimeEvent).start.getTime();
    const endTime = convertEventToDateRange(wrongTimeEvent).end.getTime();

    expect(isNaN(startTime) || isNaN(endTime)).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event = {
      date: '2025-08-22',
      startTime: '10:00',
      endTime: '16:00',
    } as Event;

    const overlappedEvent = {
      date: '2025-08-22',
      startTime: '14:00',
      endTime: '18:00',
    } as Event;

    expect(isOverlapping(event, overlappedEvent)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event = {
      date: '2025-08-22',
      startTime: '10:00',
      endTime: '12:00',
    } as Event;
    const notOverlappedEvent = {
      date: '2025-08-22',
      startTime: '14:00',
      endTime: '18:00',
    } as Event;

    expect(isOverlapping(event, notOverlappedEvent)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = {
      date: '2025-08-22',
      startTime: '10:00',
      endTime: '16:00',
    } as Event;

    const notOverlappedEvents = [
      { id: 'firstNotOverlapped', date: '2025-08-22', startTime: '09:00', endTime: '09:30' },
      { id: 'secondNotOverlapped', date: '2025-08-22', startTime: '17:00', endTime: '18:00' },
    ] as Event[];

    const overlappedEvents = [
      { id: 'firstOverlapped', date: '2025-08-22', startTime: '14:00', endTime: '18:00' },
      { id: 'secondOverlapped', date: '2025-08-22', startTime: '06:00', endTime: '12:00' },
    ] as Event[];

    expect(
      findOverlappingEvents(newEvent, [...notOverlappedEvents, ...overlappedEvents])
    ).toMatchObject([{ id: 'firstOverlapped' }, { id: 'secondOverlapped' }]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = {
      date: '2025-08-22',
      startTime: '10:00',
      endTime: '16:00',
    } as Event;

    const notOverlappedEvents = [
      { id: 'firstNotOverlapped', date: '2025-08-22', startTime: '09:00', endTime: '09:30' },
      { id: 'secondNotOverlapped', date: '2025-08-22', startTime: '17:00', endTime: '18:00' },
    ] as Event[];

    const overlappedEvents = [] as Event[];

    expect(findOverlappingEvents(newEvent, [...notOverlappedEvents, ...overlappedEvents])).toEqual(
      []
    );
  });
});
