import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';
import { dummyEvent } from '../data/dummy';

describe('useSearch', () => {
  let events: Event[];

  let event1: Event;
  let event2: Event;
  let event3: Event;
  let event4: Event;
  let event5: Event;

  beforeEach(() => {
    event1 = {
      ...dummyEvent,
      id: '1',
      title: 'EVENT 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
    };
    event2 = {
      ...dummyEvent,
      id: '2',
      title: 'event 2',
      date: '2025-07-02',
      startTime: '14:00',
      endTime: '15:00',
    };
    event3 = {
      ...dummyEvent,
      id: '3',
      title: '미팅',
      date: '2025-07-15',
      startTime: '09:00',
      endTime: '10:00',
    };
    event4 = {
      ...dummyEvent,
      id: '4',
      title: '점심 약속',
      date: '2025-07-31',
      startTime: '12:00',
      endTime: '13:00',
    };
    event5 = {
      ...dummyEvent,
      id: '5',
      title: '회의',
      date: '2025-07-15',
      startTime: '09:00',
      endTime: '10:00',
    };
    events = [event1, event2, event3, event4, event5];
  });

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(2025, 6, 15), 'month'));

    act(() => {
      result.current.setSearchTerm('');
    });

    expect(result.current.filteredEvents).toEqual(events);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(2025, 6, 15), 'month'));

    act(() => {
      result.current.setSearchTerm('event 2');
    });

    expect(result.current.filteredEvents).toEqual([event2]);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(2025, 6, 15), 'month'));

    act(() => {
      result.current.setSearchTerm('미팅');
    });

    expect(result.current.filteredEvents).toEqual([event3]);
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(2025, 6, 15), 'month'));

    act(() => {
      result.current.setSearchTerm('event 2');
    });

    expect(result.current.filteredEvents).toEqual([event2]);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(events, new Date(2025, 6, 15), 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toEqual([event5]);

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toEqual([event4]);
  });
});
