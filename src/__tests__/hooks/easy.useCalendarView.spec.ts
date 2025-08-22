import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.view).toBe('month');
  });

  it('currentDate는 테스트하는 시점의 오늘 날짜이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    const now = new Date();
    const currentDate = result.current.currentDate;

    expect(currentDate.toDateString()).toBe(now.toDateString());
  });
});

// "view를 'week'으로 변경 시 적절하게 반영된다"
it("setView('week') 호출 시 view 상태가 'week'으로 변경된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

it('주간 뷰로 변경 시 해당 주에 속하는 이벤트들만 표시된다', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

// 주간 뷰에서 다음으로 navigate시 7일 후 날짜로 지정이 된다
it('주간 뷰에서 navigate("next") 호출 시 currentDate가 7일 후 날짜로 업데이트된다', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('next');
  });

  const now = new Date();
  const nextDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

  expect(result.current.currentDate.toDateString()).toBe(nextDate.toDateString());
});

// 주간 뷰에서 이전으로 navigate시 7일 전 날짜로 지정이 된다
it('주간 뷰에서 navigate("next") 호출 시 currentDate가 7일 전 날짜로 업데이트된다', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('prev');
  });

  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

  expect(result.current.currentDate.toDateString()).toBe(prevDate.toDateString());
});

it('월간 뷰에서 다음으로 navigate시 한 달 후 날짜여야 한다', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('month');
  });

  act(() => {
    result.current.navigate('next');
  });

  const currentDate = result.current.currentDate;
  const now = new Date();
  const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  expect(currentDate.toDateString()).toBe(nextDate.toDateString());
});

it('월간 뷰에서 이전으로 navigate시 한 달 전 날짜여야 한다', () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.navigate('prev');
  });

  const currentDate = result.current.currentDate;
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  expect(currentDate.toDateString()).toBe(prevDate.toDateString());
});

it("currentDate가 '2025-03-01' 변경되면 3월 휴일 '삼일절'로 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-03-01'));
  });

  assertDate(result.current.currentDate, new Date('2025-03-01'));

  expect(result.current.holidays).toEqual({
    '2025-03-01': '삼일절',
  });
});
