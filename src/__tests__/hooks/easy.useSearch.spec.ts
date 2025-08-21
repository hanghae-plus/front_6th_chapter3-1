import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const MOCK_EVENTS: Event[] = [
  {
    id: 'new-1',
    title: '오전 회의', // 회의
    date: '2025-08-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '월초 팀 회의', // 회의
    location: '회의실 A', // 회의
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'new-2',
    title: '오후 미팅',
    date: '2025-08-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '월초 프로젝트 미팅',
    location: '회의실 B', // 회의
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '점심 약속 회의', //회의, 점심
    date: '2025-08-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사', // 점심
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
    title: '프로젝트 마감',
    date: '2025-08-25',
    startTime: '09:00',
    endTime: '18:00',
    description: '분기별 프로젝트 마감 회의', //회의
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'dac62941-69e5-4ec0-98cc-24c2a79a7f81',
    title: '생일 파티',
    date: '2025-08-28',
    startTime: '19:00',
    endTime: '22:00',
    description: '친구 생일 축하',
    location: '친구 집',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '80d85368-b4a4-47b3-b959-25171d49371f',
    title: '운동',
    date: '2025-08-22',
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'event7',
    title: '운동',
    date: '2025-09-22',
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];
it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-01'));

  const { result } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  expect(result.current.filteredEvents.length).toBe(MOCK_EVENTS.length);

  vi.useRealTimers();
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-01'));

  const { result } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([
    MOCK_EVENTS[0],
    MOCK_EVENTS[1],
    MOCK_EVENTS[2],
    MOCK_EVENTS[3],
  ]);

  vi.useRealTimers();
});

/** 불필요한 테스트. 위에 있는 테스트와 유닛테스트에서 검증됨 */
it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-01'));

  const { result } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([
    MOCK_EVENTS[0],
    MOCK_EVENTS[1],
    MOCK_EVENTS[2],
    MOCK_EVENTS[3],
  ]);

  vi.useRealTimers();
});

/** 불필요한 테스트. 위에 있는 테스트와 유닛테스트에서 검증됨 */
it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-01'));

  const { result, unmount } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  expect(result.current.filteredEvents).toEqual(MOCK_EVENTS.slice(0, 6));
  unmount();

  const { result: weekResult } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'week'));
  expect(weekResult.current.filteredEvents).toEqual([MOCK_EVENTS[0], MOCK_EVENTS[1]]);

  vi.useRealTimers();
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-01'));

  const { result } = renderHook(() => useSearch(MOCK_EVENTS, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([
    MOCK_EVENTS[0],
    MOCK_EVENTS[1],
    MOCK_EVENTS[2],
    MOCK_EVENTS[3],
  ]);

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([MOCK_EVENTS[2]]);

  vi.useRealTimers();
});
