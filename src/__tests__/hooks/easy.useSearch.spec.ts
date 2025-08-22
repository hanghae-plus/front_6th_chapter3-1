import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { createEventMock } from '../utils.ts';

const sampleEvents = [
  createEventMock({
    id: '1',
    date: '2025-08-01',
    title: 'event Test 1번 회의',
    description: '1번의 description',
    location: '1번의 location',
  }),
  createEventMock({
    id: '2',
    date: '2025-08-21',
    title: 'event Test 2번 점심',
    description: '2번의 description',
    location: '2번의 location',
  }),
  createEventMock({
    id: '3',
    date: '2025-08-22',
    title: 'event Test 3번 회의',
    description: '3번의 description',
    location: '3번의 location',
  }),
  createEventMock({
    id: '4',
    date: '2025-08-30',
    title: 'event Test 4번 여행',
    description: '4번의 description',
    location: '4번의 location',
  }),
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const currentDate = new Date('2025-08-01');
  const { result } = renderHook(() => useSearch(sampleEvents, currentDate, 'month'));

  expect(result.current.filteredEvents).toEqual(sampleEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const currentDate = new Date('2025-08-01');
  const searchTerm = '회의';
  const { result } = renderHook(() => useSearch(sampleEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm(searchTerm);
  });

  expect(result.current.filteredEvents).toEqual([sampleEvents[0], sampleEvents[2]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const currentDate = new Date('2025-08-01');
  const searchTerm = 'description';
  const { result } = renderHook(() => useSearch(sampleEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm(searchTerm);
  });

  expect(result.current.filteredEvents).toEqual(sampleEvents);
});

it('현재 뷰(주간)에 해당하는 이벤트만 반환해야 한다', () => {
  const currentDate = new Date('2025-08-20');
  const { result } = renderHook(() => useSearch(sampleEvents, currentDate, 'week'));

  expect(result.current.filteredEvents).toEqual(sampleEvents.slice(1, 3));
});

it('현재 뷰(월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const currentDate = new Date('2025-08-20');
  const { result } = renderHook(() => useSearch(sampleEvents, currentDate, 'month'));

  expect(result.current.filteredEvents).toEqual(sampleEvents);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const currentDate = new Date('2025-08-01');
  const searchTerm = '회의';
  const { result } = renderHook(() => useSearch(sampleEvents, currentDate, 'month'));

  // 검색어를 '회의'로 set
  act(() => {
    result.current.setSearchTerm(searchTerm);
  });

  // '회의'로 필터링된 이벤트 결과
  expect(result.current.filteredEvents).toEqual([sampleEvents[0], sampleEvents[2]]);

  // 검색어를 '점심'로 변경
  act(() => {
    result.current.setSearchTerm('점심');
  });

  // '회의'로 필터링된 이벤트 결과
  expect(result.current.filteredEvents).toEqual([sampleEvents[1]]);
});
