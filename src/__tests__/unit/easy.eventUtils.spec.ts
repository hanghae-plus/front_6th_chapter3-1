import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  // 테스트용 이벤트 데이터
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '첫 번째 이벤트',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-02',
      startTime: '14:00',
      endTime: '15:00',
      description: '두 번째 이벤트',
      location: '회의실 B',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
    {
      id: '3',
      title: 'event3',
      date: '2025-07-08',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 회의',
      location: '온라인',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
    {
      id: '4',
      title: 'EVENT4',
      date: '2025-07-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀 점심',
      location: '식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '5',
      title: '프로젝트 마감',
      date: '2025-07-31',
      startTime: '09:00',
      endTime: '18:00',
      description: '월말 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-07-01'), 'week');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');

    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-15'), 'month');

    expect(result).toHaveLength(5);
    expect(result.map((e) => e.id)).toEqual(['1', '2', '3', '4', '5']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2025-07-01'), 'week');

    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-15'), 'month');

    expect(result).toHaveLength(5);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, 'EVENT', new Date('2025-07-15'), 'month');

    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(['3', '4']);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const eventsWithBoundary: Event[] = [
      ...mockEvents,
      {
        id: '6',
        title: '6월 마지막 이벤트',
        date: '2025-06-30',
        startTime: '16:00',
        endTime: '17:00',
        description: '6월 마지막 날 이벤트',
        location: '사무실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '7',
        title: '8월 첫 이벤트',
        date: '2025-08-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '8월 첫날 이벤트',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    const result = getFilteredEvents(eventsWithBoundary, '', new Date('2025-07-15'), 'month');

    expect(result).toHaveLength(5);
    expect(result.map((e) => e.id)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '이벤트', new Date('2025-07-15'), 'month');

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
