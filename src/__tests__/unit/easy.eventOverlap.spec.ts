import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-7-01-03', '14:30');
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01-03', '14:30');
    expect(result).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 0,
      },
      notificationTime: 1,
    };
    const result = convertEventToDateRange(event);
    expect(result).toEqual({
      start: new Date('2025-08-25T09:00'),
      end: new Date('2025-08-25T18:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-08-25-04',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 0,
      },
      notificationTime: 1,
    };
    const result = convertEventToDateRange(event);
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00-03',
      endTime: '18:00-011',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 0,
      },
      notificationTime: 1,
    };
    const result = convertEventToDateRange(event);
    expect(result).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event: Event = {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 0,
      },
      notificationTime: 1,
    };

    const event2: Event = {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 0,
      },
      notificationTime: 1,
    };

    const event3: Event = {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '17:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 0,
      },
      notificationTime: 1,
    };

    const result = isOverlapping(event, event2);
    const result2 = isOverlapping(event, event3);
    expect(result).toBe(true);
    expect(result2).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event: Event = {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 0,
      },
      notificationTime: 1,
    };

    const event2: Event = {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '18:10',
      endTime: '19:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 0,
      },
      notificationTime: 1,
    };

    const result = isOverlapping(event, event2);
    expect(result).toBe(false);
  });
});

describe.only('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552aa',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 0,
      },
      notificationTime: 1,
    };

    const events: Event[] = [
      {
        id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
        title: '프로젝트 마감',
        date: '2025-08-25',
        startTime: '11:00',
        endTime: '12:00',
        description: '분기별 프로젝트 마감',
        location: '사무실',
        category: '업무',
        repeat: {
          type: 'none' as const,
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: 'da3ca408-836a-4d98-b67a-ca389d07552c',
        title: '프로젝트 마감',
        date: '2025-08-25',
        startTime: '13:00',
        endTime: '14:00',
        description: '분기별 프로젝트 마감',
        location: '사무실',
        category: '업무',
        repeat: {
          type: 'none' as const,
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: 'da3ca408-836a-4d98-b67a-ca389d07552d',
        title: '프로젝트 마감',
        date: '2025-08-25',
        startTime: '19:00',
        endTime: '20:00',
        description: '분기별 프로젝트 마감',
        location: '사무실',
        category: '업무',
        repeat: {
          type: 'none' as const,
          interval: 0,
        },
        notificationTime: 1,
      },
    ];
    const result = findOverlappingEvents(newEvent, events);
    expect(result).toEqual([events[0], events[1]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552aa',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 0,
      },
      notificationTime: 1,
    };

    const events: Event[] = [
      {
        id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
        title: '프로젝트 마감',
        date: '2025-08-25',
        startTime: '18:00',
        endTime: '19:00',
        description: '분기별 프로젝트 마감',
        location: '사무실',
        category: '업무',
        repeat: {
          type: 'none' as const,
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: 'da3ca408-836a-4d98-b67a-ca389d07552c',
        title: '프로젝트 마감',
        date: '2025-08-25',
        startTime: '19:00',
        endTime: '20:00',
        description: '분기별 프로젝트 마감',
        location: '사무실',
        category: '업무',
        repeat: {
          type: 'none' as const,
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: 'da3ca408-836a-4d98-b67a-ca389d07552d',
        title: '프로젝트 마감',
        date: '2025-08-25',
        startTime: '20:00',
        endTime: '21:00',
        description: '분기별 프로젝트 마감',
        location: '사무실',
        category: '업무',
        repeat: {
          type: 'none' as const,
          interval: 0,
        },
        notificationTime: 1,
      },
    ];
    const result = findOverlappingEvents(newEvent, events);
    expect(result).toEqual([]);
  });
});
