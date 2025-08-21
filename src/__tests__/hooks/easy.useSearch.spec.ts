import { act, renderHook } from '@testing-library/react';
import { useSearch } from '../../hooks/useSearch.ts';
import { createTestEvent } from '../utils.ts';

describe('useSearch', () => {
  const testEvents = [
    createTestEvent({
      title: '점심 약속',
      date: '2025-10-15',
      description: '기존 팀 미팅',
      location: '회사 근처 식당',
    }),
    createTestEvent({
      title: '팀 회의',
      date: '2025-10-16',
      description: '주간 팀 미팅',
      location: '회의실 A',
    }),
    createTestEvent({
      title: '프로젝트 미팅',
      date: '2025-10-17',
      description: '분기별 프로젝트 마감',
      location: '회사 근처 식당',
    }),
  ];

  // 이벤트가 없고 검색어가 비어있을 때 빈 배열을 반환해야 한다
  it('이벤트가 없을 때 빈 배열을 반환한다.', () => {
    const { result } = renderHook(() => useSearch([], new Date(), 'week'));

    expect(result.current.filteredEvents).toEqual([]);
  });

  it('검색어가 비어있을 때 모든 이벤트를 반환한다.', () => {
    const { result } = renderHook(() => useSearch(testEvents, new Date('2025-10-15'), 'week'));

    expect(result.current.filteredEvents).toEqual(testEvents);
  });

  // 검색어에 맞는 이벤트만 필터링해야 한다
  it("검색어에 '점심'을 입력하면 제목에 '점심'이 포함된 이벤트만 반환해야 한다", () => {
    const { result } = renderHook(() => useSearch(testEvents, new Date('2025-10-15'), 'week'));

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toEqual([
      createTestEvent({
        title: '점심 약속',
        date: '2025-10-15',
        description: '기존 팀 미팅',
        location: '회사 근처 식당',
      }),
    ]);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(testEvents, new Date('2025-10-15'), 'week'));

    act(() => {
      result.current.setSearchTerm('점심');
    });

    const filteredEvents = result.current.filteredEvents;
    filteredEvents.forEach((event) => {
      const hasMatch =
        event.title.toLowerCase().includes('점심') ||
        event.description.toLowerCase().includes('점심') ||
        event.location.toLowerCase().includes('점심');

      expect(hasMatch).toBe(true);
    });
  });

  // 현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다
  it('현재 주간에 해당하는 이벤트만 반환한다.', () => {
    const { result } = renderHook(() => useSearch(testEvents, new Date('2025-10-15'), 'week'));

    expect(result.current.filteredEvents).toEqual(testEvents);
  });

  it('현재 월간에 해당하는 이벤트만 반환한다.', () => {
    const { result } = renderHook(() => useSearch(testEvents, new Date('2025-10-15'), 'month'));

    expect(result.current.filteredEvents).toEqual(testEvents);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(testEvents, new Date('2025-10-15'), 'week'));

    expect(result.current.searchTerm).toBe('');
    expect(result.current.filteredEvents).toEqual(testEvents);

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.searchTerm).toBe('회의');
    expect(result.current.filteredEvents).toEqual([
      createTestEvent({
        title: '팀 회의',
        date: '2025-10-16',
        description: '주간 팀 미팅',
        location: '회의실 A',
      }),
    ]);

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.searchTerm).toBe('점심');
    expect(result.current.filteredEvents).toEqual([
      createTestEvent({
        title: '점심 약속',
        date: '2025-10-15',
        description: '기존 팀 미팅',
        location: '회사 근처 식당',
      }),
    ]);

    expect(result.current.filteredEvents[0].title).toContain('점심');
  });
});
