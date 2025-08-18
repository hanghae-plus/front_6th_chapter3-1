import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime 함수', () => {
  describe('정상적인 입력값 처리', () => {
    it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
      const result = parseDateTime('2024-07-01', '14:30');
      expect(result).toEqual(new Date('2024-07-01T14:30:00'));
    });
  });

  describe('잘못된 날짜 형식 처리', () => {
    it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
      const result = parseDateTime('2025 /08/19', '14:30');
      expect(result.toString()).toBe('Invalid Date');
    });

    it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
      const result = parseDateTime('2025-08-19', '23:542343');
      expect(result.toString()).toBe('Invalid Date');
    });

    it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
      const result = parseDateTime('', '02:30');
      expect(result.toString()).toBe('Invalid Date');
    });
  });
});
describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      date: '2025-08-19',
      startTime: '14:30',
      endTime: '15:30',
      title: '테스트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(result.start).toEqual(new Date('2025-08-19T14:30:00'));
    expect(result.end).toEqual(new Date('2025-08-19T15:30:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      date: '2025/08/231',
      startTime: '04:30',
      endTime: '05:30',
      title: '잘못된 날짜',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      date: '2025-08-19',
      startTime: '25:643',
      endTime: '26:34234',
      title: '잘못된 시간',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      date: '2025-08-19',
      startTime: '10:00',
      endTime: '12:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      date: '2025-08-19',
      startTime: '09:00',
      endTime: '11:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      date: '2025-08-19',
      startTime: '10:00',
      endTime: '12:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      date: '2025-08-20',
      startTime: '09:00',
      endTime: '11:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {});

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {});
});
