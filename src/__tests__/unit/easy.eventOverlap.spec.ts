import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

// export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
//   return {
//     start: parseDateTime(date, startTime),
//     end: parseDateTime(date, endTime),
//   };
// }
const mockEvents: Event[] = [
  {
    id: '1',
    title: '면접공부',
    date: '2025-08-19',
    startTime: '10:00',
    endTime: '11:00',
    description: '면접 준비',
    location: '내 방',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '회의',
    date: '2025-13-19',
    startTime: '12:00',
    endTime: '13:00',
    description: '회의',
    location: '카페',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '코테풀기',
    date: '2025-08-19',
    startTime: '13:00',
    endTime: '25:00',
    description: '코테 풀기',
    location: '릿코드',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '코테풀기',
    date: '2025-08-19',
    startTime: '13:00',
    endTime: '22:00',
    description: '코테 풀기',
    location: '릿코드',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '코테풀기',
    date: '2025-08-19',
    startTime: '14:00',
    endTime: '23:00',
    description: '코테 풀기',
    location: '릿코드',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '6',
    title: '코테풀기',
    date: '2025-08-19',
    startTime: '13:00',
    endTime: '14:00',
    description: '코테 풀기',
    location: '릿코드',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '7',
    title: '코테풀기',
    date: '2025-08-19',
    startTime: '15:00',
    endTime: '16:00',
    description: '코테 풀기',
    location: '릿코드',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-32', '14:30')).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-32', '25:30')).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '25:30')).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = mockEvents[0];
    const expected = {
      start: new Date('2025-08-19T10:00'),
      end: new Date('2025-08-19T11:00'),
    };
    expect(convertEventToDateRange(event)).toEqual(expected);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = mockEvents[1];
    const expected = {
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    };
    expect(convertEventToDateRange(event)).toEqual(expected);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = mockEvents[2];
    const expected = {
      start: new Date('2025-08-19T13:00'),
      end: new Date('Invalid Date'),
    };
    expect(convertEventToDateRange(event)).toEqual(expected);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = mockEvents[3];
    const event2 = mockEvents[4];
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = mockEvents[4];
    const event2 = mockEvents[5];
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = {
      id: '8',
      title: '코테풀기',
      date: '2025-08-19',
      startTime: '10:00',
      endTime: '11:00',
      description: '코테 풀기',
      location: '릿코드',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    const overlappingEvents = findOverlappingEvents(newEvent, mockEvents);
    expect(overlappingEvents).toEqual([mockEvents[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = {
      id: '8',
      title: '면접공부',
      date: '2025-08-27',
      startTime: '10:00',
      endTime: '11:00',
      description: '면접 준비',
      location: '내 방',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    const overlappingEvents = findOverlappingEvents(newEvent, mockEvents);
    expect(overlappingEvents).toEqual([]);
  });
});
