import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDateOnly } from '../utils.ts';

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.view).toBe('month');
  });

  it('currentDate는 현재 날짜이어야 한다', () => {
    const now = new Date();
    const { result } = renderHook(() => useCalendarView());

    assertDateOnly(result.current.currentDate, now);
  });

  it('holidays는 10월 휴일인 개천절, 한글날, 추석이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setCurrentDate(new Date('2025-10-01'));
    });

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

  expect(result.current.view).toBe('week');
});

it('주간 뷰에서 2025-10-01 기준으로 다음 주로 이동하면 2025-10-08이 된다', () => {
  const { result } = renderHook(() => useCalendarView());
  const startDate = new Date('2025-10-01');

  act(() => {
    result.current.setView('week');
    result.current.setCurrentDate(startDate);
  });

  act(() => {
    result.current.navigate('next');
  });

  const expectedDate = new Date('2025-10-08');
  expect(result.current.currentDate).toEqual(expectedDate);
});

it('주간 뷰에서 2025-10-01 기준으로 이전 주로 이동하면 2025-09-24가 된다', () => {
  const { result } = renderHook(() => useCalendarView());
  const startDate = new Date('2025-10-01');

  act(() => {
    result.current.setView('week');
    result.current.setCurrentDate(startDate);
  });

  act(() => {
    result.current.navigate('prev');
  });

  const expectedDate = new Date('2025-09-24');
  expect(result.current.currentDate).toEqual(expectedDate);
});

it('월간 뷰에서 2025-10-01 기준으로 한 달 후 이동하면 2025-11-01가 된다', () => {
  const { result } = renderHook(() => useCalendarView());
  const startDate = new Date('2025-10-01');

  act(() => {
    result.current.setCurrentDate(startDate);
  });

  act(() => {
    result.current.navigate('next');
  });

  const expectedDate = new Date('2025-11-01');
  expect(result.current.currentDate).toEqual(expectedDate);
});

it('월간 뷰에서 2025-10-01 기준으로 한 달 전 이동하면 2025-09-01이 된다', () => {
  const { result } = renderHook(() => useCalendarView());
  const startDate = new Date('2025-10-01');

  act(() => {
    result.current.setCurrentDate(startDate);
  });

  act(() => {
    result.current.navigate('prev');
  });

  const expectedDate = new Date('2025-09-01');
  expect(result.current.currentDate).toEqual(expectedDate);
});

it("currentDate가 '2025-03-01' 변경되면 3월 휴일 '삼일절'로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());

  await act(async () => {
    result.current.setCurrentDate(new Date('2025-03-01'));
  });

  expect(result.current.holidays['2025-03-01']).toBe('삼일절');
});
