import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const events = [
    {
      title: '기존 회의',
      date: '2025-10-15',
      description: '기존 팀 미팅',
      location: '회의실 B',
    },
    {
      title: '변경 회의',
      date: '2025-10-16',
      description: '변경 팀 미팅',
      location: '회의실 B2',
    },
  ] as Event[];
  const { result } = renderHook(() => useSearch(events, new Date('2025-10-15'), 'week'));
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events = [
    {
      title: '기존 회의',
      date: '2025-10-15',
      description: '기존 팀 미팅',
      location: '회의실 B',
    },
    {
      title: '변경 회의',
      date: '2025-10-16',
      description: '변경 팀 미팅',
      location: '회의실 B2',
    },
  ] as Event[];

  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('변경');
  });
  expect(result.current.filteredEvents).toEqual([events[1]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events = [
    {
      title: '팀 변경 회의',
      date: '2025-10-15',
      description: '팀 미팅 회의',
      location: '팀 회의실 B1',
    },
    {
      title: 'React 회의',
      date: '2025-10-16',
      description: '미팅 회의',
      location: '팀 회의실 B2',
    },
  ] as Event[];
  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('B1');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const events = [
    {
      title: '팀 변경 회의',
      date: '2025-09-01',
      description: '월간 미팅 회의',
      location: '팀 회의실 B1',
    },
    {
      title: '중간 회의',
      date: '2025-09-15',
      description: '팀 미팅 회의',
      location: '팀 회의실 B2',
    },
    {
      title: '월간 회의',
      date: '2025-10-01',
      description: '월간 미팅 회의',
      location: '팀 회의실 B3',
    },
  ] as Event[];
  const { result: result1 } = renderHook(() => useSearch(events, new Date('2025-10-03'), 'week'));
  expect(result1.current.filteredEvents).toEqual([events[2]]);

  const { result: result2 } = renderHook(() => useSearch(events, new Date('2025-09-29'), 'month'));
  expect(result2.current.filteredEvents).toEqual([events[0], events[1]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events = [
    {
      title: '회의',
      date: '2025-10-01',
      description: '회의',
      location: '팀 회의실 B1',
    },
    {
      title: '점심',
      date: '2025-10-01',
      description: '점심',
      location: '팀 회의실 B1',
    },
    {
      title: '기타',
      date: '2025-10-01',
      description: '기타',
      location: '팀 회의실 B1',
    },
  ] as Event[];

  const { result } = renderHook(() => useSearch(events, new Date('2025-10-01'), 'week'));
  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual(events);

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([events[1]]);
});
