import { act, renderHook } from '@testing-library/react';
import { expect } from 'vitest';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

it('검색어가 비어있을 때 현재 주간 view 범위의 모든 이벤트를 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-08-20',
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-08-20',
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-08-25',
    },
  ] as Event[];
  const currentDate = new Date('2025-08-20');

  const { result } = renderHook(() => useSearch(events, currentDate, 'week'));

  expect(result.current.filteredEvents).toEqual([
    { id: '1', title: '이벤트 1', date: '2025-08-20' },
    { id: '2', title: '이벤트 2', date: '2025-08-20' },
  ]);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-08-20',
      startTime: '08:00',
      endTime: '10:00',
      description: '첫 번째 이벤트',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-08-20',
      startTime: '11:00',
      endTime: '13:00',
      description: '두 번째 이벤트',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-08-25',
      startTime: '12:00',
      endTime: '14:00',
      description: '세 번째 이벤트',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    },
  ];
  const currentDate = new Date('2025-08-20');

  const { result } = renderHook(() => useSearch(events, currentDate, 'week'));

  act(() => {
    result.current.setSearchTerm('이벤트 1');
  });

  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-08-20',
      startTime: '08:00',
      endTime: '10:00',
      description: '첫 번째 이벤트',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
  ]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-08-20',
      startTime: '08:00',
      endTime: '10:00',
      description: '첫 번째 이벤트',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-08-20',
      startTime: '11:00',
      endTime: '13:00',
      description: '두 번째 이벤트',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-08-25',
      startTime: '12:00',
      endTime: '14:00',
      description: '세 번째 이벤트',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    },
  ];
  const currentDate = new Date('2025-08-20');

  const { result } = renderHook(() => useSearch(events, currentDate, 'week'));

  act(() => {
    result.current.setSearchTerm('회의실 A');
  });

  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-08-20',
      startTime: '08:00',
      endTime: '10:00',
      description: '첫 번째 이벤트',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
  ]);
});

it('현재 월간에 해당하는 이벤트만 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-08-20',
      startTime: '08:00',
      endTime: '10:00',
      description: '첫 번째 이벤트',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-08-20',
      startTime: '11:00',
      endTime: '13:00',
      description: '두 번째 이벤트',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-09-25',
      startTime: '12:00',
      endTime: '14:00',
      description: '세 번째 이벤트',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    },
  ];
  const currentDate = new Date('2025-08-20');

  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('이벤트');
  });

  console.log('result.current.filteredEvents', result.current.filteredEvents);

  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-08-20',
      startTime: '08:00',
      endTime: '10:00',
      description: '첫 번째 이벤트',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-08-20',
      startTime: '11:00',
      endTime: '13:00',
      description: '두 번째 이벤트',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-08-20',
      startTime: '08:00',
      endTime: '10:00',
      description: '회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-08-20',
      startTime: '11:00',
      endTime: '13:00',
      description: '점심',
      location: '식당',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-09-25',
      startTime: '12:00',
      endTime: '14:00',
      description: '세 번째 이벤트',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    },
  ];
  const currentDate = new Date('2025-08-20');

  const { result } = renderHook(() => useSearch(events, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-08-20',
      startTime: '08:00',
      endTime: '10:00',
      description: '회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
  ]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-08-20',
      startTime: '11:00',
      endTime: '13:00',
      description: '점심',
      location: '식당',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ]);
});
