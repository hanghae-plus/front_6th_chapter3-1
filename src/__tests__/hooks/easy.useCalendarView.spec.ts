import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView()); //훅이 반환하는 값을 result.current 객체 통해서 사용할 수 있다!

    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    assertDate(result.current.currentDate, new Date('2025-10-01'));
  });

  it('holidays는 10월 휴일인 개천절, 한글날, 추석이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    const octHolidays = {
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    };

    expect(result.current.holidays).toEqual(octHolidays);
  });
});

/**
 * Q: 순서를 바꿔도 실행되는 테스트가 좋다고했는데, 이럴 경우 순서에 맞게 테스트 흐름이 있는것 같아서 고민입니다.
 * 이럴경우 주간 describe를 묶어서 beforeAll 에 주간세팅을 넣어줘도 되지않을까.. 근데 반복되는코드 괜히 묶을라 말고 그냥 복붙해서 쓰는게 더 좋다하셨으니 우선은 진행 ㄱㄱ
 */
describe('view 변경 후 변경된 날짜(currentDate) 확인', () => {
  it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
    const { result } = renderHook(() => useCalendarView());

    // 주간 뷰로 변경
    act(() => {
      result.current.setView('week');
    });

    expect(result.current.view).toBe('week');
  });

  it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
    const { result } = renderHook(() => useCalendarView());

    // 주간 뷰로 변경
    act(() => {
      result.current.setView('week');
    });

    // 다음을 눌러서 view 이동
    act(() => {
      result.current.navigate('next');
    });

    assertDate(result.current.currentDate, new Date('2025-10-08'));
  });

  it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
    const { result } = renderHook(() => useCalendarView());

    // 주간 뷰로 변경
    act(() => {
      result.current.setView('week');
    });

    // 이전 을 눌러서 view 이동
    act(() => {
      result.current.navigate('prev');
    });

    assertDate(result.current.currentDate, new Date('2025-09-24'));
  });

  it("월간 뷰에서 다음으로 navigate시 한 달 후 '2025-11-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.navigate('next');
    });

    assertDate(result.current.currentDate, new Date('2025-11-01'));
  });

  it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.navigate('prev');
    });

    assertDate(result.current.currentDate, new Date('2025-09-01'));
  });

  it("currentDate가 '2025-03-01' 변경되면 3월 휴일 '삼일절'로 업데이트되어야 한다", async () => {
    const { result } = renderHook(() => useCalendarView());

    act(() => {
      result.current.setCurrentDate(new Date('2025-03-01'));
    });

    expect(result.current.holidays).toEqual({ '2025-03-01': '삼일절' }); //3월은 휴일이 한개!
  });
});
