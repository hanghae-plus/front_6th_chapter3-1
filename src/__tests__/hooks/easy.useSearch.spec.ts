import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/fixture/mockEvents.json';
import { useSearch } from '../../hooks/useSearch.ts';
import { CalendarViewType, Event } from '../../types.ts';

const mockDate = new Date('2025-08-21');
const mockEvents = events as Event[];

test('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, mockDate, CalendarViewType.MONTH));

  expect(result.current.filteredEvents).toEqual(mockEvents);
});

test('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, mockDate, CalendarViewType.MONTH));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
});

test('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, mockDate, CalendarViewType.MONTH));

  act(() => {
    result.current.setSearchTerm('코테');
  });

  expect(result.current.filteredEvents).toEqual([mockEvents[2]]);
});

test('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, mockDate, CalendarViewType.MONTH));

  act(() => {
    result.current.setSearchTerm('코테');
  });

  expect(result.current.filteredEvents).toEqual([mockEvents[2]]);
});

test("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(mockEvents, mockDate, CalendarViewType.MONTH));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([mockEvents[1]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([]);
});
