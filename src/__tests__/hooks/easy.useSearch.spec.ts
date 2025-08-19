import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  // 1. '회의' 관련 이벤트들
  {
    id: 'search-1',
    title: '팀 회의',
    date: '2025-07-01', // 화요일 (첫째 주)
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },
  {
    id: 'search-2',
    title: '프로젝트A 검토',
    date: '2025-07-03', // 목요일 (첫째 주)
    startTime: '14:00',
    endTime: '15:00',
    description: '월간 회의 준비',  // 설명에 '회의' 포함
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },

  // 2. '점심' 관련 이벤트
  {
    id: 'search-3',
    title: '점심 약속',
    date: '2025-07-02', // 수요일 (첫째 주)
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },

  // 3. 위치에 키워드가 있는 이벤트
  {
    id: 'search-4',
    title: '고객 미팅',
    date: '2025-07-08', // 화요일 (둘째 주)
    startTime: '16:00',
    endTime: '17:00',
    description: '고객사 A 방문',
    location: '점심식당 옆 카페', // 위치에 '점심' 포함
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },

  // 4. 다른 달 이벤트 (월간 뷰 테스트용)
  {
    id: 'search-5',
    title: '월초 회의',
    date: '2025-08-01', // 다른 달
    startTime: '09:00',
    endTime: '10:00',
    description: '8월 계획 수립',
    location: '대회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },

  // 5. 매칭되지 않는 이벤트
  {
    id: 'search-6',
    title: '개인 운동',
    date: '2025-07-05', // 토요일 (첫째 주)
    startTime: '18:00',
    endTime: '19:00',
    description: '헬스장 운동',
    location: '피트니스센터',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },
];

it('검색어가 비어있을 때 view에 해당하는 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  const expected = [events[0], events[1], events[2], events[3], events[5]];

  expect(result.current.filteredEvents).toEqual(expected);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  const expected = [events[0], events[1]];

  expect(result.current.filteredEvents).toEqual(expected);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('A');
  });

  const expected = [events[0], events[1], events[3]];

  expect(result.current.filteredEvents).toEqual(expected);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  const expected = [events[0], events[1], events[2], events[3], events[5]];

  expect(result.current.filteredEvents).toEqual(expected);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  const expected1 = [events[0], events[1]];

  expect(result.current.filteredEvents).toEqual(expected1);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  const expected2 = [events[2], events[3]];

  expect(result.current.filteredEvents).toEqual(expected2);
});
