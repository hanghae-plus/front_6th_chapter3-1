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

    const result = parseDateTime(date, time);

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidDate = 'invalid-date';
    const time = '14:30';

    const result = parseDateTime(invalidDate, time);

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2025-07-01';
    const invalidTime = 'invalid-time';

    const result = parseDateTime(date, invalidTime);

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const emptyDate = '';
    const time = '14:30';

    const result = parseDateTime(emptyDate, time);

    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:30',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '테스트 카테고리',
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);

    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(6);
    expect(result.start.getDate()).toBe(1);
    expect(result.start.getHours()).toBe(9);
    expect(result.start.getMinutes()).toBe(0);
    expect(result.end.getFullYear()).toBe(2025);
    expect(result.end.getMonth()).toBe(6);
    expect(result.end.getDate()).toBe(1);
    expect(result.end.getHours()).toBe(10);
    expect(result.end.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      id: '1',
      title: '테스트 이벤트',
      date: 'invalid-date',
      startTime: '09:00',
      endTime: '10:30',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '테스트 카테고리',
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-07-01',
      startTime: 'invalid-time',
      endTime: 'invalid-time',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '테스트 카테고리',
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  const event1 = {
    id: '1',
    title: '테스트 이벤트1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:30',
    description: '테스트 설명',
    location: '테스트 위치',
    category: '테스트 카테고리',
    notificationTime: 10,
  };

  const event2 = {
    id: '2',
    title: '테스트 이벤트2',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '10:30',
    description: '테스트 설명',
    location: '테스트 위치',
    category: '테스트 카테고리',
    notificationTime: 10,
  };

  const event3 = {
    id: '3',
    title: '테스트 이벤트3',
    date: '2025-07-01',
    startTime: '15:00',
    endTime: '15:30',
    description: '테스트 설명',
    location: '테스트 위치',
    category: '테스트 카테고리',
    notificationTime: 10,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const result = isOverlapping(event1, event2);

    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const result = isOverlapping(event1, event3);

    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const existingEvents = [
    {
      id: '1',
      title: '기존 이벤트1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:30',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '테스트 카테고리',
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 이벤트2',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '테스트 카테고리',
      notificationTime: 10,
    },
    {
      id: '3',
      title: '기존 이벤트3',
      date: '2025-07-01',
      startTime: '15:00',
      endTime: '16:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '테스트 카테고리',
      notificationTime: 10,
    },
    {
      id: '4',
      title: '기존 이벤트4',
      date: '2025-07-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '테스트 카테고리',
      notificationTime: 10,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = {
      id: '5',
      title: '새 이벤트',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '테스트 카테고리',
      notificationTime: 10,
    };

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
    expect(result[0].title).toBe('기존 이벤트2');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = {
      id: '5',
      title: '새 이벤트',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '테스트 카테고리',
      notificationTime: 10,
    };

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result).toHaveLength(0);
  });
});
