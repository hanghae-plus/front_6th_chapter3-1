import { act, renderHook } from '@testing-library/react';

import data from '../../__mocks__/response/realEvents.json';
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

it('검색어가 비어있을 때 모든 해당 월에 대한 이벤트를 반환해야 한다', () => {
  const events = data.events as Array<Event>;
  const currentDate = new Date('2025-08-01');
  const view = 'month';

  // Act: 훅 렌더링
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  act(() => {
    result.current.setSearchTerm('');
  });

  // Assert: result.current로 훅의 반환값 확인
  expect(result.current.filteredEvents).toHaveLength(5);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events = data.events as Array<Event>;
  const currentDate = new Date('2025-08-01');
  const view = 'month';

  // Act: 훅 렌더링
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  act(() => {
    result.current.setSearchTerm('생일');
  });

  // Assert: result.current로 훅의 반환값 확인
  expect(result.current.filteredEvents).toHaveLength(1);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events = data.events as Array<Event>;
  const currentDate = new Date('2025-08-01');
  const view = 'month';

  // Act: 훅 렌더링
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  act(() => {
    result.current.setSearchTerm('주간');
  });

  // Assert: result.current로 훅의 반환값 확인
  expect(result.current.filteredEvents).toHaveLength(2);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const events = data.events as Array<Event>;
  const currentDate = new Date('2025-08-17');
  const view = 'week';

  // Act: 훅 렌더링
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  // Assert: result.current로 훅의 반환값 확인
  expect(result.current.filteredEvents).toHaveLength(3);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events = data.events as Array<Event>;
  const currentDate = new Date('2025-08-17');
  const view = 'week';

  // Act: 훅 렌더링
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  // Assert: result.current로 훅의 반환값 확인
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의');

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 약속');
});
