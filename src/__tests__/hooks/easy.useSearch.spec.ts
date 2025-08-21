import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-01-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '주간 프로젝트 진행상황 공유',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-01-15',
    startTime: '12:00',
    endTime: '13:00',
    description: '팀원들과 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
  {
    id: '3',
    title: '고객 미팅',
    date: '2025-01-16',
    startTime: '14:00',
    endTime: '15:00',
    description: '신규 프로젝트 제안',
    location: '온라인',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 20,
  },
  {
    id: '4',
    title: '운동',
    date: '2025-01-22',
    startTime: '18:00',
    endTime: '19:00',
    description: '헬스장에서 운동',
    location: '피트니스 센터',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
];

const currentDate = new Date('2025-01-15');

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents).toHaveLength(4);
  expect(result.current.filteredEvents).toEqual(mockEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.searchTerm).toBe('회의');
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '팀 회의',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 프로젝트 진행상황 공유',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  // 제목으로 검색
  act(() => {
    result.current.setSearchTerm('팀');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '팀 회의',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 프로젝트 진행상황 공유',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-01-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀원들과 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ]);

  // 설명으로 검색
  act(() => {
    result.current.setSearchTerm('프로젝트');
  });
  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '팀 회의',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 프로젝트 진행상황 공유',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '고객 미팅',
      date: '2025-01-16',
      startTime: '14:00',
      endTime: '15:00',
      description: '신규 프로젝트 제안',
      location: '온라인',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 20,
    },
  ]);

  // 위치로 검색
  act(() => {
    result.current.setSearchTerm('온라인');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents).toEqual([
    {
      id: '3',
      title: '고객 미팅',
      date: '2025-01-16',
      startTime: '14:00',
      endTime: '15:00',
      description: '신규 프로젝트 제안',
      location: '온라인',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 20,
    },
  ]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: weekResult } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

  // 주간 뷰에서는 1월 15일과 16일 이벤트만 표시되어야 함
  expect(weekResult.current.filteredEvents).toHaveLength(3);
  expect(weekResult.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '팀 회의',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 프로젝트 진행상황 공유',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-01-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀원들과 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
    {
      id: '3',
      title: '고객 미팅',
      date: '2025-01-16',
      startTime: '14:00',
      endTime: '15:00',
      description: '신규 프로젝트 제안',
      location: '온라인',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 20,
    },
  ]);

  // 월간 뷰로 설정
  const { result: monthResult } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  // 월간 뷰에서는 모든 이벤트가 표시되어야 함
  expect(monthResult.current.filteredEvents).toHaveLength(4);
  expect(monthResult.current.filteredEvents).toEqual(mockEvents);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  // '회의'로 검색
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '팀 회의',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 프로젝트 진행상황 공유',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);

  // '점심'으로 검색어 변경
  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.searchTerm).toBe('점심');
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents).toEqual([
    {
      id: '2',
      title: '점심 약속',
      date: '2025-01-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀원들과 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ]);
});
