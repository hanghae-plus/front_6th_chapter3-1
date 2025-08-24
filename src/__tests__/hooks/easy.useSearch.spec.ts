import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const event1: Event = {
  id: '1',
  title: '이벤트1',
  description: '검색대상',
  category: '카테고리1',
  date: '2025-08-19',
  startTime: '09:30',
  endTime: '14:30',
  location: '어딘가',
  notificationTime: 30,
  repeat: { interval: 0, type: 'daily', endDate: '' },
};

const event2: Event = {
  id: '2',
  title: '이벤트2',
  description: '점심',
  category: '카테고리1',
  date: '2025-08-19',
  startTime: '09:00',
  endTime: '14:30',
  location: '어딘가',
  notificationTime: 30,
  repeat: { interval: 0, type: 'daily', endDate: '' },
};

const event3: Event = {
  id: '3',
  title: '이벤트3',
  description: '회의',
  category: '카테고리1',
  date: '2025-08-19',
  startTime: '09:00',
  endTime: '14:30',
  location: '어딘가',
  notificationTime: 30,
  repeat: { interval: 0, type: 'daily', endDate: '' },
};

const event4: Event = {
  id: '4',
  title: '이벤트4',
  description: '설명',
  category: '카테고리1',
  date: '2025-09-19',
  startTime: '09:00',
  endTime: '14:30',
  location: '어딘가',
  notificationTime: 30,
  repeat: { interval: 0, type: 'daily', endDate: '' },
};

const events = [event1, event2, event3, event4];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-08-19'), 'month'));

  expect(result.current.filteredEvents).toEqual([event1, event2, event3]);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-08-19'), 'month'));

  act(() => {
    result.current.setSearchTerm('검색대상');
  });

  expect(result.current.filteredEvents).toEqual([event1]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-08-19'), 'month'));

  act(() => {
    result.current.setSearchTerm('검색대상');
  });

  expect(result.current.filteredEvents).toEqual([event1]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-08-19'), 'week'));

  expect(result.current.filteredEvents).toEqual([event1, event2, event3]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-08-19'), 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([event3]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([event2]);
});
