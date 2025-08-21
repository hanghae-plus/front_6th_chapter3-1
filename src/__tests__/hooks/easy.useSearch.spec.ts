import { act, renderHook } from '@testing-library/react';
import { useSearch } from '../../hooks/useSearch.ts';
import {
  MOCK_EVENTS,
  LUNCH_0822,
  LUNCH_0828,
  MEETING_0829,
  METTING_0823,
  MEETING_0926,
  LUNCH_0904,
} from '../mockEvents.ts';

const TEST_DATE = new Date('2025-08-21');

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(MOCK_EVENTS, TEST_DATE, 'month'));

  const currentEvents = MOCK_EVENTS.filter((event) => event.date.startsWith('2025-08')); //8월 일정만 필터링

  expect(result.current.filteredEvents).toEqual(currentEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(MOCK_EVENTS, TEST_DATE, 'month'));

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([LUNCH_0822, LUNCH_0828]);
});

//Q. 위에 테스트랑 중복되는 테스트 같음
it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(MOCK_EVENTS, TEST_DATE, 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  // LUNCH_0828는 설명에 회의 키워드가 있다.
  expect(result.current.filteredEvents).toEqual([METTING_0823, MEETING_0829, LUNCH_0828]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const SEP_DATE = new Date('2025-09-01');

  const { result } = renderHook(() => useSearch(MOCK_EVENTS, SEP_DATE, 'month')); //9월 일정 조회

  expect(result.current.filteredEvents).toEqual([MEETING_0926, LUNCH_0904]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(MOCK_EVENTS, TEST_DATE, 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([METTING_0823, MEETING_0829, LUNCH_0828]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([LUNCH_0822, LUNCH_0828]);
});
