import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜여야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    const today = new Date();

    assertDate(result.current.currentDate, today);
  });

  it('holidays는 8월 휴일인 광복절이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.holidays).toEqual({
      '2025-08-15': '광복절',
    });
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });
  expect(result.current.view).toBe('week');
});

it('주간 뷰에서 다음으로 navigate시 다음 주 날짜가 나타나야 한다', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });
  act(() => {
    result.current.navigate('next');
  });

  const newDate = new Date();
  newDate.setDate(newDate.getDate() + 7);

  expect(result.current.view).toBe('week');
  assertDate(result.current.currentDate, newDate);
});

it('주간 뷰에서 이전으로 navigate시 이전 주 날짜가 나타나야 한다', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });
  act(() => {
    result.current.navigate('prev');
  });

  const newDate = new Date();
  newDate.setDate(newDate.getDate() - 7);

  expect(result.current.view).toBe('week');
  assertDate(result.current.currentDate, newDate);
});

it('월간 뷰에서 다음으로 navigate시 다음 달 날짜가 나타나야 한다', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.navigate('next');
  });

  const newDate = new Date();
  newDate.setDate(1);
  newDate.setMonth(newDate.getMonth() + 1);

  assertDate(result.current.currentDate, newDate);
});

it('월간 뷰에서 이전으로 navigate시 이전 달 날짜가 나타나야 한다', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.navigate('prev');
  });

  const newDate = new Date();
  newDate.setDate(1);
  newDate.setMonth(newDate.getMonth() - 1);

  assertDate(result.current.currentDate, newDate);
});

it("currentDate가 '2025-03-01' 변경되면 3월 휴일 '삼일절'로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-03-01'));
  });
  expect(result.current.holidays).toEqual({
    '2025-03-01': '삼일절',
  });
});
