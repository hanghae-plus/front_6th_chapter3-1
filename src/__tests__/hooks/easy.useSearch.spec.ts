import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { createMockEvent } from '../utils.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch([], new Date(), 'week'));

  expect(result.current.filteredEvents).toHaveLength(0);
  expect(result.current.filteredEvents).toEqual([]);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events = [
    createMockEvent(1, { title: '이벤트' }),
    createMockEvent(2, { title: '이벤트 2' }),
    createMockEvent(3, { title: '이벤트 3' }),
    createMockEvent(4, { title: '테스트 코드 힘들어' }),
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-08-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('');
  });

  expect(result.current.filteredEvents).toHaveLength(4);
  expect(result.current.searchTerm).toBe('');

  act(() => {
    result.current.setSearchTerm('테스트 코드 힘들어');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('테스트 코드 힘들어');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events = [
    createMockEvent(1, { title: '제목 1', description: '설명 1', location: '위치 1' }),
    createMockEvent(2, { title: '제목 2', description: '테스트 코드 힘들어', location: '위치 2' }),
    createMockEvent(3, { title: '제목 3', description: '설명 3', location: '위치 3' }),
    createMockEvent(4, { title: '테스트 코드 힘들어', description: '설명 4', location: '위치 4' }),
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-08-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('테스트 코드 힘들어');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents[0].description).toBe('테스트 코드 힘들어');
  expect(result.current.filteredEvents[1].title).toBe('테스트 코드 힘들어');
});

// 테스트가 생각해보니 모호해서 케이스를 나눠서 추가 해보았다.
it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const events = [
    createMockEvent(1, { date: '2025-07-01' }),
    createMockEvent(2, { date: '2025-07-02' }),
    createMockEvent(3, { date: '2025-07-15' }),
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'week'));

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents.map((e) => e.date)).toEqual(['2025-07-01', '2025-07-02']);
});

// 위의 케이스를 세분화 해서 주간 뷰에서 해당 주의 이벤트 반환 테스트 추가
it('주간 뷰에서는 해당 주의 이벤트만 반환해야 한다', () => {
  const events = [
    createMockEvent(1, { date: '2025-07-01' }),
    createMockEvent(2, { date: '2025-07-02' }),
    createMockEvent(3, { date: '2025-07-15' }),
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'week'));

  // 빈 검색어일 때 해당 주의 이벤트만 반환
  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents.map((e) => e.date)).toEqual(['2025-07-01', '2025-07-02']);
});

// 위의 케이스를 세분화 해서 월간 뷰에서 해당 월의 이벤트 반환 테스트 추가
it('월간 뷰에서는 해당 월의 이벤트만 반환해야 한다', () => {
  const events = [
    createMockEvent(1, { date: '2025-07-01' }),
    createMockEvent(2, { date: '2025-07-15' }),
    createMockEvent(3, { date: '2025-08-01' }),
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  // 빈 검색어일 때 해당 월의 이벤트만 반환
  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents.map((e) => e.date)).toEqual(['2025-07-01', '2025-07-15']);
});

// 위의 케이스를 세분화 해서 뷰 변경 테스트 추가
it('뷰를 변경하면 필터링된 결과가 달라져야 한다', () => {
  const events = [
    createMockEvent(1, { date: '2025-07-01' }),
    createMockEvent(2, { date: '2025-07-15' }),
    createMockEvent(3, { date: '2025-08-01' }),
  ];

  // 주간 뷰 테스트!
  const { result: weekResult } = renderHook(() =>
    useSearch(events, new Date('2025-07-01'), 'week')
  );
  expect(weekResult.current.filteredEvents).toHaveLength(1);

  // 월간 뷰 변경 후 테스트
  const { result: monthResult } = renderHook(() =>
    useSearch(events, new Date('2025-07-01'), 'month')
  );
  expect(monthResult.current.filteredEvents).toHaveLength(2);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events = [
    createMockEvent(1, { title: '회의' }),
    createMockEvent(2, { title: '점심' }),
    createMockEvent(3, { title: '회의' }),
  ];

  const { result } = renderHook(() => useSearch(events, new Date('2025-08-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents[0].title).toBe('회의');
  expect(result.current.filteredEvents[1].title).toBe('회의');

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심');
});
