import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents - 이벤트 필터링', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-07-04',
      startTime: '12:00',
      endTime: '13:00',
      description: '고객과 점심',
      location: '레스토랑',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '개인 운동',
      date: '2025-07-19',
      startTime: '18:00',
      endTime: '19:00',
      description: '헬스장 운동',
      location: '피트니스 센터',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ];

  describe('검색 기능', () => {
    test('제목으로 특정 이벤트를 검색한다', () => {
      const result = getFilteredEvents(mockEvents, '점심', new Date('2025-07-01'), 'month');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('점심 약속');
    });

    test('검색어가 없으면 모든 이벤트를 반환한다', () => {
      const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
      expect(result).toHaveLength(3);
    });

    test('일치하는 이벤트가 없으면 빈 배열을 반환한다', () => {
      const result = getFilteredEvents(
        mockEvents,
        '존재하지않는이벤트',
        new Date('2025-07-01'),
        'month'
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('뷰별 필터링', () => {
    test('해당 주의 이벤트만 반환한다', () => {
      const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.title)).toEqual(['팀 회의', '점심 약속']);
    });

    test('해당 월의 모든 이벤트를 반환한다', () => {
      const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
      expect(result).toHaveLength(3);
      expect(result.map((e) => e.title)).toEqual(['팀 회의', '점심 약속', '개인 운동']);
    });
  });

  describe('검색과 뷰 조합', () => {
    test('검색어와 주간 뷰를 동시에 적용한다', () => {
      const result = getFilteredEvents(mockEvents, '약속', new Date('2025-07-01'), 'week');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('점심 약속');
    });

    test('검색어와 월간 뷰를 동시에 적용한다', () => {
      const result = getFilteredEvents(mockEvents, '팀', new Date('2025-07-01'), 'month');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('팀 회의');
    });
  });

  describe('예외 케이스', () => {
    test('월 경계의 이벤트를 정확히 필터링한다', () => {
      const borderEvents: Event[] = [
        ...mockEvents,
        {
          id: '4',
          title: '6월 마지막 이벤트',
          date: '2025-06-30',
          startTime: '23:00',
          endTime: '23:59',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 0,
        },
        {
          id: '5',
          title: '8월 첫 이벤트',
          date: '2025-08-01',
          startTime: '00:00',
          endTime: '01:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 0,
        },
      ];

      const result = getFilteredEvents(borderEvents, '', new Date('2025-07-15'), 'month');
      expect(result).toHaveLength(3);
      expect(result.every((e) => e.date.startsWith('2025-07'))).toBe(true);
    });

    test('빈 이벤트 배열에 대해 빈 배열을 반환한다', () => {
      const result = getFilteredEvents([], '검색어', new Date('2025-07-01'), 'month');
      expect(result).toHaveLength(0);
    });
  });
});
