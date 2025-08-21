import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025--01', '14:30')).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '214:30')).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '214:30')).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    expect(
      convertEventToDateRange({
        date: '2025-07-01',
        startTime: '14:00',
        endTime: '14:30',
        title: '',
        category: '',
        description: '',
        id: '',
        location: '',
        notificationTime: 0,
        repeat: { interval: 0, type: 'daily', endDate: '' },
      })
    ).toEqual({
      start: new Date('2025-07-01T14:00'),
      end: new Date('2025-07-01T14:30'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        date: '2025--01',
        startTime: '14:00',
        endTime: '14:30',
        title: '',
        category: '',
        description: '',
        id: '',
        location: '',
        notificationTime: 0,
        repeat: { interval: 0, type: 'daily', endDate: '' },
      })
    ).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        date: '2025-07-01',
        startTime: ':00',
        endTime: '14:30',
        title: '',
        category: '',
        description: '',
        id: '',
        location: '',
        notificationTime: 0,
        repeat: { interval: 0, type: 'daily', endDate: '' },
      })
    ).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('2025-07-01T14:30'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(
      isOverlapping(
        {
          date: '2025-07-01',
          startTime: '09:00',
          endTime: '20:30',
          title: '',
          category: '',
          description: '',
          id: '',
          location: '',
          notificationTime: 0,
          repeat: { interval: 0, type: 'daily', endDate: '' },
        },
        {
          date: '2025-07-01',
          startTime: '10:00',
          endTime: '14:30',
          title: '',
          category: '',
          description: '',
          id: '',
          location: '',
          notificationTime: 0,
          repeat: { interval: 0, type: 'daily', endDate: '' },
        }
      )
    ).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(
      isOverlapping(
        {
          date: '2025-07-01',
          startTime: '09:00',
          endTime: '20:30',
          title: '',
          category: '',
          description: '',
          id: '',
          location: '',
          notificationTime: 0,
          repeat: { interval: 0, type: 'daily', endDate: '' },
        },
        {
          date: '2025-07-02',
          startTime: '10:00',
          endTime: '14:30',
          title: '',
          category: '',
          description: '',
          id: '',
          location: '',
          notificationTime: 0,
          repeat: { interval: 0, type: 'daily', endDate: '' },
        }
      )
    ).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const newEvent: Event = {
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '20:30',
    title: '',
    category: '',
    description: '',
    id: '1',
    location: '',
    notificationTime: 0,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  const newEvent2: Event = {
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '20:30',
    title: '',
    category: '',
    description: '',
    id: '1',
    location: '',
    notificationTime: 0,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  const event1: Event = {
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '14:30',
    title: '',
    category: '',
    description: '',
    id: '2',
    location: '',
    notificationTime: 0,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  const event2: Event = {
    date: '2025-07-02',
    startTime: '10:00',
    endTime: '14:30',
    title: '',
    category: '',
    description: '',
    id: '3',
    location: '',
    notificationTime: 0,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    expect(findOverlappingEvents(newEvent, [event1, event2])).toEqual([event1]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(findOverlappingEvents(newEvent2, [event1, event2])).toEqual([]);
  });
});
