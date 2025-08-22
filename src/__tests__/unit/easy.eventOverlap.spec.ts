import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const inputStringDate = '2025-07-01';
    const inputStringTime = '14:30';
    const result = parseDateTime(inputStringDate, inputStringTime);

    expect(result).toEqual(new Date('2025-07-01 14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const inputStringDate = '2025-07-32';
    const inputStringTime = '15:30';
    const result = parseDateTime(inputStringDate, inputStringTime);

    expect(result).toEqual(new Date('2025-07-32 15:30'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const inputStringDate = '2025-07-25';
    const inputStringTime = '26:30';
    const result = parseDateTime(inputStringDate, inputStringTime);

    expect(result).toEqual(new Date('2025-07-32 26:30'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const inputStringDate = '';
    const inputStringTime = '14:30';
    const result = parseDateTime(inputStringDate, inputStringTime);

    expect(result).toEqual(new Date('14:30'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '16:45',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(mockEvent);

    expect(result.start).toEqual(new Date('2025-07-01T14:30'));
    expect(result.end).toEqual(new Date('2025-07-01T16:45'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidDateEvent: Event = {
      id: '2',
      title: '잘못된 날짜',
      date: '2025-13-40', // 잘못된 날짜
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(invalidDateEvent);

    expect(result.start).toEqual(new Date('2025-13-40T10:00'));
    expect(result.end).toEqual(new Date('2025-13-40T11:00'));
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeEvent: Event = {
      id: '3',
      title: '잘못된 시간',
      date: '2025-07-01',
      startTime: '25:99', // 잘못된 시간
      endTime: '26:00', // 잘못된 시간
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(invalidTimeEvent);
    expect(result.start).toEqual(
      new Date(`${invalidTimeEvent.date}T${invalidTimeEvent.startTime}`)
    );
    expect(result.start).toEqual(new Date(`${invalidTimeEvent.date}T${invalidTimeEvent.endTime}`));
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const overlappingEvent1: Event = {
      id: '1',
      title: '첫 번째 이벤트',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const overlappingEvent2: Event = {
      id: '2',
      title: '두 번째 이벤트',
      date: '2025-07-01',
      startTime: '11:00', // 첫 번째와 겹침
      endTime: '13:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = isOverlapping(overlappingEvent1, overlappingEvent2);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const nonOverlappingEvent1: Event = {
      id: '3',
      title: '아침 이벤트',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const nonOverlappingEvent2: Event = {
      id: '4',
      title: '점심 이벤트',
      date: '2025-07-01',
      startTime: '12:00', // 아침 이벤트와 안 겹침
      endTime: '13:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = isOverlapping(nonOverlappingEvent1, nonOverlappingEvent2);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const existingEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '11:00', // newOverlappingEvent와 겹침
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의 2',
      date: '2025-07-01',
      startTime: '11:00',
      endTime: '12:00', // newOverlappingEvent와 겹침
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '기존 회의 3',
      date: '2025-07-01',
      startTime: '13:00',
      endTime: '14:00', // 안 겹침
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '5',
      title: '새 이벤트',
      date: '2025-07-01',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result).toHaveLength(2);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '6',
      title: '안 겹치는 새 이벤트',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = findOverlappingEvents(newEvent, existingEvents);

    expect(result).toHaveLength(0);
  });
});
