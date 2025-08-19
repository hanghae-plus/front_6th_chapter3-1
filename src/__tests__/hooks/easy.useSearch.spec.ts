import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

it('검색어가 비어있고, 월간 뷰에서 모든 이벤트를 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '신규 세미나',
      date: '2025-07-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '신규 프로젝트 세미나',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '점심 약속',
      date: '2025-07-22',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 약속',
      location: '식당 C',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('');
  });
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '신규 세미나',
      date: '2025-07-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '신규 프로젝트 세미나',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '점심 약속',
      date: '2025-07-22',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 약속',
      location: '식당 C',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('세미나');
  });
  expect(result.current.filteredEvents).toEqual([
    {
      id: '2',
      title: '신규 세미나',
      date: '2025-07-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '신규 프로젝트 세미나',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '신규 세미나',
      date: '2025-07-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '신규 프로젝트 세미나',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '점심 약속',
      date: '2025-07-22',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 약속',
      location: '식당 C',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '신규 세미나',
      date: '2025-07-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '신규 프로젝트 세미나',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('현재 뷰(주간)에 해당하는 이벤트만 반환해야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '신규 세미나',
      date: '2025-07-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '신규 프로젝트 세미나',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '점심 약속',
      date: '2025-07-22',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 약속',
      location: '식당 C',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'week'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '신규 세미나',
      date: '2025-07-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '신규 프로젝트 세미나',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '점심 약속',
      date: '2025-07-22',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 약속',
      location: '식당 C',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  const { result } = renderHook(() => useSearch(events, new Date('2025-07-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '신규 세미나',
      date: '2025-07-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '신규 프로젝트 세미나',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);

  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([
    {
      id: '3',
      title: '점심 약속',
      date: '2025-07-22',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 약속',
      location: '식당 C',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});
