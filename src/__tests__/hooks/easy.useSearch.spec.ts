import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const wholeEvents: Event[] = [
  {
    id: '1',
    title: '커피 챗(오프라인)',
    description: '아침에 동료들과 대화를 나누며 커피를 마십니다.',
    location: '회의실',
    startTime: '09:00',
    endTime: '09:25',
    date: '2025-08-22',
    category: '회의',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '선릉표류기(점심)',
    description: '항해 플러스 동기들과 점심에 식사를 합니다.',
    location: '온수반 역삼점',
    startTime: '12:00',
    endTime: '13:00',
    date: '2025-08-20',
    category: '식사',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '가족 모임',
    description: '가족들과 저녁에 식사를 합니다.',
    location: '집',
    startTime: '18:00',
    endTime: '19:00',
    date: '2025-08-31',
    category: '행사',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  },
  {
    id: '4',
    title: '클라이언트와 미팅',
    description: '클라이언트에게 기획 설명 회의를 진행합니다.',
    location: '역삼 아이콘 빌딩',
    startTime: '13:00',
    endTime: '15:25',
    date: '2025-08-20',
    category: '미팅',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
];

const weekEvents: Event[] = wholeEvents.filter((event) => event.date !== '2025-08-31');

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(weekEvents, new Date('2025-08-22'), 'week'));

  expect(result.current.filteredEvents).toEqual(weekEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(weekEvents, new Date('2025-08-22'), 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([wholeEvents[0], wholeEvents[3]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(weekEvents, new Date('2025-08-22'), 'week'));

  act(() => {
    result.current.setSearchTerm('동');
  });

  expect(result.current.filteredEvents).toEqual([wholeEvents[0], wholeEvents[1]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: weekResult } = renderHook(() =>
    useSearch(wholeEvents, new Date('2025-08-22'), 'week')
  );
  expect(weekResult.current.filteredEvents).toEqual(weekEvents);

  const { result: monthResult } = renderHook(() =>
    useSearch(wholeEvents, new Date('2025-08-22'), 'month')
  );
  expect(monthResult.current.filteredEvents).toEqual(wholeEvents);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(wholeEvents, new Date('2025-08-22'), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([wholeEvents[0], wholeEvents[3]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([wholeEvents[1]]);
});
