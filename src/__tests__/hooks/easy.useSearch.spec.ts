import { act, renderHook } from '@testing-library/react';

import realEvents from '../../__mocks__/response/realEvents.json';
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events = realEvents.events as Event[];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const date = new Date('2025-08-01');
  const { result } = renderHook(() => useSearch(events, date, 'month'));
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const date = new Date('2025-08-01');
  const { result } = renderHook(() => useSearch(events, date, 'month'));
  const expected: Event[] = [
    {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  act(() => {
    result.current.setSearchTerm('프로젝트');
  });

  expect(result.current.filteredEvents).toEqual(expected);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const date = new Date('2025-08-01');
  const { result } = renderHook(() => useSearch(events, date, 'month'));
  const expected: Event[] = [
    {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  act(() => {
    result.current.setSearchTerm('프로젝트');
  });

  expect(result.current.filteredEvents).toEqual(expected);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const date = new Date('2025-08-20');
  const { result } = renderHook(() => useSearch(events, date, 'week'));
  const expected: Event[] = [
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-08-20',
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
  ];

  expect(result.current.filteredEvents).toEqual(expected);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const date = new Date('2025-08-01');
  const { result } = renderHook(() => useSearch(events, date, 'month'));
  const expected1: Event[] = [
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];
  const expected2: Event[] = [
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
  ];

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual(expected1);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual(expected2);
});
