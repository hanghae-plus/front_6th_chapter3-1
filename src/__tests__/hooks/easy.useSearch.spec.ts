import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: 'a6b7c8d9-1111-2222-3333-444455556666',
    title: '디자인 회의',
    date: '2025-07-01',
    startTime: '16:00',
    endTime: '17:00',
    description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
    location: 'Figma/Jira',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '11112222-3333-4444-5555-666677778888',
    title: '코드리뷰 타임',
    date: '2025-07-02',
    startTime: '11:00',
    endTime: '11:30',
    description: 'PR #124 ~ #129 리뷰',
    location: 'GitHub PR',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 5,
  },
  {
    id: '9999aaaa-bbbb-cccc-dddd-eeeeffff0001',
    title: 'PT 상담 후 점심',
    date: '2025-07-03',
    startTime: '19:30',
    endTime: '20:00',
    description: '체형 분석 및 루틴 점검 타임',
    location: '동네 헬스장',
    category: '건강',
    repeat: { type: 'weekly', interval: 2 },
    notificationTime: 30,
  },
  {
    id: '9999aaaa-bbbb-ffff-dddd-eeeeffff0002',
    title: '이벤트 2',
    date: '2025-07-31',
    startTime: '10:00',
    endTime: '10:30',
    description: '이벤트 2 테스트',
    location: '이벤트 장소',
    category: '건강',
    repeat: { type: 'weekly', interval: 2 },
    notificationTime: 30,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('이벤트 2');
  });
  expect(result.current.filteredEvents).toEqual([events[3]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('타임');
  });
  expect(result.current.filteredEvents).toEqual([events[1], events[2]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: monthResult } = renderHook(() =>
    useSearch(events, new Date('2025-07-01'), 'month')
  );
  expect(monthResult.current.filteredEvents).toEqual(events);

  const { result: weekResult } = renderHook(() =>
    useSearch(events, new Date('2025-07-01'), 'week')
  );
  expect(weekResult.current.filteredEvents).toEqual([events[0], events[1], events[2]]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([events[0]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([events[2]]);
});
