import { createTestEvent } from '../../__mocks__/handlersUtils';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const testEvents = [
    createTestEvent({ id: '1', title: 'Event 1', date: '2025-07-01' }),
    createTestEvent({ id: '2', title: 'Event 2', date: '2025-07-02' }),
    createTestEvent({ id: '3', title: 'Stand up Meeting', date: '2025-07-10' }),
    createTestEvent({ id: '4', title: 'Stand up Meeting', date: '2025-07-30' }),
    createTestEvent({ id: '5', title: 'Monthly Meeting', date: '2025-07-31' }),
  ];

  describe('검색어 필터링', () => {
    it('제목으로 검색하면 해당 이벤트들만 반환한다', () => {
      // Given: 'Event' 검색어
      // When: 필터링 실행
      const result = getFilteredEvents(testEvents, 'Event', new Date('2025-07-01'), 'week');

      // Then: Event가 포함된 이벤트만 반환
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Event 1');
      expect(result[1].title).toBe('Event 2');
    });

    it('대소문자 구분 없이 검색된다', () => {
      // Given: 대문자 'EVENT' 검색어
      // When: 필터링 실행
      const result = getFilteredEvents(testEvents, 'EVENT', new Date('2025-07-01'), 'week');

      // Then: 대소문자 상관없이 검색됨
      expect(result).toHaveLength(2);
      expect(result.every((event) => event.title.toLowerCase().includes('event'))).toBe(true);
    });

    it('검색어가 없으면 모든 이벤트를 반환한다', () => {
      // Given: 빈 검색어
      // When: 필터링 실행
      const result = getFilteredEvents(testEvents, '', new Date('2025-07-01'), 'week');

      // Then: 모든 이벤트 반환
      expect(result).toHaveLength(5);
    });
  });

  describe('날짜 범위 필터링', () => {
    it('주간 뷰에서는 해당 주의 이벤트만 반환한다', () => {
      // Given: Event 검색어와 7월 1일 주간 뷰
      // When: 필터링 실행
      const result = getFilteredEvents(testEvents, 'Event', new Date('2025-07-01'), 'week');

      // Then: 해당 주의 Event만 반환
      expect(result).toHaveLength(2);
    });

    it('월말 주간에서도 정확히 필터링된다', () => {
      // Given: Meeting 검색어와 7월 30일 주간 뷰
      // When: 필터링 실행
      const result = getFilteredEvents(testEvents, 'Meeting', new Date('2025-07-30'), 'week');

      // Then: 해당 주의 Meeting만 반환
      expect(result).toHaveLength(2);
      expect(result.every((event) => event.title.includes('Meeting'))).toBe(true);
    });
  });

  describe('엣지 케이스', () => {
    it('빈 배열이면 빈 배열을 반환한다', () => {
      // Given: 빈 이벤트 배열
      // When: 필터링 실행
      const result = getFilteredEvents([], 'Event', new Date('2025-07-01'), 'week');

      // Then: 빈 배열 반환
      expect(result).toEqual([]);
    });

    it('없는 검색어면 빈 배열을 반환한다', () => {
      // Given: 존재하지 않는 검색어
      // When: 필터링 실행
      const result = getFilteredEvents(testEvents, '없는검색어', new Date('2025-07-01'), 'month');

      // Then: 빈 배열 반환
      expect(result).toEqual([]);
    });
  });
});
