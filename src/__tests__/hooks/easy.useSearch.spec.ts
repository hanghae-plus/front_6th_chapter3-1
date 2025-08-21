import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-04-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '주간 업무 계획 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-04-15',
    startTime: '12:00',
    endTime: '13:00',
    description: '팀원들과 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '고객 미팅',
    date: '2025-04-16',
    startTime: '14:00',
    endTime: '15:00',
    description: '신규 프로젝트 제안',
    location: '온라인',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 30,
  },
  {
    id: '4',
    title: '프로젝트 회의',
    date: '2025-06-29',
    startTime: '14:00',
    endTime: '15:00',
    description: '프로젝트 회의',
    location: '온라인',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 30,
  },
  {
    id: '5',
    title: '오후 회의',
    date: '2025-07-05',
    startTime: '14:00',
    endTime: '15:00',
    description: '오후 회의',
    location: '온라인',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 30,
  },
];

const currentDate = new Date('2025-04-15');

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

  expect(result.current.filteredEvents).toHaveLength(3); // 4월 15일 주간 뷰에서는 3개 이벤트 (13일~19일 범위)
  expect(result.current.searchTerm).toBe('');
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 약속');

  act(() => {
    result.current.setSearchTerm('업무 계획');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의');

  act(() => {
    result.current.setSearchTerm('회의실');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: weekResult } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));
  expect(weekResult.current.filteredEvents).toHaveLength(3); // 4월 15일 주간에는 3개 (13일~19일 범위)

  const { result: monthResult } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
  expect(monthResult.current.filteredEvents).toHaveLength(3); // 4월 전체에는 3개
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의');

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 약속');
});

// 주간 뷰에서 월 경계를 넘어가는 경계값 테스트 추가
it('주간 뷰에서 월 경계를 넘어가는 이벤트를 올바르게 포함해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-07-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents.map((e) => e.id)).toContain('4');
  expect(result.current.filteredEvents.map((e) => e.id)).toContain('5');
});
