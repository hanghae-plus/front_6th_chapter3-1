import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-08-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '주간 팀 회의입니다',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-08-21',
    startTime: '12:00',
    endTime: '13:00',
    description: '동료와 점심식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '3',
    title: '프로젝트 마감',
    date: '2025-08-25',
    startTime: '14:00',
    endTime: '15:00',
    description: '분기별 프로젝트 마감',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '4',
    title: '생일 파티',
    date: '2025-08-28',
    startTime: '19:00',
    endTime: '20:00',
    description: '친구 생일 축하',
    location: '친구 집',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '5',
    title: '운동',
    date: '2025-08-22',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date(), 'month'));

  expect(result.current.filteredEvents).toEqual(mockEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('팀 회의');
  });

  expect(result.current.filteredEvents).toEqual([mockEvents[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('주간 운동');
  });

  expect(result.current.filteredEvents).toEqual([mockEvents[4]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const currentDate = new Date();

  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1', '2', '5']);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date(), 'month'));

  // 1. '회의' 검색
  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.searchTerm).toBe('회의');
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['1']);

  // 2. '점심' 검색으로 변경
  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.searchTerm).toBe('점심');
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['2']);
});
