import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { createTestEvents } from '../utils';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const events = createTestEvents([
    { id: '1', title: '이벤트 1', date: '2025-07-01' },
    { id: '2', title: '이벤트 2', date: '2025-07-02' },
    { id: '3', title: '이벤트 3', date: '2025-07-03' },
  ]);

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  expect(result.current.filteredEvents).toHaveLength(3);
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2', '3']);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events = createTestEvents([
    { id: '1', title: '회의', date: '2025-07-01' },
    { id: '2', title: '점심', date: '2025-07-02' },
    { id: '3', title: '회의 빠지고 점심', date: '2025-07-03' },
  ]);

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '3']);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events = createTestEvents([
    { id: '1', title: '회의', description: '', location: '' },
    { id: '2', title: '점심', description: '회의 후 점심', location: '' },
    { id: '3', title: '미팅', description: '', location: '회의실' },
    { id: '4', title: '기타', description: '일반 업무', location: '사무실' },
  ]);

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(3);
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2', '3']);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const events = createTestEvents([
    { id: '1', title: '이번 주 이벤트', date: '2025-07-01' },
    { id: '2', title: '다음 주 이벤트', date: '2025-07-08' },
    { id: '3', title: '다음 달 이벤트', date: '2025-08-01' },
  ]);

  const { result: weekResult } = renderHook(() =>
    useSearch(events, new Date('2025-07-01'), 'week')
  );
  const { result: monthResult } = renderHook(() =>
    useSearch(events, new Date('2025-07-01'), 'month')
  );

  // 주간 뷰
  expect(weekResult.current.filteredEvents).toHaveLength(1);
  expect(weekResult.current.filteredEvents.map((e) => e.id)).toEqual(['1']);

  // 월간 뷰
  expect(monthResult.current.filteredEvents).toHaveLength(2);
  expect(monthResult.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2']);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events = createTestEvents([
    { id: '1', title: '회의', date: '2025-07-01' },
    { id: '2', title: '점심', date: '2025-07-02' },
    { id: '3', title: '회의 하면서 점심', date: '2025-07-03' },
  ]);

  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  expect(result.current.filteredEvents).toHaveLength(3);

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '3']);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['2', '3']);
});
