import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { makeEvent, makeEvents } from '../factories/eventFactory.ts';

it('검색어가 비어있을 때 기간 조건에 해당하는 모든 이벤트를 반환해야 한다', () => {
  const initialEvents = makeEvents(3, () => ({ date: '2025-10-15' }));

  const currentDate = new Date(2025, 9, 12); // 2025-10-12
  const { result } = renderHook(() => useSearch(initialEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('');
  });

  expect(result.current.filteredEvents).toHaveLength(3);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const currentDate = new Date(2025, 9, 12); // 2025-10-12

  const dailyMeetingEvent = makeEvent({ title: '일간 회의', date: '2025-10-15' });
  const weeklyMeetingEvent = makeEvent({ title: '주간 회의', date: '2025-10-15' });
  const weeklyStudyEvent = makeEvent({ title: '주간 스터디', date: '2025-10-15' });
  const monthlyMeetingEvent = makeEvent({ title: '월간 회의', date: '2025-10-15' });
  const yearMeetingEvent = makeEvent({ title: '연간 회의', date: '2025-10-15' });

  const uncontainedEvent = [dailyMeetingEvent, monthlyMeetingEvent, yearMeetingEvent];
  const containedEvent = [weeklyMeetingEvent, weeklyStudyEvent];

  const initialEvents = [...containedEvent, ...uncontainedEvent];

  const { result } = renderHook(() => useSearch(initialEvents, currentDate, 'month'));
  expect(result.current.filteredEvents).toHaveLength(5);

  act(() => {
    result.current.setSearchTerm('주간');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents).toMatchObject([
    { title: '주간 회의' },
    { title: '주간 스터디' },
  ]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const currentDate = new Date(2025, 9, 12); // 2025-10-12

  const uncontainedEvent = makeEvent({ title: '월간 회의', date: '2025-10-15' });
  const containedTitleEvent = makeEvent({ title: '주간 회의', date: '2025-10-15' });
  const containedDescriptionEvent = makeEvent({ description: '주간 스터디', date: '2025-10-15' });
  const containedLocationEvent = makeEvent({ location: '주간 회의장', date: '2025-10-15' });

  const initialEvents = [
    containedTitleEvent,
    containedDescriptionEvent,
    containedLocationEvent,
    uncontainedEvent,
  ];

  const { result } = renderHook(() => useSearch(initialEvents, currentDate, 'month'));
  expect(result.current.filteredEvents).toHaveLength(4);

  act(() => {
    result.current.setSearchTerm('주간');
  });

  expect(result.current.filteredEvents).toHaveLength(3);
  expect(result.current.filteredEvents).toMatchObject([
    { title: '주간 회의' },
    { description: '주간 스터디' },
    { location: '주간 회의장' },
  ]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const currentDate = new Date(2025, 9, 12); // 2025-10-12

  const afterOneDayEvent = makeEvent({ date: '2025-10-13' });
  const afterTwoDayEvent = makeEvent({ date: '2025-10-14' });
  const afterTwoWeekEvent = makeEvent({ date: '2025-10-26' });
  const afterTwoMonthEvent = makeEvent({ date: '2025-12-12' });

  const initialEvents = [afterOneDayEvent, afterTwoDayEvent, afterTwoWeekEvent, afterTwoMonthEvent];

  const { result } = renderHook(() => useSearch(initialEvents, currentDate, 'week'));

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents).toMatchObject([
    { date: '2025-10-13' },
    { date: '2025-10-14' },
  ]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const currentDate = new Date(2025, 9, 12); // 2025-10-12

  const dailyMeetingEvent = makeEvent({ title: '일간 회의', date: '2025-10-15' });
  const weeklyMeetingEvent = makeEvent({ title: '주간 회의', date: '2025-10-15' });
  const weeklyLunchEvent = makeEvent({ title: '주간 점심', date: '2025-10-15' });
  const butaiLunchEvent = makeEvent({ description: '부타이 점심', date: '2025-10-15' });
  const yearMeetingEvent = makeEvent({ title: '연간 회의', date: '2025-10-15' });

  const initialEvents = [
    dailyMeetingEvent,
    weeklyMeetingEvent,
    weeklyLunchEvent,
    butaiLunchEvent,
    yearMeetingEvent,
  ];

  const { result } = renderHook(() => useSearch(initialEvents, currentDate, 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(3);
  expect(result.current.filteredEvents).toMatchObject([
    { title: '일간 회의' },
    { title: '주간 회의' },
    { title: '연간 회의' },
  ]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents).toMatchObject([
    { title: '주간 점심' },
    { description: '부타이 점심' },
  ]);
});
