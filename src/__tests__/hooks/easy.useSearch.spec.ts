import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';
import { createEvent } from '../utils.ts';

const events = [
  createEvent({
    id: '1',
    date: '2025-07-01',
    title: '팀 회식',
    description: '이번주 화요일 저녁 6시',
  }),
  createEvent({
    id: '2',
    date: '2025-07-02',
    title: '회의',
  }),
  createEvent({
    id: '3',
    date: '2025-07-13',
    title: '회의',
    location: '이층 회의실',
  }),
  createEvent({
    id: '4',
    date: '2025-07-24',
    title: '이벤트',
  }),
  createEvent({
    id: '5',
    date: '2025-07-31',
    title: '점심',
  }),
];

const currentDate = new Date('2025-07-02');

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));
  const searchTerm = '이벤트';

  act(() => {
    result.current.setSearchTerm(searchTerm);
  });

  expect(result.current.filteredEvents).toEqual([events[3]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));
  const searchTerm = '이';

  act(() => {
    result.current.setSearchTerm(searchTerm);
  });

  expect(result.current.filteredEvents).toEqual([events[0], events[2], events[3]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const searchTerm = '회의';

  // 주간
  const { result: weekResult } = renderHook(() =>
    useSearch(events, new Date('2025-07-02'), 'week')
  );

  act(() => {
    weekResult.current.setSearchTerm(searchTerm);
  });

  expect(weekResult.current.filteredEvents).toEqual([events[1]]);

  // 월간
  const { result: monthResult } = renderHook(() =>
    useSearch(events, new Date('2025-07-02'), 'month')
  );

  act(() => {
    monthResult.current.setSearchTerm(searchTerm);
  });

  expect(monthResult.current.filteredEvents).toEqual([events[1], events[2]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));
  const searchTerm = '회의';

  act(() => {
    result.current.setSearchTerm(searchTerm);
  });

  expect(result.current.filteredEvents).toEqual([events[1], events[2]]);

  // 검색어 수정
  const newSearchTerm = '점심';

  act(() => {
    result.current.setSearchTerm(newSearchTerm);
  });

  expect(result.current.filteredEvents).toEqual([events[4]]);
});
