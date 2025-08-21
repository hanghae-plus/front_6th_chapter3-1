import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
describe('parseDateTime', () => {
  it.only('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');

    expect(result).toBeInstanceOf(Date);
    expect(result).toEqual(new Date('2025-07-01T14:30'));
  });

  it.only('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('20250701', '14:30');

    expect(result.getTime()).toBeNaN();
    expect(result.toString()).toBe('Invalid Date');
  });

  it.only('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', '1430');

    expect(result.getTime()).toBeNaN();
    expect(result.toString()).toBe('Invalid Date');
  });

  it.only('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');

    expect(result.getTime()).toBeNaN();
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  const mockEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-08-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  };

  it.only('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(mockEvent);

    expect(result.start).toEqual(new Date('2025-08-20T10:00'));
    expect(result.end).toEqual(new Date('2025-08-20T11:00'));
    expect(result.start < result.end).toBe(true);
  });

  it.only('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = {
      ...mockEvent,
      date: '20250820',
    };

    const result = convertEventToDateRange(invalidEvent);

    expect(result.start.getTime()).toBeNaN();
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.getTime()).toBeNaN();
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it.only('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = {
      ...mockEvent,
      startTime: '1000',
      endTime: '1100',
    };

    const result = convertEventToDateRange(invalidEvent);

    expect(result.start.getTime()).toBeNaN();
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.getTime()).toBeNaN();
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  const event1: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-08-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  };

  it.only('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event2: Event = {
      ...event1,
      id: '2',
      title: '프로젝트 회의',
      startTime: '10:30',
      endTime: '11:30',
    };

    const result = isOverlapping(event1, event2);

    expect(result).toBe(true);
  });

  it.only('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event2: Event = {
      ...event1,
      id: '3',
      title: '점심 팀회식',
      startTime: '12:00',
      endTime: '13:00',
    };

    const result = isOverlapping(event1, event2);

    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const mockEvent: Event[] = [
    {
      id: '1',
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
    {
      id: '3',
      title: '점심 팀회식',
      date: '2025-08-20',
      startTime: '12:00',
      endTime: '13:00',
      description: '분기 팀 회식',
      location: '강동화로',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it.only('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '2',
      title: '프로젝트 회의',
      date: '2025-08-20',
      startTime: '10:30',
      endTime: '11:30',
      description: '주간 프로젝트 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = findOverlappingEvents(newEvent, mockEvent);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it.only('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '5',
      title: '긴급 이슈 회의',
      date: '2025-08-20',
      startTime: '14:00',
      endTime: '15:00',
      description: '긴급긴급 🚨🆘',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = findOverlappingEvents(newEvent, mockEvent);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
