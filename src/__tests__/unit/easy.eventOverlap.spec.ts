import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
describe('parseDateTime', () => {
  // AS IS : 2025-07-01 14:30을 정확한 Date 객체로 변환한다
  // TO BE : 2025-07-01 14:30을 2025-07-01T14:30:00.000Z 형식의 Date 객체로 변환한다.
  it('TO BE : 2025-07-01 14:30을 2025-07-01T14:30:00.000Z 형식의 Date 객체로 변환한다.', () => {
    const date = '2025-07-01';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(result).toEqual(new Date(`${date}T${time}`));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidDate = '20250701';
    const time = '14:30';
    const result = parseDateTime(invalidDate, time);
    expect(result).toEqual(new Date('Invalid Date'));
  });
  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const invalidTime = '14:70:60';
    const result = parseDateTime(date, invalidTime);
    expect(result).toEqual(new Date('Invalid Date'));
  });
  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    const result = parseDateTime(date, time);
    expect(result).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  const NORMAL_MOCK_EVENT: Event = {
    id: '1',
    title: '기존 회의',
    date: '2025-08-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  // AS IS : 일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다.
  // TO BE : 이벤트의 시작/종료 문자열을 Date 객체로 파싱하여 { start, end } 형태로 반환한다.
  it('이벤트의 시작/종료 문자열을 Date 객체로 파싱하여 { start, end } 형태로 반환한다.', () => {
    const result = convertEventToDateRange(NORMAL_MOCK_EVENT);
    expect(result).toEqual({
      start: new Date('2025-08-01T09:00'),
      end: new Date('2025-08-01T10:00'),
    });
  });

  // AS IS : 잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다.
  // TO BE : 잘못된 날짜 형식의 이벤트를 변환하면 start와 end가 Invalid Date인 {start, end} 객체로 설정된다
  it('잘못된 날짜 형식의 이벤트를 변환하면 start와 end가 Invalid Date인 {start, end} 객체로 설정된다', () => {
    const INVALID_DATE_MOCK_EVENT = {
      ...NORMAL_MOCK_EVENT,
      date: '20250801', // 잘못된 날짜 형식
    };
    const result = convertEventToDateRange(INVALID_DATE_MOCK_EVENT);
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  // AS IS : 잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다.
  // TO BE : 3가지 테스트 케이스를 작성, 각각 시작 시간만 잘못된 경우, 종료 시간만 잘못된 경우, 둘 다 잘못된 경우
  it('잘못된 시작 시간 형식의 이벤트를 변환하면 start가 Invalid Date인 {start, end} 객체로 설정된다', () => {
    const INVALID_START_TIME_MOCK_EVENT = {
      ...NORMAL_MOCK_EVENT,
      startTime: '09:00:60', // 잘못된 시간 형식
    };
    const result = convertEventToDateRange(INVALID_START_TIME_MOCK_EVENT);
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('2025-08-01T10:00'),
    });
  });

  it('잘못된 종료 시간 형식의 이벤트를 변환하면 end가 Invalid Date인 {start, end} 객체로 설정된다', () => {
    const INVALID_END_TIME_MOCK_EVENT = {
      ...NORMAL_MOCK_EVENT,
      endTime: '10:00:60', // 잘못된 시간 형식
    };
    const result = convertEventToDateRange(INVALID_END_TIME_MOCK_EVENT);
    expect(result).toEqual({
      start: new Date('2025-08-01T09:00'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시작/종료 시간 형식의 이벤트를 변환하면 start와 end가 Invalid Date인 {start, end} 객체로 설정된다', () => {
    const INVALID_START_END_TIME_MOCK_EVENT = {
      ...NORMAL_MOCK_EVENT,
      startTime: '09:00:60', // 잘못된 시간 형식
      endTime: '10:00:60', // 잘못된 시간 형식
    };
    const result = convertEventToDateRange(INVALID_START_END_TIME_MOCK_EVENT);
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  const DEFAULT_MOCK_EVENT: Event = {
    id: '1',
    title: '기존 회의',
    date: '2025-08-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    // 두 이벤트가 09:00~10:00까지 겹침
    const OVERLAPPING_MOCK_EVENT: Event = {
      ...DEFAULT_MOCK_EVENT,
      id: '2',
      title: '기존 회의2',
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '12:00',
    };
    const result = isOverlapping(DEFAULT_MOCK_EVENT, OVERLAPPING_MOCK_EVENT);
    expect(result).toEqual(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    // 두 이벤트가 전혀 겹치지 않음

    const NON_OVERLAPPING_MOCK_EVENT: Event = {
      ...DEFAULT_MOCK_EVENT,
      id: '3',
      title: '기존 회의3',
      date: '2025-08-01',
      startTime: '11:00',
      endTime: '12:00',
    };
    const result = isOverlapping(DEFAULT_MOCK_EVENT, NON_OVERLAPPING_MOCK_EVENT);
    expect(result).toEqual(false);
  });

  // 두 이벤트의 날짜가 다르면서 시간이 동일한 경우 false를 반환하는 케이스 추가
  it('두 이벤트의 날짜가 다르면서 시간이 동일한 경우 false를 반환한다', () => {
    const NON_OVERLAPPING_MOCK_EVENT: Event = {
      ...DEFAULT_MOCK_EVENT,
      id: '4',
      title: '기존 회의4',
      date: '2025-08-02',
    };
    const result = isOverlapping(DEFAULT_MOCK_EVENT, NON_OVERLAPPING_MOCK_EVENT);
    expect(result).toEqual(false);
  });
});

describe('findOverlappingEvents', () => {
  const EVENTS: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-08-01',
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
      title: '기존 회의',
      date: '2025-08-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '기존 회의',
      date: '2025-08-01',
      startTime: '10:00',
      endTime: '12:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    // 10:00~13:00 사이에 겹치는 이벤트가 2개 있는 경우
    const OVERLAP_MOCK_EVENT: Event = {
      id: '4',
      title: '기존 회의',
      date: '2025-08-01',
      startTime: '10:00',
      endTime: '13:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    const result = findOverlappingEvents(OVERLAP_MOCK_EVENT, EVENTS);
    expect(result).toEqual([EVENTS[1], EVENTS[2]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    // 날짜가 아예 달라서 겹치는 이벤트가 없는 경우
    const NON_OVERLAP_MOCK_EVENT: Event = {
      id: '5',
      title: '기존 회의',
      date: '2025-08-02',
      startTime: '10:00',
      endTime: '13:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    const result = findOverlappingEvents(NON_OVERLAP_MOCK_EVENT, EVENTS);
    expect(result).toEqual([]);
  });
});
