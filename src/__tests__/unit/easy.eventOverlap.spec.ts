import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date(2025, 6, 1, 14, 30));
  });

  // 표준 날짜 형식 YYYY-MM-DD
  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025/07/01', '14:30').getTime()).toBeNaN();
    expect(parseDateTime('2025.07.01', '14:30').getTime()).toBeNaN();
    expect(parseDateTime('2025_07_01', '14:30').getTime()).toBeNaN();
  });

  // 표준 날짜 형식 HH:mm
  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '14.30').getTime()).toBeNaN();
    expect(parseDateTime('2025-07-01', '14/30').getTime()).toBeNaN();
    expect(parseDateTime('2025-07-01', '14_30').getTime()).toBeNaN();
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14.30').getTime()).toBeNaN();
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const MOCK_EVENT: Event = {
      id: 'new-1',
      title: '오전 회의',
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '월초 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    expect(convertEventToDateRange(MOCK_EVENT)).toEqual({
      start: new Date('2025-08-01T09:00'),
      end: new Date('2025-08-01T10:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const MOCK_EVENT: Event = {
      id: 'new-1',
      title: '오전 회의',
      date: '2025_08_01',
      startTime: '09:00',
      endTime: '10:00',
      description: '월초 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    expect(convertEventToDateRange(MOCK_EVENT).start.getTime()).toBeNaN();

    MOCK_EVENT.date = '2025/08/01';
    expect(convertEventToDateRange(MOCK_EVENT).start.getTime()).toBeNaN();
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const MOCK_EVENT: Event = {
      id: 'new-1',
      title: '오전 회의',
      date: '2025-08-01',
      startTime: '0900',
      endTime: '1000',
      description: '월초 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    expect(convertEventToDateRange(MOCK_EVENT).start.getTime()).toBeNaN();

    MOCK_EVENT.startTime = '09/00';
    MOCK_EVENT.endTime = '10/00';
    expect(convertEventToDateRange(MOCK_EVENT).start.getTime()).toBeNaN();
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const MOCK_EVENTS: Event[] = [
      {
        id: 'new-1',
        title: '오전 회의',
        date: '2025-08-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '월초 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '80d85368-b4a4-47b3-b959-25171d49371f',
        title: '운동',
        date: '2025-08-01',
        startTime: '09:59',
        endTime: '19:00',
        description: '주간 운동',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];
    expect(isOverlapping(MOCK_EVENTS[0], MOCK_EVENTS[1])).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const MOCK_EVENTS: Event[] = [
      {
        id: '80d85368-b4a4-47b3-b959-25171d49371f',
        title: '운동',
        date: '2025-08-01',
        startTime: '10:00',
        endTime: '19:00',
        description: '주간 운동',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: 'new-1',
        title: '오전 회의',
        date: '2025-08-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '월초 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    expect(isOverlapping(MOCK_EVENTS[0], MOCK_EVENTS[1])).toBe(false);

    MOCK_EVENTS[0].startTime = '12:00';
    expect(isOverlapping(MOCK_EVENTS[0], MOCK_EVENTS[1])).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const MOCK_EVENTS: Event[] = [
    {
      id: 'new-1',
      title: '오전 회의',
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '월초 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '80d85368-b4a4-47b3-b959-25171d49371f',
      title: '운동',
      date: '2025-08-01',
      startTime: '09:59',
      endTime: '19:00',
      description: '주간 운동',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    expect(
      findOverlappingEvents(
        {
          id: 'newEvent',
          title: '새이벤트',
          date: '2025-08-01',
          startTime: '09:50',
          endTime: '20:00',
          description: '주간 운동',
          location: '헬스장',
          category: '개인',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 1,
        },
        MOCK_EVENTS
      )
    ).toEqual(MOCK_EVENTS);

    expect(
      findOverlappingEvents(
        {
          id: 'newEvent',
          title: '새이벤트',
          date: '2025-08-01',
          startTime: '09:10',
          endTime: '09:30',
          description: '주간 운동',
          location: '헬스장',
          category: '개인',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 1,
        },
        MOCK_EVENTS
      )
    ).toEqual([MOCK_EVENTS[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const testCases: Event[] = [
      {
        id: 'newEvent',
        title: '새이벤트',
        date: '2025-08-01',
        startTime: '08:10',
        endTime: '08:59',
        description: '주간 운동',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: 'newEvent',
        title: '새이벤트',
        date: '2025-08-01',
        startTime: '19:01',
        endTime: '19:59',
        description: '주간 운동',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: 'newEvent',
        title: '새이벤트',
        date: '2025-08-03',
        startTime: '00:10',
        endTime: '01:30',
        description: '주간 운동',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    testCases.forEach((newEvent) => {
      expect(findOverlappingEvents(newEvent, MOCK_EVENTS)).toEqual([]);
    });
  });
});
