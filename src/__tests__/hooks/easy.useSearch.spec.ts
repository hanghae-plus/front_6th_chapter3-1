import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch';
import { Event } from '../../types';

const mockEvent: Event[] = [
  {
    id: '1',
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
    id: '2',
    title: '프로젝트 회의',
    date: '2025-08-20',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 프로젝트 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '점심 팀회식',
    date: '2025-08-24',
    startTime: '12:00',
    endTime: '13:00',
    description: '분기 팀 회식',
    location: '강동화로',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const mockDate = new Date('2025-08-22');

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvent, mockDate, 'month'));

  expect(result.current.filteredEvents).toEqual(mockEvent);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvent, mockDate, 'month'));

  act(() => result.current.setSearchTerm('회식'));
  expect(result.current.filteredEvents).toEqual([mockEvent[2]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvent, mockDate, 'month'));

  act(() => result.current.setSearchTerm('주간 프로젝트 미팅'));
  expect(result.current.filteredEvents).toEqual([mockEvent[1]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: weekResult } = renderHook(() => useSearch(mockEvent, mockDate, 'week'));
  const { result: monthResult } = renderHook(() => useSearch(mockEvent, mockDate, 'month'));

  expect(weekResult.current.filteredEvents).toEqual([mockEvent[0], mockEvent[1]]);
  expect(monthResult.current.filteredEvents).toEqual(mockEvent);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(mockEvent, mockDate, 'month'));

  act(() => result.current.setSearchTerm('회의'));
  expect(result.current.filteredEvents).toEqual([mockEvent[0], mockEvent[1]]);

  act(() => result.current.setSearchTerm('점심'));
  expect(result.current.filteredEvents).toEqual([mockEvent[2]]);
});
