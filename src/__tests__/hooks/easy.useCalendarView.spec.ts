import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-01'));
});

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    // given 월간 뷰 초기화
    const { result } = renderHook(() => useCalendarView());

    // then 월간 뷰로 초기화
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    // given 월간 뷰 초기화
    const { result } = renderHook(() => useCalendarView());

    // then 오늘 날짜로 초기화
    expect(assertDate(result.current.currentDate, new Date('2025-10-01')));
  });

  it('holidays는 10월 휴일인 개천절, 한글날, 추석이 지정되어 있어야 한다', () => {
    // given 월간 뷰 초기화
    const { result } = renderHook(() => useCalendarView());

    // then 10월 휴일 지정
    const holidays = Object.fromEntries(
      Object.entries(result.current.holidays).sort(
        ([date1], [date2]) => new Date(date1).getTime() - new Date(date2).getTime()
      )
    );

    // then 10월 휴일 지정
    expect(holidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  // given 주간 뷰 초기화
  const { result } = renderHook(() => useCalendarView('week'));

  // then 주간 뷰로 변경
  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  // given 주간 뷰 초기화
  const { result } = renderHook(() => useCalendarView('week'));

  // when 다음으로 navigate
  act(() => {
    result.current.navigate('next');
  });

  // then 7일 후 날짜로 지정
  expect(assertDate(result.current.currentDate, new Date('2025-10-08')));
});

it("주간 뷰에서 이전으로 navigate시 7일 전 '2025-09-24' 날짜로 지정이 된다", () => {
  // given 주간 뷰 초기화
  const { result } = renderHook(() => useCalendarView('week'));

  // when 이전으로 navigate
  act(() => {
    result.current.navigate('prev');
  });

  // then 7일 전 날짜로 지정
  expect(assertDate(result.current.currentDate, new Date('2025-09-24')));
});

it("월간 뷰에서 다음으로 navigate시 한 달 후 '2025-11-01' 날짜여야 한다", () => {
  // given 월간 뷰 초기화
  const { result } = renderHook(() => useCalendarView('month'));

  // when 다음으로 navigate
  act(() => {
    result.current.navigate('next');
  });

  // then 한 달 후 날짜로 지정
  expect(assertDate(result.current.currentDate, new Date('2025-11-01')));
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
  // given 월간 뷰 초기화
  const { result } = renderHook(() => useCalendarView('month'));

  // when 이전으로 navigate
  act(() => {
    result.current.navigate('prev');
  });

  // then 한 달 전 날짜로 지정
  expect(assertDate(result.current.currentDate, new Date('2025-09-01')));
});

it("currentDate가 '2025-03-01' 변경되면 3월 휴일 '삼일절'로 업데이트되어야 한다", async () => {
  // given 월간 뷰 초기화
  const { result } = renderHook(() => useCalendarView('month'));

  // when currentDate 변경
  act(() => {
    result.current.setCurrentDate(new Date('2025-03-01'));
  });

  // then 3월 휴일 '삼일절'로 업데이트
  expect(result.current.holidays).toEqual({
    '2025-03-01': '삼일절',
  });
});
