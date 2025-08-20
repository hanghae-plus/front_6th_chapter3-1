import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toEqual('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.currentDate).toEqual(new Date('2025-10-01'));
  });

  it('holidays는 10월 휴일인 개천절, 한글날, 추석이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.holidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
    });
  });
});

describe('view 상태 변경', () => {
  it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('week');
    });
    expect(result.current.view).toEqual('week');
  });
});

describe('navigate 사용', () => {
  it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('week');
    });
    act(() => {
      result.current.navigate('next');
    });
    expect(result.current.currentDate).toEqual(new Date('2025-10-08'));
  });

  // AS IS : 주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다.
  // TO BE : 주간 뷰에서 이전으로 navigate시 7일 전 '2025-09-24' 날짜로 지정이 된다.
  it("주간 뷰에서 이전으로 navigate시 7일 전 '2025-09-24' 날짜로 지정이 된다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('week');
    });
    act(() => {
      result.current.navigate('prev');
    });
    expect(result.current.currentDate).toEqual(new Date('2025-09-24'));
  });

  it("월간 뷰에서 다음으로 navigate시 한 달 후 '2025-11-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('month');
    });
    act(() => {
      result.current.navigate('next');
    });
    expect(result.current.currentDate).toEqual(new Date('2025-11-01'));
  });

  it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('month');
    });
    act(() => {
      result.current.navigate('prev');
    });
    expect(result.current.currentDate).toEqual(new Date('2025-09-01'));
  });
});

// AS IS : async로 되어있었는데, 비동기를 다루지 않으므로 제거
// AS IS : currentDate가 '2025-03-01' 변경되면 3월 휴일 '삼일절'로 업데이트되어야 한다.
// TO BE : currentDate가 '2025-03-01'로 변경되면 holidays가 {'2025-03-01': '삼일절'}로 업데이트되어야 한다.
describe('currentDate 변경', () => {
  it("currentDate가 '2025-03-01'로 변경되면 holidays가 {'2025-03-01': '삼일절'}로 업데이트되어야 한다.", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setCurrentDate(new Date('2025-03-01'));
    });
    expect(result.current.holidays).toEqual({
      '2025-03-01': '삼일절',
    });
  });
});
