import { render, screen } from '@testing-library/react';
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

  describe('경계값 테스트', () => {
    it('빈 일정 배열로 렌더링해도 오류가 발생하지 않아야 한다', () => {
      const emptyProps = { ...mockProps, filteredEvents: [] };

      expect(() => render(<MonthView {...emptyProps} />)).not.toThrow();
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });

    it('빈 공휴일 객체로 렌더링해도 오류가 발생하지 않아야 한다', () => {
      const noHolidayProps = { ...mockProps, holidays: {} };

      expect(() => render(<MonthView {...noHolidayProps} />)).not.toThrow();
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });

    it('빈 알림 이벤트 배열로 렌더링해도 오류가 발생하지 않아야 한다', () => {
      const noNotificationProps = { ...mockProps, notifiedEvents: [] };

      expect(() => render(<MonthView {...noNotificationProps} />)).not.toThrow();
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });

    it('매우 많은 일정이 있어도 렌더링이 정상적으로 되어야 한다', () => {
      const manyEvents = Array.from({ length: 50 }, (_, i) => ({
        id: `event-${i}`,
        title: `일정 ${i}`,
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: `설명 ${i}`,
        location: `위치 ${i}`,
        category: '업무',
        repeat: { type: 'none' as const, interval: 0 },
        notificationTime: 10,
      })) as Event[];

      const manyEventsProps = { ...mockProps, filteredEvents: manyEvents };

      expect(() => render(<MonthView {...manyEventsProps} />)).not.toThrow();
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });
  });

  describe('다양한 날짜 테스트', () => {
    it('12월로 렌더링해도 정상 작동해야 한다', () => {
      const decemberProps = { ...mockProps, currentDate: new Date('2024-12-15') };

      expect(() => render(<MonthView {...decemberProps} />)).not.toThrow();
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });

    it('연초(1월) 날짜로 렌더링해도 정상 작동해야 한다', () => {
      const januaryProps = { ...mockProps, currentDate: new Date('2024-01-01') };

      expect(() => render(<MonthView {...januaryProps} />)).not.toThrow();
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });

    it('윤년 2월 날짜로 렌더링해도 정상 작동해야 한다', () => {
      const leapYearProps = { ...mockProps, currentDate: new Date('2024-02-29') };

      expect(() => render(<MonthView {...leapYearProps} />)).not.toThrow();
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });
  });
});
