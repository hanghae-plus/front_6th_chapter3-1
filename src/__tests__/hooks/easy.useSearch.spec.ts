import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

describe('useSearch', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      date: '2025-10-01',
      title: '회의',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      startTime: '10:00',
      endTime: '11:00',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
    {
      id: '2',
      date: '2025-10-02',
      title: '점심 미팅',
      description: '외부 고객사 미팅',
      location: '레스토랑',
      category: '업무',
      startTime: '12:00',
      endTime: '13:00',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
    {
      id: '3',
      date: '2025-10-02',
      title: '긴급 회의',
      description: '오류 대응 긴급 회의',
      location: '회의실 B',
      category: '업무',
      startTime: '09:00',
      endTime: '11:00',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
  ];

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-10-01'), 'week'));
    act(() => {
      result.current.setSearchTerm('');
    });
    expect(result.current.filteredEvents).toHaveLength(3);
    expect(result.current.filteredEvents).toEqual(mockEvents);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-10-01'), 'week'));
    act(() => {
      result.current.setSearchTerm('레스토랑');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-10-01'), 'week'));
    act(() => {
      result.current.setSearchTerm('미팅');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-10-01'), 'week'));
    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents).toEqual([mockEvents[0], mockEvents[2]]);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-10-01'), 'week'));
    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents).toEqual([mockEvents[0], mockEvents[2]]);

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
  });
});
