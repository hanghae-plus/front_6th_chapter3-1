import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-10-03',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 업무 점검',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-10-04',
    startTime: '12:00',
    endTime: '13:00',
    description: '동료와 점심',
    location: '식당',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 5,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const currentDate = new Date('2025-10-03');
  const view: 'week' | 'month' = 'week';
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  expect(result.current.filteredEvents).toEqual(expect.arrayContaining(events));
  expect(result.current.filteredEvents.length).toBe(events.length);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const currentDate = new Date('2025-10-03');
  const view: 'week' | 'month' = 'week';
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);
  expect(result.current.filteredEvents.length).toBe(1);

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([events[1]]);
  expect(result.current.filteredEvents.length).toBe(1);

  act(() => {
    result.current.setSearchTerm('없음');
  });
  expect(result.current.filteredEvents).toEqual([]);
  expect(result.current.filteredEvents.length).toBe(0);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const currentDate = new Date('2025-10-03');
  const view: 'week' | 'month' = 'week';
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);

  act(() => {
    result.current.setSearchTerm('동료');
  });
  expect(result.current.filteredEvents).toEqual([events[1]]);

  act(() => {
    result.current.setSearchTerm('식당');
  });
  expect(result.current.filteredEvents).toEqual([events[1]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const weekDate = new Date('2025-10-03');
  const monthDate = new Date('2025-10-01');
  const weekView: 'week' | 'month' = 'week';
  const monthView: 'week' | 'month' = 'month';

  let { result, rerender } = renderHook(
    ({ events, currentDate, view }) => useSearch(events, currentDate, view),
    { initialProps: { events, currentDate: weekDate, view: weekView } }
  );
  expect(result.current.filteredEvents).toEqual(expect.arrayContaining(events));

  rerender({ events, currentDate: monthDate, view: monthView });
  expect(result.current.filteredEvents).toEqual(expect.arrayContaining(events));

  rerender({ events, currentDate: new Date('2025-10-10'), view: weekView });
  expect(result.current.filteredEvents).toEqual([]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const currentDate = new Date('2025-10-03');
  const view: 'week' | 'month' = 'week';
  const { result } = renderHook(() => useSearch(events, currentDate, view));

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([events[1]]);
});
