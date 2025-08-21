import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';
import { mockNotificationEvents } from '../test-data.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch([], new Date(), 'month'));
  expect(result.current.filteredEvents).toEqual([]);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() =>
    useSearch(mockNotificationEvents as Event[], new Date('2025-08-10'), 'month')
  );

  act(() => {
    result.current.setSearchTerm('테스트');
  });

  expect(result.current.filteredEvents).toEqual([
    mockNotificationEvents[0],
    mockNotificationEvents[1],
  ]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() =>
    useSearch(mockNotificationEvents as Event[], new Date('2025-09-10'), 'month')
  );

  act(() => {
    result.current.setSearchTerm('테스트 3');
  });

  expect(result.current.filteredEvents).toEqual([mockNotificationEvents[2]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() =>
    useSearch(mockNotificationEvents as Event[], new Date('2025-08-19'), 'week')
  );

  act(() => {
    result.current.setSearchTerm('테스트');
  });

  expect(result.current.filteredEvents).toEqual([
    mockNotificationEvents[0],
    mockNotificationEvents[1],
  ]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() =>
    useSearch(mockNotificationEvents as Event[], new Date('2025-10-01'), 'month')
  );

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([mockNotificationEvents[3]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([mockNotificationEvents[4]]);
});
