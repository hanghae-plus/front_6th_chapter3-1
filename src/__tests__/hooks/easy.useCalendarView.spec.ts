import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView';

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.view).toBe('month');
  });

  // ! 변경
  it('currentDate는 오늘 날짜여야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.currentDate).toEqual(new Date());
  });

  it('holidays는 현재 월의 휴일이 로드되어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    if (result.current.currentDate.getMonth() + 1 === 1) {
      expect(result.current.holidays).toEqual({
        '2025-01-01': '신정',
        '2025-01-29': '설날',
        '2025-01-30': '설날',
        '2025-01-31': '설날',
      });
    } else if (result.current.currentDate.getMonth() + 1 === 10) {
      expect(result.current.holidays).toEqual({
        '2025-10-03': '개천절',
        '2025-10-05': '추석',
        '2025-10-06': '추석',
        '2025-10-07': '추석',
        '2025-10-09': '한글날',
      });
    }
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

it('주간 뷰에서 다음으로 navigate시 7일 후 날짜로 지정이 된다', () => {
  const { result } = renderHook(() => useCalendarView());

  // 먼저 week 뷰로 변경
  act(() => {
    result.current.setView('week');
  });

  const initialDate = new Date(result.current.currentDate);

  act(() => {
    result.current.navigate('next');
  });

  const expectedDate = new Date(initialDate);
  expectedDate.setDate(expectedDate.getDate() + 7);

  expect(result.current.currentDate).toEqual(expectedDate);
});

it('월간 뷰에서 다음으로 navigate시 한 달 후 날짜여야 한다', () => {
  const { result } = renderHook(() => useCalendarView());

  const initialDate = new Date(result.current.currentDate);

  act(() => {
    result.current.navigate('next');
  });

  const expectedDate = new Date(initialDate);
  expectedDate.setDate(1); // 1일로 설정
  expectedDate.setMonth(expectedDate.getMonth() + 1);

  expect(result.current.currentDate).toEqual(expectedDate);
});

it('월간 뷰에서 이전으로 navigate시 한 달 전 날짜여야 한다', () => {
  const { result } = renderHook(() => useCalendarView());

  const initialDate = new Date(result.current.currentDate);

  act(() => {
    result.current.navigate('prev');
  });

  const expectedDate = new Date(initialDate);
  expectedDate.setDate(1); // 1일로 설정
  expectedDate.setMonth(expectedDate.getMonth() - 1);

  expect(result.current.currentDate).toEqual(expectedDate);
});

it('currentDate가 변경되면 해당 월의 휴일로 업데이트되어야 한다', async () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-03-01'));
  });

  // useEffect가 실행되어 holidays가 업데이트될 때까지 기다림
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  expect(result.current.holidays).toEqual({
    '2025-03-01': '삼일절',
  });
});
