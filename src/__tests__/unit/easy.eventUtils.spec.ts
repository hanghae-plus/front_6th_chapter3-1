import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '1',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-02',
      startTime: '11:00',
      endTime: '12:00',
      description: '2',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '3',
      title: '7월 3일 meeting',
      date: '2025-07-03',
      startTime: '12:00',
      endTime: '13:00',
      description: '3',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '4',
      title: '7월 마지막 날 Meeting',
      date: '2025-07-30',
      startTime: '12:00',
      endTime: '13:00',
      description: '4',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '5',
      title: '월초 회의',
      date: '2025-08-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '5',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const expected: Event[] = [events[1]];

    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'week');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual(events[0]);
    expect(result[1]).toEqual(events[1]);
    expect(result[2]).toEqual(events[2]);
    expect(result[3]).toEqual(events[3]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const expected: Event[] = [events[0], events[1], events[2]];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(events[0]);
    expect(result[1]).toEqual(events[1]);
    expect(result[2]).toEqual(events[2]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const expected: Event[] = [events[0], events[1], events[2], events[3]];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual(events[0]);
    expect(result[1]).toEqual(events[1]);
    expect(result[2]).toEqual(events[2]);
    expect(result[3]).toEqual(events[3]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const expected: Event[] = [events[0], events[1]];

    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(events[0]);
    expect(result[1]).toEqual(events[1]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const expected: Event[] = [events[0], events[1], events[2], events[3]];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual(events[0]);
    expect(result[1]).toEqual(events[1]);
    expect(result[2]).toEqual(events[2]);
    expect(result[3]).toEqual(events[3]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const expected: Event[] = [events[2], events[3]];

    const result = getFilteredEvents(events, 'meeting', new Date('2025-07-01'), 'month');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(events[2]);
    expect(result[1]).toEqual(events[3]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const expected: Event[] = [events[4]];

    const result = getFilteredEvents(events, '', new Date('2025-08-01'), 'month');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(events[4]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const expected: Event[] = [];

    const result = getFilteredEvents([], '', new Date('2025-08-01'), 'month');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(0);
  });
});
