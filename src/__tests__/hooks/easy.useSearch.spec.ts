import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { createMockEvent } from '../utils.ts';

describe('useSearch: 이벤트 검색 훅 테스트', () => {
  const events = [
    createMockEvent(1, {
      title: '회의',
      description: '신규 개발건 회의',
      location: '회의실',
      date: '2025-10-03',
    }),
    createMockEvent(2, {
      title: '자료준비',
      description: '회의 자료 준비',
      location: '회의실',
      date: '2025-10-10',
    }),
    createMockEvent(3, {
      title: '점심 약속',
      description: '친구와 점심약속',
      location: '카페',
      date: '2025-10-11',
    }),
    createMockEvent(4, {
      title: '개발 공부',
      description: '테스트코드 공부',
      location: '집',
      date: '2025-10-12',
    }),
  ];

  describe('검색어 필터링', () => {
    it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
      const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

      act(() => {
        result.current.setSearchTerm('');
      });

      expect(result.current.filteredEvents).toEqual(events);
    });

    it('"공부" 검색시 관련 이벤트를 필터링 한다', () => {
      const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

      act(() => {
        result.current.setSearchTerm('공부');
      });

      const expectedEvent = events[3];
      expect(result.current.filteredEvents).toContain(expectedEvent);
    });

    it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
      const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

      act(() => {
        result.current.setSearchTerm('회의');
      });

      expect(result.current.filteredEvents).toHaveLength(2);
      expect(result.current.filteredEvents[0].title).toBe('회의');
      expect(result.current.filteredEvents[1].description).toContain('회의');
    });

    it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
      const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

      act(() => {
        result.current.setSearchTerm('회의');
      });

      expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2']);

      act(() => {
        result.current.setSearchTerm('점심');
      });

      expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['3']);
    });
  });

  describe('현재 뷰 필터링, 날짜 기준', () => {
    it('현재 뷰 주간에 해당하는 이벤트만 반환해야 한다', () => {
      const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

      act(() => {
        result.current.setSearchTerm('회의');
      });

      expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1']);
    });

    it('현재 뷰 월간에 해당하는 이벤트만 반환해야 한다', () => {
      const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

      act(() => {
        result.current.setSearchTerm('회의');
      });

      expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2']);
    });
  });
});
