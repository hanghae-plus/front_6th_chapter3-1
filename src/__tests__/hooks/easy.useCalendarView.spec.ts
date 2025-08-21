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

  it('currentDate를 2025년 10월로 설정하면 해당 월의 휴일들이 로드되어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setCurrentDate(new Date(2025, 9, 1)); // 2025년 10월 1일
    });

    expect(result.current.holidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
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

it('주간 뷰에서 다음으로 navigate시 다음주 7일 후 날짜로 지정이 된다', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('next');
  });

  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + 7);

  assertDate(result.current.currentDate, expectedDate);
});

it('주간 뷰에서 이전으로 navigate시 7일 전 날짜로 지정이 된다', () => {
  const { result } = renderHook(() => useCalendarView());

  const currentDate = new Date();

  act(() => {
    result.current.setCurrentDate(currentDate);
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('prev');
  });

  const expectedDate = new Date(currentDate);
  expectedDate.setDate(expectedDate.getDate() - 7);

  assertDate(result.current.currentDate, expectedDate);
});

it('월간 뷰에서 다음으로 navigate시 다음 달 첫째 날로 지정이 된다', () => {
  const { result } = renderHook(() => useCalendarView());

  const initialDate = new Date();

  act(() => {
    result.current.setCurrentDate(initialDate);
    result.current.setView('month');
  });

  act(() => {
    result.current.navigate('next');
  });

  const expectedDate = new Date(initialDate);
  expectedDate.setMonth(expectedDate.getMonth() + 1);
  expectedDate.setDate(1);

  assertDate(result.current.currentDate, expectedDate);
});

it('월간 뷰에서 이전으로 navigate시 이전 달 첫째 날로 지정이 된다', () => {
  const { result } = renderHook(() => useCalendarView());

  const currentDate = new Date();

  act(() => {
    result.current.setCurrentDate(currentDate);
    result.current.setView('month');
  });

  act(() => {
    result.current.navigate('prev');
  });

  const expectedDate = new Date(currentDate);
  expectedDate.setMonth(expectedDate.getMonth() - 1);
  expectedDate.setDate(1);

  assertDate(result.current.currentDate, expectedDate);
});

it('currentDate가 변경되면 해당 월의 휴일로 업데이트되어야 한다', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date(2025, 2, 1)); // 2025-03-01
  });

  expect(result.current.holidays).toEqual({
    '2025-03-01': '삼일절',
  });

  act(() => {
    result.current.setCurrentDate(new Date(2025, 4, 1)); // 2025-05-01
  });

  expect(result.current.holidays).toEqual({
    '2025-05-05': '어린이날',
  });
});
