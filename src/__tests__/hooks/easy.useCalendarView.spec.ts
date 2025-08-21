import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 입력된 당시의 날짜이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    const todayDate = new Date();

    expect(result.current.currentDate.getFullYear()).toBe(todayDate.getFullYear());
    expect(result.current.currentDate.getMonth()).toBe(todayDate.getMonth());
    expect(result.current.currentDate.getDate()).toBe(todayDate.getDate());
  });

  it('holidays는 10월 휴일인 개천절, 한글날, 추석이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    const octoberDay = new Date(2025, 9, 1); // 2025-10-01

    act(() => {
      result.current.setCurrentDate(octoberDay);
    });

    const openSkyDay = '2025-10-03'; // 개천절
    const koreanDay = '2025-10-06'; // 한글날
    const chusuk = '2025-10-09'; // 추석

    expect(result.current.holidays).toHaveProperty(openSkyDay);
    expect(result.current.holidays).toHaveProperty(koreanDay);
    expect(result.current.holidays).toHaveProperty(chusuk);
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

it('주간 뷰에서 다음으로 navigate시 현재 날짜의 7일 후 날짜로 지정이 된다', () => {
  const { result } = renderHook(() => useCalendarView());
  const todayDate = new Date();

  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');

  act(() => {
    result.current.navigate('next');
  });

  const nextWeekDate = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate() + 7
  );

  expect(result.current.currentDate.getFullYear()).toBe(nextWeekDate.getFullYear());
  expect(result.current.currentDate.getMonth()).toBe(nextWeekDate.getMonth());
  expect(result.current.currentDate.getDate()).toBe(nextWeekDate.getDate());
});

it('주간 뷰에서 이전으로 navigate시 현재 날짜의 7일전 날짜로 지정이 된다', () => {
  const { result } = renderHook(() => useCalendarView());
  const todayDate = new Date();

  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');

  act(() => {
    result.current.navigate('prev');
  });

  const prevWeekDate = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate() - 7
  );

  expect(result.current.currentDate.getFullYear()).toBe(prevWeekDate.getFullYear());
  expect(result.current.currentDate.getMonth()).toBe(prevWeekDate.getMonth());
  expect(result.current.currentDate.getDate()).toBe(prevWeekDate.getDate());
});

it("월간 뷰에서 다음으로 navigate시 한 달 후 '2025-11-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());
  const todayDate = new Date();

  act(() => {
    result.current.navigate('next');
  });

  const nextMonthDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1);

  expect(result.current.currentDate.getFullYear()).toBe(nextMonthDate.getFullYear());
  expect(result.current.currentDate.getMonth()).toBe(nextMonthDate.getMonth());
  expect(result.current.currentDate.getDate()).toBe(nextMonthDate.getDate());
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());
  const todayDate = new Date();

  act(() => {
    result.current.navigate('prev');
  });

  const prevMonthDate = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1);

  expect(result.current.currentDate.getFullYear()).toBe(prevMonthDate.getFullYear());
  expect(result.current.currentDate.getMonth()).toBe(prevMonthDate.getMonth());
  expect(result.current.currentDate.getDate()).toBe(prevMonthDate.getDate());
});

it("currentDate가 '2025-03-01'로 변경되면 holidays가 '삼일절'이 포함된 명단으로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());

  const samiljeol = new Date(2025, 2, 1); // 2025-03-01

  act(() => {
    result.current.setCurrentDate(samiljeol);
  });

  expect(result.current.holidays).toEqual({
    '2025-03-01': '삼일절',
  });
});
