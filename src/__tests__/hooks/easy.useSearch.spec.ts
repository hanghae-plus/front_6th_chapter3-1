import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { CalendarViewType, Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '면접공부',
    date: '2025-08-17',
    startTime: '10:00',
    endTime: '11:00',
    description: '면접 준비',
    location: '내 방',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '회의',
    date: '2025-08-17',
    startTime: '12:00',
    endTime: '13:00',
    description: '회의',
    location: '카페',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '코테풀기',
    date: '2025-08-24',
    startTime: '18:00',
    endTime: '19:00',
    description: '코테 풀기',
    location: '릿코드',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const mockDate = new Date('2025-08-21');

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, mockDate, CalendarViewType.MONTH));

  expect(result.current.filteredEvents).toEqual(mockEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, mockDate, CalendarViewType.MONTH));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, mockDate, CalendarViewType.MONTH));

  act(() => {
    result.current.setSearchTerm('코테');
  });

  expect(result.current.filteredEvents).toEqual([mockEvents[2]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, mockDate, CalendarViewType.MONTH));

  act(() => {
    result.current.setSearchTerm('코테');
  });

  expect(result.current.filteredEvents).toEqual([mockEvents[2]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(mockEvents, mockDate, CalendarViewType.MONTH));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([mockEvents[1]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([]);
});
