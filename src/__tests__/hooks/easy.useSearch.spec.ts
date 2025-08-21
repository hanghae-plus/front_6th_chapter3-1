import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { expect } from 'vitest';
import { createEvent } from '../__fixture__/eventFactory.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const caseEvent = [
    createEvent({
      id: '1',
      title: 'event1',
      date: '2025-05-01',
    }),
    createEvent({
      id: '2',
      title: 'event2',
      date: '2025-05-02',
    }),
  ];
  const { result } = renderHook(() => useSearch(caseEvent, new Date('2025-05-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('');
  });

  expect(result.current.filteredEvents).toEqual(caseEvent);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const targetCase = [
    createEvent({
      id: '1',
      title: '검색어',
      date: '2025-05-01',
    }),
  ];
  const caseEvent = [
    ...targetCase,
    createEvent({
      id: '2',
      title: 'event2',
      date: '2025-05-02',
    }),
  ];
  const { result } = renderHook(() => useSearch(caseEvent, new Date('2025-05-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('검색어');
  });
  expect(result.current.filteredEvents).toEqual(targetCase);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const targetCase = [
    createEvent({
      id: '1',
      title: '검색어',
      date: '2025-05-01',
      description: '설명을 맞추셈',
    }),
  ];
  const caseEvent = [
    ...targetCase,
    createEvent({
      id: '2',
      title: 'event2',
      date: '2025-05-02',
      description: 'GOOD',
    }),
  ];
  const { result } = renderHook(() => useSearch(caseEvent, new Date('2025-05-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('설명');
  });
  expect(result.current.filteredEvents).toEqual(targetCase);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const targetCase = [
    createEvent({
      id: '1',
      title: '검색어',
      date: '2025-05-01',
      description: '설명을 맞추셈',
    }),
    createEvent({
      id: '2',
      title: 'event2',
      date: '2025-05-02',
      description: 'GOOD',
    }),
    createEvent({
      id: '3',
      title: 'event3',
      date: '2025-05-03',
      description: 'HIROSHIMA',
    }),
  ];
  const caseEvent = [
    ...targetCase,
    createEvent({
      id: '4',
      title: 'event4',
      date: '2025-06-04',
      description: 'Not',
    }),
    createEvent({
      id: '5',
      title: 'event5',
      date: '2025-06-05',
      description: 'Birthday',
    }),
  ];
  const { result } = renderHook(() => useSearch(caseEvent, new Date('2025-05-01'), 'month'));

  expect(result.current.filteredEvents).toEqual(targetCase);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const updatedCase = [
    createEvent({
      id: '1',
      title: '검색어',
      date: '2025-05-01',
      description: '점심',
    }),
  ];
  const originCase = [
    createEvent({
      id: '2',
      title: 'event2',
      date: '2025-05-02',
      description: 'GOOD 회의',
    }),
  ];
  const caseEvent = [...updatedCase, ...originCase];
  const { result } = renderHook(() => useSearch(caseEvent, new Date('2025-05-01'), 'month'));
  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual(originCase);
  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual(updatedCase);
});
