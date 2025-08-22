import { render, screen } from '@testing-library/react';
import { WeekView } from '../../components/calendar/WeekView';
import { Event } from '../../types';

// dateUtils 함수들을 모킹
/* eslint-disable @typescript-eslint/no-unused-vars */
vi.mock('../../utils/dateUtils', () => ({
  formatWeek: vi.fn((_date: Date) => '2024년 1월 3주차'),
  getWeekDates: vi.fn((_date: Date) => [
    new Date('2024-01-14'),
    new Date('2024-01-15'),
    new Date('2024-01-16'),
    new Date('2024-01-17'),
    new Date('2024-01-18'),
    new Date('2024-01-19'),
    new Date('2024-01-20'),
  ]),
}));

describe('WeekView', () => {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('주 뷰가 올바르게 렌더링되어야 한다', () => {
      render(<WeekView {...mockProps} />);

      expect(screen.getByTestId('week-view')).toBeInTheDocument();
      expect(screen.getByText('2024년 1월 3주차')).toBeInTheDocument();
    });

    it('요일 헤더가 올바르게 표시되어야 한다', () => {
      render(<WeekView {...mockProps} />);

      expect(screen.getByText('일')).toBeInTheDocument();
      expect(screen.getByText('월')).toBeInTheDocument();
      expect(screen.getByText('화')).toBeInTheDocument();
      expect(screen.getByText('수')).toBeInTheDocument();
      expect(screen.getByText('목')).toBeInTheDocument();
      expect(screen.getByText('금')).toBeInTheDocument();
      expect(screen.getByText('토')).toBeInTheDocument();
    });

    it('일정이 올바르게 표시되어야 한다', () => {
      render(<WeekView {...mockProps} />);

      expect(screen.getByText('테스트 일정')).toBeInTheDocument();
    });

    it('날짜가 올바르게 표시되어야 한다', () => {
      render(<WeekView {...mockProps} />);

      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });
});
