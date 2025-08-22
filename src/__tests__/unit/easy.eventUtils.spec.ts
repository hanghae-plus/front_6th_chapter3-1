import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  // 7월 이벤트 갯수 : 5
  // 6월 이벤트 갯수 : 1
  // 8월 이벤트 갯수 : 1
  // 총 이벤트 갯수 : 7

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '첫 번째 이벤트입니다.',
      location: '회의실 A',
      category: '회의.',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-02',
      startTime: '14:00',
      endTime: '15:00',
      description: '두 번째 이벤트입니다',
      location: '회의실 B',
      category: '교육',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-08',
      startTime: '10:00',
      endTime: '11:00',
      description: '세 번째 이벤트입니다',
      location: '강당',
      category: '세미나',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
    {
      id: '4',
      title: '이벤트 4',
      date: '2025-07-15',
      startTime: '16:00',
      endTime: '17:00',
      description: '네 번째 이벤트입니다',
      location: '온라인',
      category: '웨비나',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 45,
    },
    {
      id: '5',
      title: '이벤트 5',
      date: '2025-06-30',
      startTime: '13:00',
      endTime: '14:00',
      description: '다섯 번째 이벤트입니다',
      location: '회의실 C',
      category: '회의',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 20,
    },
    {
      id: '6',
      title: '이벤트 6',
      date: '2025-08-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '여섯 번째 이벤트입니다',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
    {
      id: '7',
      title: '이벤트 7',
      date: '2025-07-31',
      startTime: '09:00',
      endTime: '10:00',
      description: '일곱 번째 이벤트입니다',
      location: '회의실 C',
      category: '회의',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
  ];

  describe('검색어 필터링', () => {
    it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
      const currentDate = new Date('2025-07-01');
      const result = getFilteredEvents(mockEvents, '이벤트 2', currentDate, 'week');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
      expect(result[0].title).toBe('이벤트 2');
    });

    it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
      const currentDate = new Date('2025-07-01');
      const result1 = getFilteredEvents(mockEvents, '회의실 a', currentDate, 'week');
      const result2 = getFilteredEvents(mockEvents, '회의실 A', currentDate, 'week');

      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
      expect(result1).toEqual(result2);
    });

    it('검색어가 제목, 설명, 위치에서 모두 검색된다', () => {
      const currentDate = new Date('2025-07-01');

      // 제목으로 검색
      const titleResult = getFilteredEvents(mockEvents, '이벤트 1', currentDate, 'week');
      expect(titleResult).toHaveLength(1);
      expect(titleResult[0].id).toBe('1');

      // 설명으로 검색
      const descResult = getFilteredEvents(mockEvents, '첫 번째', currentDate, 'week');
      expect(descResult).toHaveLength(1);
      expect(descResult[0].id).toBe('1');

      // 위치로 검색
      const locationResult = getFilteredEvents(mockEvents, '회의실 A', currentDate, 'week');
      expect(locationResult).toHaveLength(1);
      expect(locationResult[0].id).toBe('1');
    });
  });

  describe('주간 뷰 필터링', () => {
    it('검색어가 없을 때 주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
      const currentDate = new Date('2025-07-01'); // 2025-07-01은 화요일
      const result = getFilteredEvents(mockEvents, '', currentDate, 'week');

      expect(result).toHaveLength(3);
      expect(result.map((e) => e.id).sort()).toEqual(['1', '2', '5']);
    });

    it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
      const currentDate = new Date('2025-07-01');
      const result = getFilteredEvents(mockEvents, '이벤트', currentDate, 'week');

      expect(result).toHaveLength(3);
      expect(result.map((e) => e.id).sort()).toEqual(['1', '2', '5']);
    });
  });

  describe('월간 뷰 필터링', () => {
    it('검색어가 없을 때 월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
      const currentDate = new Date('2025-07-01');
      const result = getFilteredEvents(mockEvents, '', currentDate, 'month');

      expect(result).toHaveLength(5);
      expect(result.map((e) => e.id).sort()).toEqual(['1', '2', '3', '4', '7']);
    });
    // 엣지 케이스 추가
    it('월간 뷰에서 2025년 7월에 속하지 않는 이벤트는 반환하지 않는다', () => {
      const currentDate = new Date('2025-07-01');
      const result = getFilteredEvents(mockEvents, '', currentDate, 'month');
      expect(result.map((e) => e.id).sort()).not.toContain('5');
      expect(result.map((e) => e.id).sort()).not.toContain('6');
    });
    it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
      const currentDate = new Date('2025-07-01');
      const result = getFilteredEvents(mockEvents, '', currentDate, 'month');

      expect(result.map((e) => e.date)).not.toContain('2025-06-30');
      expect(result.map((e) => e.date)).not.toContain('2025-08-01');

      expect(result).toHaveLength(5);

      expect(result.map((e) => e.id).sort()).toEqual(['1', '2', '3', '4', '7']);
    });
  });

  // 의미있는 테스트일까?
  describe('빈 이벤트 리스트', () => {
    it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
      const currentDate = new Date('2025-07-01');
      const result = getFilteredEvents([], '이벤트', currentDate, 'week');

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });
});
