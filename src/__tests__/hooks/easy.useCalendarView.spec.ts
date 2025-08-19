import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('초기 상태', () => {
  const { result } = renderHook(() => useCalendarView());

  it('view는 "month"이어야 한다', () => {
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 현재 날짜여야 한다', () => {
    expect(result.current.currentDate.getFullYear()).toBe(new Date().getFullYear());
    expect(result.current.currentDate.getMonth()).toBe(new Date().getMonth());
    expect(result.current.currentDate.getDate()).toBe(new Date().getDate());
  });
});

it('holidays는 10월 휴일인 개천절, 한글날, 추석이 지정되어 있어야 한다', () => {
  const { result } = renderHook(() => useCalendarView());
  
  act(() => {
    result.current.setCurrentDate(new Date('2025-10-01'));
  });

  const expected = {
    '2025-10-05': '추석',
    '2025-10-06': '추석',
    '2025-10-07': '추석',
    '2025-10-03': '개천절',
    '2025-10-09': '한글날',
  };

  expect(result.current.holidays).toEqual(expected);
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
    result.current.setCurrentDate(new Date('2025-10-01'));
  });

  act(() => {
    result.current.navigate('next');
  });

  const expected = new Date('2025-10-08');

  expect(result.current.currentDate).toEqual(expected);
});

it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
    result.current.setCurrentDate(new Date('2025-10-01'));
  });

  act(() => {
    result.current.navigate('prev');
  });

  const expected = new Date('2025-09-24');

  expect(result.current.currentDate).toEqual(expected);
});

it("월간 뷰에서 다음으로 navigate시 한 달 후 '2025-11-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-10-01'));
  });

  act(() => {
    result.current.navigate('next');
  });

  const expected = new Date('2025-11-01');

  expect(result.current.currentDate).toEqual(expected);
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-10-01'));
  });

  act(() => {
    result.current.navigate('prev');
  });

  const expected = new Date('2025-09-01');

  expect(result.current.currentDate).toEqual(expected);
});

it("currentDate가 '2025-03-01' 변경되면 3월 휴일 '삼일절'로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-03-01'));
  });

  const expected = {
    '2025-03-01': '삼일절',
  };

  expect(result.current.holidays).toEqual(expected);
});
