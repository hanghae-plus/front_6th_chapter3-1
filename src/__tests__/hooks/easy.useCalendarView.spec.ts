import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-01'));
});

describe('useCalendarView', () => {
  describe('초기 상태 검증', () => {
    it('기본 초기화 시 월간 뷰로 설정되어야 한다', () => {
      // Given: useCalendarView 훅을 매개변수 없이 초기화
      const { result } = renderHook(() => useCalendarView());

      // Then: 기본값으로 월간 뷰가 설정되어야 함
      expect(result.current.view).toBe('month');
    });

    it('초기화 시 현재 시스템 날짜(2025-10-01)로 currentDate가 설정되어야 한다', () => {
      // Given: 시스템 시간이 2025-10-01로 설정된 상태에서 훅 초기화
      const { result } = renderHook(() => useCalendarView());

      // Then: currentDate가 시스템 날짜와 일치해야 함
      assertDate(result.current.currentDate, new Date('2025-10-01'));
    });

    it('초기화 시 현재 월(10월)의 공휴일이 자동으로 로드되어야 한다', () => {
      // Given: 2025년 10월에 시스템 시간이 설정된 상태에서 훅 초기화
      const { result } = renderHook(() => useCalendarView());

      // When: holidays 데이터를 날짜순으로 정렬
      const sortedHolidays = Object.fromEntries(
        Object.entries(result.current.holidays).sort(
          ([date1], [date2]) => new Date(date1).getTime() - new Date(date2).getTime()
        )
      );

      // Then: 2025년 10월의 모든 공휴일이 포함되어야 함
      expect(sortedHolidays).toEqual({
        '2025-10-03': '개천절',
        '2025-10-05': '추석',
        '2025-10-06': '추석',
        '2025-10-07': '추석',
        '2025-10-09': '한글날',
      });
    });

    it('주간 뷰로 초기화하면 view가 week로 설정되어야 한다', () => {
      // Given: 주간 뷰 매개변수로 훅 초기화
      const { result } = renderHook(() => useCalendarView('week'));

      // Then: 주간 뷰로 설정되어야 함
      expect(result.current.view).toBe('week');
    });
  });

  describe('주간 뷰 네비게이션', () => {
    it('다음으로 이동 시 현재 날짜에서 7일 후로 이동해야 한다', () => {
      // Given: 2025-10-01에서 주간 뷰로 초기화
      const { result } = renderHook(() => useCalendarView('week'));

      // When: 다음으로 네비게이션 실행
      act(() => {
        result.current.navigate('next');
      });

      // Then: 7일 후인 2025-10-08로 이동해야 함
      assertDate(result.current.currentDate, new Date('2025-10-08'));
    });

    it('이전으로 이동 시 현재 날짜에서 7일 전으로 이동해야 한다', () => {
      // Given: 2025-10-01에서 주간 뷰로 초기화
      const { result } = renderHook(() => useCalendarView('week'));

      // When: 이전으로 네비게이션 실행
      act(() => {
        result.current.navigate('prev');
      });

      // Then: 7일 전인 2025-09-24로 이동해야 함
      assertDate(result.current.currentDate, new Date('2025-09-24'));
    });
  });

  describe('월간 뷰 네비게이션', () => {
    it('다음으로 이동 시 다음 달 같은 일로 이동해야 한다', () => {
      // Given: 2025-10-01에서 월간 뷰로 초기화
      const { result } = renderHook(() => useCalendarView('month'));

      // When: 다음으로 네비게이션 실행
      act(() => {
        result.current.navigate('next');
      });

      // Then: 다음 달인 2025-11-01로 이동해야 함
      assertDate(result.current.currentDate, new Date('2025-11-01'));
    });

    it('이전으로 이동 시 이전 달 같은 일로 이동해야 한다', () => {
      // Given: 2025-10-01에서 월간 뷰로 초기화
      const { result } = renderHook(() => useCalendarView('month'));

      // When: 이전으로 네비게이션 실행
      act(() => {
        result.current.navigate('prev');
      });

      // Then: 이전 달인 2025-09-01로 이동해야 함
      assertDate(result.current.currentDate, new Date('2025-09-01'));
    });
  });

  describe('날짜 변경과 공휴일 업데이트', () => {
    it('setCurrentDate로 3월로 이동하면 해당 월의 공휴일로 자동 업데이트되어야 한다', () => {
      // Given: 월간 뷰로 초기화된 상태
      const { result } = renderHook(() => useCalendarView('month'));

      // When: 날짜를 2025년 3월 1일로 변경
      act(() => {
        result.current.setCurrentDate(new Date('2025-03-01'));
      });

      // Then: 3월의 공휴일(삼일절)이 로드되어야 함
      expect(result.current.holidays).toEqual({
        '2025-03-01': '삼일절',
      });
    });
  });
});
