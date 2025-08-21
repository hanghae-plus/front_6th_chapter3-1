import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { createEvents } from '../eventFactory.ts';

it('검색어가 비어있을 때 view에 해당하는 모든 이벤트를 반환해야 한다', () => {
  const events = createEvents([
    { id: '1', date: '2025-07-01' },
    { id: '2', date: '2025-07-01' },
  ]);

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  const expected = [events[0], events[1]];

  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents.length).toBe(2);
  expect(result.current.filteredEvents).toEqual(expected);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events = createEvents([
    { date: '2025-07-01', title: '회의1' },
    { date: '2025-07-01', title: '회의2' },
    { date: '2025-07-01', title: '점심' },
  ]);

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  const expected = [events[0], events[1]];

  expect(result.current.searchTerm).toBe('회의');
  expect(result.current.filteredEvents.length).toBe(2);
  expect(result.current.filteredEvents).toEqual(expected);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events = createEvents([
    { date: '2025-07-01', title: '회의A' },
    { date: '2025-07-01', title: '회의B' },
    { date: '2025-07-01', location: '회의실A' },
    { date: '2025-07-01', description: 'ABC' },
  ]);

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('A');
  });

  const expected = [events[0], events[2], events[3]];

  expect(result.current.searchTerm).toBe('A');
  expect(result.current.filteredEvents.length).toBe(3);
  expect(result.current.filteredEvents).toEqual(expected);
});

it('주간 뷰에 해당하는 이벤트만 반환해야 한다', () => {
  const events = createEvents([
    { date: '2025-07-01' },
    { date: '2025-07-08' }, // 다른 주
  ]);
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'week'));

  const expected = [events[0]];

  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents.length).toBe(1);
  expect(result.current.filteredEvents).toEqual(expected);
});

it('주간 뷰에 해당하는 이벤트만 반환해야 한다', () => {
  const events = createEvents([
    { date: '2025-07-01' },
    { date: '2025-07-08' },
    { date: '2025-08-01' },
  ]);

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  const expected = [events[0], events[1]];

  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents.length).toBe(2);
  expect(result.current.filteredEvents).toEqual(expected);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events = createEvents([
    { date: '2025-07-01', title: '회의' },
    { date: '2025-07-01', title: '점심' },
    { date: '2025-07-01', location: '회의실' },
  ]);

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  const expected1 = [events[0], events[2]];

  expect(result.current.searchTerm).toBe('회의');
  expect(result.current.filteredEvents.length).toBe(2);
  expect(result.current.filteredEvents).toEqual(expected1);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  const expected2 = [events[1]];

  expect(result.current.searchTerm).toBe('점심');
  expect(result.current.filteredEvents.length).toBe(1);
  expect(result.current.filteredEvents).toEqual(expected2);
});
