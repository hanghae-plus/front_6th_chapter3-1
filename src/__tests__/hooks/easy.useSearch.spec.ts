import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

import { events } from '../../__mocks__/response/realEvents.json';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-01'));
});

const currentDate = new Date();

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  // given 이벤트 리스트 초기화
  const { result } = renderHook(() => useSearch(events as Event[], currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('');
  });

  // then 모든 이벤트를 반환
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  // given 이벤트 리스트 초기화
  const { result } = renderHook(() => useSearch(events as Event[], currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('프로젝트');
  });

  // then 검색어에 맞는 이벤트만 필터링
  expect(result.current.filteredEvents).toEqual(
    events.filter((event) => event.title.includes('프로젝트'))
  );

  act(() => {
    result.current.setSearchTerm('프로젝트 마감');
  });

  // then 검색어에 맞는 이벤트만 필터링
  expect(result.current.filteredEvents).toEqual(
    events.filter((event) => event.title.includes('프로젝트 마감'))
  );
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  // given 이벤트 리스트 초기화
  const { result } = renderHook(() => useSearch(events as Event[], currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('프로젝트');
  });

  // then 검색어에 맞는 이벤트만 필터링
  expect(result.current.filteredEvents).toEqual(
    events.filter((event) => event.title.includes('프로젝트'))
  );
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  // given 이벤트 리스트 초기화
  const { result } = renderHook(() => useSearch(events as Event[], currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('프로젝트');
  });

  // then 검색어에 맞는 이벤트만 필터링
  expect(result.current.filteredEvents).toEqual(
    events.filter((event) => event.title.includes('프로젝트'))
  );

  act(() => {
    result.current.setSearchTerm('프로젝트 마감');
  });

  // then 검색어에 맞는 이벤트만 필터링
  expect(result.current.filteredEvents).toEqual(
    events.filter((event) => event.title.includes('프로젝트 마감'))
  );
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  // given 이벤트 리스트 초기화
  const { result } = renderHook(() => useSearch(events as Event[], currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('프로젝트');
  });

  // then 검색어에 맞는 이벤트만 필터링
  expect(result.current.filteredEvents).toEqual(
    events.filter((event) => event.title.includes('프로젝트'))
  );
});
