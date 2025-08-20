import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/realEvents.json';
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-01'));
});

const currentDate = new Date();
const testEvents = events as Event[];

describe('useSearch', () => {
  describe('초기 상태와 빈 검색어 처리', () => {
    it.skip('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {});

    it('초기화 시 검색어가 비어있으면 모든 이벤트가 반환되어야 한다', () => {
      // Given: 빈 검색어로 훅 초기화
      const { result } = renderHook(() => useSearch(testEvents, currentDate, 'month'));

      // When: 빈 검색어 설정 (초기 상태 확인)
      act(() => {
        result.current.setSearchTerm('');
      });

      // Then: 전체 이벤트 리스트가 그대로 반환되어야 함
      expect(result.current.filteredEvents).toEqual(testEvents);
    });
  });

  describe.skip('검색어에 맞는 이벤트만 필터링해야 한다', () => {});

  describe('검색어 기반 필터링', () => {
    it('검색어 "프로젝트"로 검색하면 제목에 프로젝트가 포함된 이벤트만 반환해야 한다', () => {
      // Given: 월간 뷰로 검색 훅 초기화
      const { result } = renderHook(() => useSearch(testEvents, currentDate, 'month'));

      // When: "프로젝트" 검색어 설정
      act(() => {
        result.current.setSearchTerm('프로젝트');
      });

      // Then: 제목에 "프로젝트"가 포함된 이벤트만 반환
      const expectedEvents = testEvents.filter((event) => event.title.includes('프로젝트'));
      expect(result.current.filteredEvents).toEqual(expectedEvents);
    });

    it('검색어 "프로젝트 마감"으로 검색하면 정확히 일치하는 이벤트만 반환해야 한다', () => {
      // Given: 월간 뷰로 검색 훅 초기화
      const { result } = renderHook(() => useSearch(testEvents, currentDate, 'month'));

      // When: "프로젝트 마감" 검색어 설정
      act(() => {
        result.current.setSearchTerm('프로젝트 마감');
      });

      // Then: "프로젝트 마감"이 포함된 이벤트만 반환
      const expectedEvents = testEvents.filter((event) => event.title.includes('프로젝트 마감'));
      expect(result.current.filteredEvents).toEqual(expectedEvents);
    });
  });

  describe.skip('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {});

  describe('다중 필드 검색 기능', () => {
    it('검색어가 제목, 설명, 위치 중 어느 필드에라도 포함되면 해당 이벤트를 반환해야 한다', () => {
      // Given: 월간 뷰로 검색 훅 초기화
      const { result } = renderHook(() => useSearch(testEvents, currentDate, 'month'));

      // When: 특정 검색어로 검색 실행
      act(() => {
        result.current.setSearchTerm('프로젝트');
      });

      // Then: 제목, 설명, 위치 중 하나라도 검색어를 포함하는 이벤트 반환
      const expectedEvents = testEvents.filter(
        (event) =>
          event.title.includes('프로젝트') ||
          event.description.includes('프로젝트') ||
          event.location.includes('프로젝트')
      );
      expect(result.current.filteredEvents).toEqual(expectedEvents);
    });
  });

  describe.skip("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {});

  describe('검색어 실시간 업데이트', () => {
    it('검색어를 변경하면 필터링 결과가 즉시 업데이트되어야 한다', () => {
      // Given: 월간 뷰로 검색 훅 초기화
      const { result } = renderHook(() => useSearch(testEvents, currentDate, 'month'));

      // When: 첫 번째 검색어 설정
      act(() => {
        result.current.setSearchTerm('프로젝트');
      });

      // Then: 첫 번째 검색 결과 확인
      const firstSearchResults = testEvents.filter(
        (event) =>
          event.title.includes('프로젝트') ||
          event.description.includes('프로젝트') ||
          event.location.includes('프로젝트')
      );
      expect(result.current.filteredEvents).toEqual(firstSearchResults);

      // When: 검색어를 다른 단어로 변경
      act(() => {
        result.current.setSearchTerm('회의');
      });

      // Then: 변경된 검색어에 맞는 새로운 결과가 즉시 반영되어야 함
      const secondSearchResults = testEvents.filter(
        (event) =>
          event.title.includes('회의') ||
          event.description.includes('회의') ||
          event.location.includes('회의')
      );
      expect(result.current.filteredEvents).toEqual(secondSearchResults);
    });

    it('검색어를 빈 문자열로 변경하면 모든 이벤트가 다시 표시되어야 한다', () => {
      // Given: 검색어가 설정된 상태
      const { result } = renderHook(() => useSearch(testEvents, currentDate, 'month'));

      act(() => {
        result.current.setSearchTerm('프로젝트');
      });

      // When: 검색어를 빈 문자열로 변경
      act(() => {
        result.current.setSearchTerm('');
      });

      // Then: 모든 이벤트가 다시 표시되어야 함
      expect(result.current.filteredEvents).toEqual(testEvents);
    });
  });

  describe.skip('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {});

  describe('뷰 범위 필터링', () => {
    it('주간 뷰에서는 기준일이 속한 주(2025-08-24~2025-08-30)의 이벤트만 반환해야 한다', () => {
      // Given: 2025-08-25가 포함된 주간 뷰로 훅 초기화
      const weekDate = new Date('2025-08-25'); // 월요일, 해당 주는 08-24(일) ~ 08-30(토)
      const { result } = renderHook(() => useSearch(testEvents, weekDate, 'week'));

      // When: 서로 다른 검색어로 검색 실행
      // 1) 주간 범위에 없는 이벤트(예: 2025-08-20 "팀 회의")
      act(() => {
        result.current.setSearchTerm('회의');
      });

      // Then: 주간 범위 밖이므로 결과는 비어야 함
      expect(result.current.filteredEvents).toEqual([]);

      // When: 주간 범위에 있는 이벤트(예: 2025-08-25 "프로젝트 마감")
      act(() => {
        result.current.setSearchTerm('프로젝트');
      });

      // Then: 해당 주(08-24~08-30)에 속하는 매칭 이벤트만 반환되어야 함
      const expected = testEvents.filter((e) => e.title === '프로젝트 마감');
      expect(result.current.filteredEvents).toEqual(expected);
    });

    it('월간 뷰에서는 기준일이 속한 월(2025-08)의 이벤트만 반환해야 한다', () => {
      // Given: 2025-08-15 기준의 월간 뷰로 훅 초기화
      const monthDate = new Date('2025-08-15');
      const { result } = renderHook(() => useSearch(testEvents, monthDate, 'month'));

      // When: 특정 검색어로 검색 (예: "프로젝트" -> 2025-08-25)
      act(() => {
        result.current.setSearchTerm('프로젝트');
      });

      // Then: 해당 월(8월)에 속하는 매칭 이벤트만 반환되어야 함
      const expected = testEvents.filter((e) => e.title === '프로젝트 마감');
      expect(result.current.filteredEvents).toEqual(expected);
    });
  });

  describe('검색 결과 없음 처리', () => {
    it('존재하지 않는 검색어로 검색하면 빈 배열을 반환해야 한다', () => {
      // Given: 월간 뷰로 검색 훅 초기화
      const { result } = renderHook(() => useSearch(testEvents, currentDate, 'month'));

      // When: 존재하지 않는 검색어로 검색
      act(() => {
        result.current.setSearchTerm('존재하지않는검색어12345');
      });

      // Then: 빈 배열이 반환되어야 함
      expect(result.current.filteredEvents).toEqual([]);
    });
  });
});
