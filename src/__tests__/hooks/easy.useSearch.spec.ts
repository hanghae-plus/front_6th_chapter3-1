import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';

import { createMockEvent } from '../utils.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const events = [
    createMockEvent(1, { title: '아침', description: '아침 식사', location: '집' }),
    createMockEvent(2, { title: '회의', description: '아침 위클리', location: '회사' }),
    createMockEvent(3, { title: '점심', description: '점심 식사', location: '회사' }),
    createMockEvent(4, { title: '회의', description: '저녁 전체 위클리', location: '회의실' }),
    createMockEvent(5, { title: '저녁', description: '저녁 식사', location: '집' }),
  ];
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('');
  });

  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events = [
    createMockEvent(1, { title: '아침', description: '아침 식사', location: '집' }),
    createMockEvent(2, { title: '회의', description: '아침 위클리', location: '회사' }),
    createMockEvent(3, { title: '점심', description: '점심 식사', location: '회사' }),
    createMockEvent(4, { title: '회의', description: '저녁 전체 위클리', location: '회의실' }),
    createMockEvent(5, { title: '저녁', description: '저녁 식사', location: '집' }),
  ];

  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([events[1], events[3]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events = [
    createMockEvent(1, { title: '아침', description: '식사', location: '집' }),
    createMockEvent(2, { title: '회의', description: '아침 위클리', location: '회사' }),
    createMockEvent(3, { title: '점심', description: '식사', location: '회사' }),
    createMockEvent(4, { title: '회의', description: '저녁 전체 위클리', location: '회의실' }),
    createMockEvent(5, { title: '저녁', description: '식사', location: '집' }),
  ];
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('저녁');
  });

  expect(result.current.filteredEvents).toEqual([events[3], events[4]]);

  act(() => {
    result.current.setSearchTerm('집');
  });

  expect(result.current.filteredEvents).toEqual([events[0], events[4]]);
});

it('현재 뷰가 주간일 때 주간 이벤트만 반환해야 한다', () => {
  const events = [
    createMockEvent(1, { date: '2025-08-01' }),
    createMockEvent(2, { date: '2025-08-02' }),
    createMockEvent(3, { date: '2025-08-25' }),
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-08-01'), 'week'));

  expect(result.current.filteredEvents).toEqual([events[0], events[1]]);
});

it('현재 뷰가 월간일 때 월간 이벤트만 반환해야 한다', () => {
  const events = [
    createMockEvent(1, { date: '2025-08-01' }),
    createMockEvent(2, { date: '2025-08-02' }),
    createMockEvent(3, { date: '2025-09-25' }),
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-08-01'), 'month'));

  expect(result.current.filteredEvents).toEqual([events[0], events[1]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events = [
    createMockEvent(1, { title: '아침', location: '집' }),
    createMockEvent(2, { title: '회의', location: '회사' }),
    createMockEvent(3, { title: '점심', location: '회사' }),
  ];
  const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([events[1]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([events[2]]);
});
