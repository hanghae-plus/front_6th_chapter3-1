import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

describe('useSearch', () => {
  const createEvent = (
    id: string,
    title: string,
    date: string,
    description = '',
    location = ''
  ): Event => ({
    id,
    title,
    date,
    description,
    location,
    startTime: '10:00',
    endTime: '11:00',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  });

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const events = [
      createEvent('1', '항해 팀 회의', '2025-07-01'),
      createEvent('2', '항해 점심 약속', '2025-07-02'),
    ];

    const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

    expect(result.current.searchTerm).toBe('');

    expect(result.current.filteredEvents).toHaveLength(2);

    const titles = result.current.filteredEvents.map((event) => event.title);
    expect(titles).toContain('항해 팀 회의');
    expect(titles).toContain('항해 점심 약속');
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const events = [
      createEvent('1', '항해 팀 회의', '2025-07-01'),
      createEvent('2', '항해 점심 약속', '2025-07-01'),
      createEvent('3', '항해 개인 시간', '2025-07-01'),
    ];

    const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.searchTerm).toBe('회의');

    // '회의'가 포함된 이벤트만 반환
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('항해 팀 회의');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const events = [
      createEvent('1', '항해 회의', '2025-07-01', '프로젝트 논의', '회의실A'),
      createEvent('2', '항해 식사', '2025-07-01', '팀 회의 후 식사', '레스토랑'),
      createEvent('3', '항해 운동', '2025-07-01', '헬스장', '회의실 근처'),
    ];

    const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toHaveLength(3);

    const titles = result.current.filteredEvents.map((event) => event.title);
    expect(titles).toContain('항해 회의');
    expect(titles).toContain('항해 식사');
    expect(titles).toContain('항해 운동');
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const events = [
      createEvent('1', '항해 이번 주', '2025-07-01'),
      createEvent('2', '항해 다음 주', '2025-07-08'),
      createEvent('3', '항해 같은 월', '2025-07-15'),
    ];

    const { result: weekResult } = renderHook(() =>
      useSearch(events, new Date('2025-07-01'), 'week')
    );

    expect(weekResult.current.filteredEvents.length).toBeGreaterThan(0);
    expect(weekResult.current.filteredEvents.length).toBeLessThan(3);

    const weekTitles = weekResult.current.filteredEvents.map((event) => event.title);
    expect(weekTitles).toContain('항해 이번 주');

    const { result: monthResult } = renderHook(() =>
      useSearch(events, new Date('2025-07-01'), 'month')
    );

    expect(monthResult.current.filteredEvents).toHaveLength(3);

    const monthTitles = monthResult.current.filteredEvents.map((event) => event.title);
    expect(monthTitles).toContain('항해 이번 주');
    expect(monthTitles).toContain('항해 다음 주');
    expect(monthTitles).toContain('항해 같은 월');
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const events = [
      createEvent('1', '항해 팀 회의', '2025-07-01'),
      createEvent('2', '항해 점심 약속', '2025-07-01'),
      createEvent('3', '항해 회의실 예약', '2025-07-01'),
    ];

    const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.searchTerm).toBe('회의');
    expect(result.current.filteredEvents).toHaveLength(2);

    let titles = result.current.filteredEvents.map((event) => event.title);
    expect(titles).toContain('항해 팀 회의');
    expect(titles).toContain('항해 회의실 예약');

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.searchTerm).toBe('점심');
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('항해 점심 약속');
  });
});
