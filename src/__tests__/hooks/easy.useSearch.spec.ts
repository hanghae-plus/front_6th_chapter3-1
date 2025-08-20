import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/realEvents.json';
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const mockEvents = events as Event[];
  const currentDate = new Date(2025, 7, 20); // 2025-08-20
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents).toHaveLength(5);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const mockEvents = events as Event[];
  const currentDate = new Date(2025, 7, 20); // 2025-08-20
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.searchTerm).toBe('회의');
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const mockEvents = events as Event[];
  const currentDate = new Date(2025, 7, 20); // 2025-08-20
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  // 제목 검색
  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 약속');

  // 설명 검색
  act(() => {
    result.current.setSearchTerm('미팅');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의');

  // 위치 검색
  act(() => {
    result.current.setSearchTerm('헬스장');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('운동');
});

it('주간 뷰에서는 해당 주의 이벤트만 반환해야 한다', () => {
  const mockEvents = events as Event[];
  const currentDate = new Date(2025, 7, 20); // 2025-08-20 (수요일)
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

  // 8월 20일이 포함된 주의 이벤트 (8/20, 8/21, 8/22)
  expect(result.current.filteredEvents).toHaveLength(3);
  const eventDates = result.current.filteredEvents.map((e) => e.date).sort();
  expect(eventDates).toEqual(['2025-08-20', '2025-08-21', '2025-08-22']);
});

it('월간 뷰에서는 해당 달의 이벤트만 반환해야 한다', () => {
  const mockEvents = events as Event[];
  const currentDate = new Date(2025, 7, 15); // 2025-08-15
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  expect(result.current.filteredEvents).toHaveLength(5);
  result.current.filteredEvents.forEach((event) => {
    expect(event.date.startsWith('2025-08')).toBe(true);
  });
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const mockEvents = events as Event[];
  const currentDate = new Date(2025, 7, 20); // 2025-08-20
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  expect(result.current.filteredEvents).toHaveLength(5);

  // '회의' 검색
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의');

  // '점심'으로 변경
  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 약속');

  // 빈 문자열로 변경
  act(() => {
    result.current.setSearchTerm('');
  });
  expect(result.current.filteredEvents).toHaveLength(5);
});
