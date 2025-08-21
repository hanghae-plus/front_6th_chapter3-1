import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '스프린트 계획 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 식사',
    date: '2025-10-15',
    startTime: '12:00',
    endTime: '13:00',
    description: '동료와 점심',
    location: '구내식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '헬스',
    date: '2025-11-02',
    startTime: '18:00',
    endTime: '19:00',
    description: '운동',
    location: '헬스장',
    category: '건강',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const renderUseSearch = (
  searchEvents: Event[] = mockEvents,
  currentDate: Date = new Date('2025-10-15'),
  view: 'week' | 'month' = 'month'
) =>
  renderHook(({ evts, date, viewType }) => useSearch(evts, date, viewType), {
    initialProps: { evts: searchEvents, date: currentDate, viewType: view },
  });

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderUseSearch();
  expect(result.current.filteredEvents).toHaveLength(mockEvents.length);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderUseSearch();

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 식사');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderUseSearch();

  act(() => {
    result.current.setSearchTerm('구내식당');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].location).toBe('구내식당');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  // 1) 주간 뷰: currentDate 2025-10-15 => event 1,2 in same week; exclude id3 (november)
  const { result: weekResult, rerender } = renderUseSearch(mockEvents, new Date('2025-10-15'), 'week');

  expect(weekResult.current.filteredEvents).toHaveLength(2);

  // 2) 월간 뷰: 2025-10 -> expect 1,2 (oct) ; exclude nov event
  rerender({ evts: mockEvents, date: new Date('2025-10-15'), viewType: 'month' });
  expect(weekResult.current.filteredEvents).toHaveLength(2);

  // 3) 월간 11월 : only id3
  rerender({ evts: mockEvents, date: new Date('2025-11-02'), viewType: 'month' });
  expect(weekResult.current.filteredEvents).toHaveLength(1);
  expect(weekResult.current.filteredEvents[0].title).toBe('헬스');
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderUseSearch();

  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('팀 회의');

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('점심 식사');
});
