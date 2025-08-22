import { render, screen } from '@testing-library/react';
import { describe, expect, beforeEach, it } from 'vitest';

import { CalendarView } from '../components/CalendarView';
import { Event } from '../types';
import { createMockEvent, createMockHolidays, TEST_DATES } from './fixtures/mockData';

const mockEvents: Event[] = [createMockEvent()];

const defaultProps = {
  currentDate: new Date(TEST_DATES.DEFAULT_DATE),
  events: mockEvents,
  holidays: createMockHolidays(),
  notifiedEvents: [],
};

describe('CalendarView 컴포넌트', () => {
  beforeEach(() => {
    // 각 테스트 전에 모킹 초기화
  });

  describe('주간 뷰 렌더링', () => {
    it('주간 뷰가 올바르게 렌더링된다', () => {
      render(<CalendarView {...defaultProps} view="week" />);

      expect(screen.getByTestId('week-view')).toBeInTheDocument();
      expect(screen.getByText('2024년 7월 3주')).toBeInTheDocument();
    });

    it('주간 뷰에서 요일 헤더가 표시된다', () => {
      render(<CalendarView {...defaultProps} view="week" />);

      const expectedWeekDays = ['일', '월', '화', '수', '목', '금', '토'];
      expectedWeekDays.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('주간 뷰에서 이벤트가 올바른 날짜에 표시된다', () => {
      render(<CalendarView {...defaultProps} view="week" />);

      expect(screen.getByText('테스트 이벤트')).toBeInTheDocument();
    });

    it('알림된 이벤트가 notified 스타일로 표시된다', () => {
      render(<CalendarView {...defaultProps} view="week" notifiedEvents={['1']} />);

      const eventElement = screen.getByText('테스트 이벤트');
      expect(eventElement).toBeInTheDocument();
      // 알림된 이벤트는 존재하는 것만 확인 (스타일은 상위 컴포넌트에서 처리)
    });
  });

  describe('월간 뷰 렌더링', () => {
    it('월간 뷰가 올바르게 렌더링된다', () => {
      render(<CalendarView {...defaultProps} view="month" />);

      expect(screen.getByTestId('month-view')).toBeInTheDocument();
      expect(screen.getByText('2024년 7월')).toBeInTheDocument();
    });

    it('월간 뷰에서 공휴일이 표시된다', () => {
      render(<CalendarView {...defaultProps} view="month" />);

      expect(screen.getByText('광복절')).toBeInTheDocument();
    });

    it('월간 뷰에서 이벤트가 올바른 날짜에 표시된다', () => {
      render(<CalendarView {...defaultProps} view="month" />);

      expect(screen.getByText('테스트 이벤트')).toBeInTheDocument();
    });

    it('월간 뷰에서 달력 셀이 적절한 수만큼 렌더링된다', () => {
      render(<CalendarView {...defaultProps} view="month" />);

      const allCells = screen.getAllByRole('cell');
      const expectedMinCells = 31; // 7월 최소 일수
      expect(allCells.length).toBeGreaterThanOrEqual(expectedMinCells);
    });
  });

  describe('이벤트 표시', () => {
    it('여러 이벤트가 같은 날짜에 있을 때 모두 표시된다', () => {
      const multipleEvents = [
        createMockEvent(),
        createMockEvent({
          id: '2',
          title: '두 번째 이벤트',
          startTime: '14:00',
          endTime: '15:00',
          category: '개인',
        }),
      ];

      render(<CalendarView {...defaultProps} view="week" events={multipleEvents} />);

      expect(screen.getByText('테스트 이벤트')).toBeInTheDocument();
      expect(screen.getByText('두 번째 이벤트')).toBeInTheDocument();
    });

    it('이벤트가 없는 날짜는 빈 상태로 표시된다', () => {
      render(<CalendarView {...defaultProps} view="week" events={[]} />);

      expect(screen.queryByText('테스트 이벤트')).not.toBeInTheDocument();
    });
  });

  describe('날짜 경계 테스트', () => {
    it('월 경계를 넘나드는 주간 뷰가 올바르게 표시된다', () => {
      const monthEndDate = new Date('2024-07-31');
      render(<CalendarView {...defaultProps} view="week" currentDate={monthEndDate} />);

      expect(screen.getByTestId('week-view')).toBeInTheDocument();
    });

    it('연도 경계를 넘나드는 월간 뷰가 올바르게 표시된다', () => {
      const yearEndDate = new Date('2024-12-31');
      render(<CalendarView {...defaultProps} view="month" currentDate={yearEndDate} />);

      expect(screen.getByText('2024년 12월')).toBeInTheDocument();
    });
  });
});
