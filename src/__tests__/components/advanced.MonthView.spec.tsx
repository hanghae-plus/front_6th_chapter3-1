import { render, screen } from '@testing-library/react';
import React from 'react';
import { MonthView } from '../../components/calendar/MonthView';
import { Event } from '../../types';

// dateUtils 함수들을 모킹
vi.mock('../../utils/dateUtils', () => ({
  formatDate: vi.fn((_date: Date, day: number) => `2024-01-${day.toString().padStart(2, '0')}`),
  formatMonth: vi.fn(() => '2024년 1월'),
  getEventsForDay: vi.fn((events: Event[], day: number) =>
    events.filter((event) => event.date === `2024-01-${day.toString().padStart(2, '0')}`)
  ),
  getWeeksAtMonth: vi.fn(() => [
    [null, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, 31, null, null, null],
  ]),
}));

describe('MonthView', () => {
  const mockProps = {
    currentDate: new Date('2024-01-15'),
    filteredEvents: [
      {
        id: '1',
        title: '테스트 일정',
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트 설명',
        location: '테스트 위치',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ] as Event[],
    notifiedEvents: ['1'],
    holidays: {
      '2024-01-01': '신정',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('월 뷰가 올바르게 렌더링되어야 한다', () => {
      render(<MonthView {...mockProps} />);

      expect(screen.getByTestId('month-view')).toBeInTheDocument();
      expect(screen.getByText('2024년 1월')).toBeInTheDocument();
    });

    it('요일 헤더가 올바르게 표시되어야 한다', () => {
      render(<MonthView {...mockProps} />);

      expect(screen.getByText('일')).toBeInTheDocument();
      expect(screen.getByText('월')).toBeInTheDocument();
      expect(screen.getByText('화')).toBeInTheDocument();
      expect(screen.getByText('수')).toBeInTheDocument();
      expect(screen.getByText('목')).toBeInTheDocument();
      expect(screen.getByText('금')).toBeInTheDocument();
      expect(screen.getByText('토')).toBeInTheDocument();
    });

    it('일정이 올바르게 표시되어야 한다', () => {
      render(<MonthView {...mockProps} />);

      expect(screen.getByText('테스트 일정')).toBeInTheDocument();
    });

    it('공휴일이 올바르게 표시되어야 한다', () => {
      render(<MonthView {...mockProps} />);

      expect(screen.getByText('신정')).toBeInTheDocument();
    });
  });
});
