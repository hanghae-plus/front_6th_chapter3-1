import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '이벤트 2',
    date: '2025-07-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '점심 약속',
    date: '2025-08-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '09702fb3-a428-40b3-905e-9ab3c8849dcd',
    title: '뚜민이 응원하기',
    date: '2025-08-01',
    startTime: '12:30',
    endTime: '13:30',
    description: '뚜민이 잘할 수 있어',
    location: '아이콘빌딩 13층',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-08-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('');
  });

  const expectedEvents = mockEvents.filter((event) => event.date.startsWith('2025-08'));
  expect(result.current.filteredEvents).toEqual(expectedEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  9;
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-08-22'), 'week'));
  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.searchTerm).toBe('점심');
  expect(result.current.filteredEvents[0]).toEqual(mockEvents[1]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-08-22'), 'week'));
  // 제목
  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.searchTerm).toBe('점심');
  expect(result.current.filteredEvents[0]).toEqual(mockEvents[1]);

  // 설명
  act(() => {
    result.current.setSearchTerm('동료');
  });

  expect(result.current.searchTerm).toBe('동료');
  expect(result.current.filteredEvents[0]).toEqual(mockEvents[1]);

  // 위치
  act(() => {
    result.current.setSearchTerm('식당');
  });

  expect(result.current.searchTerm).toBe('식당');
  expect(result.current.filteredEvents[0]).toEqual(mockEvents[1]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  // 주간
  const { result: weekResult } = renderHook(() =>
    useSearch(mockEvents, new Date('2025-08-22'), 'week')
  );

  expect(weekResult.current.filteredEvents[0]).toEqual({
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '점심 약속',
    date: '2025-08-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  });

  // 월간
  const { result: monthResult } = renderHook(() =>
    useSearch(mockEvents, new Date('2025-07-22'), 'month')
  );

  expect(monthResult.current.filteredEvents[0]).toEqual({
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '이벤트 2',
    date: '2025-07-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  });
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-08-22'), 'week'));

  // 회의에서
  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.searchTerm).toBe('회의');
  expect(result.current.filteredEvents).toEqual([]);

  // 점심으로 변경
  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.searchTerm).toBe('점심');
  expect(result.current.filteredEvents[0]).toEqual({
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '점심 약속',
    date: '2025-08-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  });
});
