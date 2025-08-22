import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '주간 회의',
    date: '2025-07-21',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-07-22',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 식사',
    location: '레스토랑 B',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '프로젝트 마감',
    date: '2025-08-01',
    startTime: '09:00',
    endTime: '18:00',
    description: '보고서 제출',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
];

describe('useSearch', () => {
  const currentDate = new Date('2025-07-21');

  it('검색어가 비어있을 때 현재 뷰(월간)의 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
    expect(result.current.filteredEvents.length).toBe(2);
  });

  it("검색어('회의')에 맞는 이벤트만 필터링해야 한다", () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents.length).toBe(1);
    expect(result.current.filteredEvents[0].title).toBe('주간 회의');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result: resultTitle } = renderHook(
      () => useSearch(mockEvents, currentDate, 'month'),
      {}
    );
    act(() => resultTitle.current.setSearchTerm('점심'));
    expect(resultTitle.current.filteredEvents[0].id).toBe('2');

    const { result: resultDesc } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
    act(() => resultDesc.current.setSearchTerm('미팅'));
    expect(resultDesc.current.filteredEvents[0].id).toBe('1');

    const { result: resultLoc } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
    act(() => resultLoc.current.setSearchTerm('레스토랑'));
    expect(resultLoc.current.filteredEvents[0].id).toBe('2');
  });

  it('현재 뷰(주간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));
    expect(result.current.filteredEvents.length).toBe(2);

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents.length).toBe(1);
    expect(result.current.filteredEvents[0].id).toBe('2');
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents.length).toBe(1);
    expect(result.current.filteredEvents[0].id).toBe('1');

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents.length).toBe(1);
    expect(result.current.filteredEvents[0].id).toBe('2');
  });
});
