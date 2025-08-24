import { CalendarViewType, Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
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
      title: '이벤트 2',
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
    test('검색어 "이벤트 2"에 맞는 이벤트만 반환한다', () => {
      const result = getFilteredEvents(
        mockEvents,
        '이벤트 2',
        new Date('2025-07-01'),
        CalendarViewType.MONTH
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('이벤트 2');
    });

    test("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
      const result = getFilteredEvents(
        mockEvents,
        '이벤트',
        new Date('2025-07-01'),
        CalendarViewType.WEEK
      );
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
    });

    test('검색어가 없으면 모든 이벤트를 반환한다', () => {
      const result = getFilteredEvents(
        mockEvents,
        '',
        new Date('2025-07-01'),
        CalendarViewType.MONTH
      );
      expect(result).toHaveLength(3);
    });

    test('검색어가 대소문자를 구분하지 않고 작동한다', () => {
      const result = getFilteredEvents(
        mockEvents,
        '이벤트 2',
        new Date('2025-07-01'),
        CalendarViewType.MONTH
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('이벤트 2');
    });
  });

  describe('뷰별 필터링', () => {
    test('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
      const result = getFilteredEvents(
        mockEvents,
        '',
        new Date('2025-07-01'),
        CalendarViewType.WEEK
      );
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
    });

    test('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
      const result = getFilteredEvents(
        mockEvents,
        '',
        new Date('2025-07-01'),
        CalendarViewType.MONTH
      );
      expect(result).toHaveLength(3);
      expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', '개인 운동']);
    });
  });

  describe('예외 케이스', () => {
    test('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
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

      const result = getFilteredEvents(
        borderEvents,
        '',
        new Date('2025-07-15'),
        CalendarViewType.MONTH
      );
      expect(result).toHaveLength(3);
      expect(result.every((e) => e.date.startsWith('2025-07'))).toBe(true);
    });

    test('빈 이벤트 배열에 대해 빈 배열을 반환한다', () => {
      const result = getFilteredEvents(
        [],
        '검색어',
        new Date('2025-07-01'),
        CalendarViewType.MONTH
      );
      expect(result).toHaveLength(0);
    });
  });
});
