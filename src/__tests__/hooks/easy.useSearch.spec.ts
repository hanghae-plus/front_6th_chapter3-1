import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const testEvents: Event[] = [
  {
    id: '1',
    title: '7월 팀 회의',
    date: '2025-07-01',
    description: '주간 목표 논의',
    location: '사무실',
    startTime: '10:00',
    endTime: '11:00',
    notificationTime: 10,
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-07-15',
    description: '클라이언트와 점심 식사',
    location: '레스토랑',
    startTime: '12:00',
    endTime: '13:00',
    notificationTime: 30,
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: '3',
    title: '8월 전체 회의',
    date: '2025-08-05',
    description: '분기 실적 발표',
    location: '대회의실',
    startTime: '14:00',
    endTime: '15:00',
    notificationTime: 60,
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
];

describe('useSearch', () => {
  const date = new Date('2025-07-10');

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(testEvents, date, 'month'));
    expect(result.current.filteredEvents).toHaveLength(2);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(testEvents, date, 'month'));
    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('2');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(testEvents, date, 'month'));
    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents[0].id).toBe('2');
    act(() => {
      result.current.setSearchTerm('클라이언트');
    });
    expect(result.current.filteredEvents[0].id).toBe('2');
    act(() => {
      result.current.setSearchTerm('레스토랑');
    });
    expect(result.current.filteredEvents[0].id).toBe('2');
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const date = new Date('2025-07-01');
    const { result } = renderHook(() => useSearch(testEvents, date, 'week'));
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('1');
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(testEvents, date, 'month'));
    expect(result.current.filteredEvents).toHaveLength(2);

    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toContain('회의');

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toContain('점심');
  });
});
