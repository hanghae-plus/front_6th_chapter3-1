import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    console.log(result.current.view);
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    const date1 = result.current.currentDate;
    const date2 = new Date('2025-10-01T00:00:00.000Z');

    console.log(assertDate(date1, date2)); // 테스트 통과 (두 날짜가 완전히 같음)
    assertDate(date1, date2); // expect 내부에서 비교하므로 별도의 expect 필요 없음
  });

  it('holidays는 10월 휴일인 개천절, 한글날, 추석이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    console.log(result.current.holidays);
    expect(result.current.holidays).toEqual({
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    });
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  const { result } = renderHook(() => useCalendarView());
  expect(result.current.view).toBe('month');
  act(() => {
    result.current.setView('week');
  });
  console.log(result.current.view);
  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });
  act(() => {
    result.current.navigate('next');
  });
  console.log(result.current.currentDate);
  const date1 = result.current.currentDate;
  const date2 = new Date('2025-10-08T00:00:00.000Z');
  assertDate(date1, date2);
});

it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });
  act(() => {
    result.current.navigate('prev');
  });
  console.log(result.current.currentDate);
  const date1 = result.current.currentDate;
  const date2 = new Date('2025-09-24T00:00:00.000Z');
  assertDate(date1, date2);
});

it("월간 뷰에서 다음으로 navigate시 한 달 후 '2025-11-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.navigate('next');
  });
  console.log(result.current.currentDate);
  const date1 = result.current.currentDate;
  const date2 = new Date('2025-11-01T00:00:00.000Z');
  assertDate(date1, date2);
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.navigate('prev');
  });
  console.log(result.current.currentDate);
  const date1 = result.current.currentDate;
  const date2 = new Date('2025-09-01T00:00:00.000Z');
  assertDate(date1, date2);
});

it("currentDate가 '2025-03-01' 변경되면 3월 휴일 '삼일절'로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setCurrentDate(new Date('2025-03-01T00:00:00.000Z'));
  });
  expect(result.current.holidays).toEqual({
    '2025-03-01': '삼일절',
  });
});
