import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { createEvent } from '../utils.ts';

// 고정설정?
const events = [
  createEvent({
    id: '1',
    date: '2025-07-01',
    title: '생일파티',
    description: '생일 파티 이벤트',
  }),
  createEvent({
    id: '2',
    date: '2025-07-02',
    title: '이벤트',
  }),
  createEvent({
    id: '3',
    date: '2025-07-13',
    title: '전시 EVENT',
    location: '코엑스 이벤트장',
  }),
  createEvent({
    id: '4',
    date: '2025-07-24',
    title: '회의',
  }),
  createEvent({
    id: '5',
    date: '2025-07-31',
    title: '점심',
  }),
];

let date: Date;

beforeEach(() => {
  date = new Date('2025-07-01');
});

describe('useSearch', () => {
  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, date, 'month'));

    expect(result.current.filteredEvents).toEqual(events);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, date, 'month'));

    act(() => result.current.setSearchTerm('EVENT'));

    expect(result.current.filteredEvents).toEqual([events[2]]);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, date, 'month'));

    act(() => result.current.setSearchTerm('이벤트'));

    expect(result.current.filteredEvents).toEqual([events[0], events[1], events[2]]);
  });

  // AS IS : 현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다
  // -> 선택하기에 따라 결과가 다르니 분리하자
  // TO BE
  describe('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다.', () => {
    it('현재 뷰(주간)에 해당하는 이벤트만 반환', () => {
      const { result } = renderHook(() => useSearch(events, date, 'week'));

      act(() => result.current.setSearchTerm('이벤트'));

      expect(result.current.filteredEvents).toEqual([events[0], events[1]]);
    });
    it('현재 뷰(월간)에 해당하는 이벤트만 반환', () => {
      const { result } = renderHook(() => useSearch(events, date, 'month'));

      act(() => result.current.setSearchTerm('이벤트'));

      expect(result.current.filteredEvents).toEqual([events[0], events[1], events[2]]);
    });
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(events, date, 'month'));

    act(() => result.current.setSearchTerm('회의'));
    expect(result.current.filteredEvents).toEqual([events[3]]);

    act(() => result.current.setSearchTerm('점심'));
    expect(result.current.filteredEvents).toEqual([events[4]]);
  });
});
