import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import CalendarView from '../../components/CalendarView';
import { Event } from '../../types';

vi.mock('../../utils/dateUtils', () => ({
  formatDate: vi.fn((date: Date, day: number) => `2025-01-${day.toString().padStart(2, '0')}`),
  formatMonth: vi.fn(() => '2025년 1월'),
  formatWeek: vi.fn(() => '2025년 1월 1주차'),
  getEventsForDay: vi.fn((events: Event[], day: number) =>
    events.filter((event) => event.date === `2025-01-${day.toString().padStart(2, '0')}`)
  ),
  getWeekDates: vi.fn(() => [
    new Date('2025-01-01'),
    new Date('2025-01-02'),
    new Date('2025-01-03'),
    new Date('2025-01-04'),
    new Date('2025-01-05'),
    new Date('2025-01-06'),
    new Date('2025-01-07'),
  ]),
  getWeeksAtMonth: vi.fn(() => [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, null, null, null, null],
  ]),
}));

const mockEvents: Event[] = [
  {
    id: '1',
    title: '테스트 일정 1',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명 1',
    location: '테스트 위치 1',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '테스트 일정 2',
    date: '2025-01-02',
    startTime: '14:00',
    endTime: '15:00',
    description: '테스트 설명 2',
    location: '테스트 위치 2',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
];

const mockHolidays = {
  '2025-01-01': '신정',
  '2025-01-02': '설날',
};

const mockProps = {
  view: 'week' as const,
  currentDate: new Date('2025-01-01'),
  holidays: mockHolidays,
  filteredEvents: mockEvents,
  notifiedEvents: ['1'],
  onViewChange: vi.fn(),
  onNavigate: vi.fn(),
};

const renderCalendarView = (props = {}) => {
  const defaultProps = { ...mockProps, ...props };
  return render(<CalendarView {...defaultProps} />);
};

describe('CalendarView 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('제목이 올바르게 표시된다', () => {
      renderCalendarView();

      expect(screen.getByText('일정 보기')).toBeInTheDocument();
    });

    it('주간 뷰에서 주간 제목이 표시된다', () => {
      renderCalendarView({ view: 'week' });

      expect(screen.getByText('2025년 1월 1주차')).toBeInTheDocument();
    });

    it('월간 뷰에서 월간 제목이 표시된다', () => {
      renderCalendarView({ view: 'month' });

      expect(screen.getByText('2025년 1월')).toBeInTheDocument();
    });

    it('요일 헤더가 올바르게 표시된다', () => {
      renderCalendarView();

      expect(screen.getByText('일')).toBeInTheDocument();
      expect(screen.getByText('월')).toBeInTheDocument();
      expect(screen.getByText('화')).toBeInTheDocument();
      expect(screen.getByText('수')).toBeInTheDocument();
      expect(screen.getByText('목')).toBeInTheDocument();
      expect(screen.getByText('금')).toBeInTheDocument();
      expect(screen.getByText('토')).toBeInTheDocument();
    });
  });

  describe('네비게이션 테스트', () => {
    it('이전 버튼 클릭 시 onNavigate가 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnNavigate = vi.fn();
      renderCalendarView({ onNavigate: mockOnNavigate });

      const prevButton = screen.getByLabelText('Previous');
      await user.click(prevButton);

      expect(mockOnNavigate).toHaveBeenCalledWith('prev');
    });

    it('다음 버튼 클릭 시 onNavigate가 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnNavigate = vi.fn();
      renderCalendarView({ onNavigate: mockOnNavigate });

      const nextButton = screen.getByLabelText('Next');
      await user.click(nextButton);

      expect(mockOnNavigate).toHaveBeenCalledWith('next');
    });

    it('뷰 타입 변경 시 onViewChange가 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnViewChange = vi.fn();
      renderCalendarView({ onViewChange: mockOnViewChange });

      const selectViewType = screen.getByTestId('view-select');
      const selectElement = within(selectViewType).getByRole('combobox');
      await user.click(selectElement);
      await user.click(screen.getByRole('option', { name: /month/i }));

      expect(mockOnViewChange).toHaveBeenCalledWith('month');
    });
  });

  describe('주간 뷰 테스트', () => {
    it('주간 뷰에서 날짜가 올바르게 표시된다', () => {
      renderCalendarView({ view: 'week' });

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('주간 뷰에서 일정이 올바르게 표시된다', () => {
      renderCalendarView({ view: 'week' });

      expect(screen.getByText('테스트 일정 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 일정 2')).toBeInTheDocument();
    });

    it('주간 뷰에서 알림이 있는 일정이 강조 표시된다', () => {
      renderCalendarView({ view: 'week' });

      const eventBox = screen.getByTestId('event-1');
      expect(eventBox).toContainElement(screen.getByTestId('NotificationsIcon'));
    });
  });

  describe('월간 뷰 테스트', () => {
    it('월간 뷰에서 날짜가 올바르게 표시된다', () => {
      renderCalendarView({ view: 'month' });

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('31')).toBeInTheDocument();
    });

    it('월간 뷰에서 공휴일이 표시된다', () => {
      renderCalendarView({ view: 'month' });

      expect(screen.getByText('신정')).toBeInTheDocument();
      expect(screen.getByText('설날')).toBeInTheDocument();
    });

    it('월간 뷰에서 일정이 올바르게 표시된다', () => {
      renderCalendarView({ view: 'month' });

      expect(screen.getByText('테스트 일정 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 일정 2')).toBeInTheDocument();
    });
  });

  describe('일정 표시 테스트', () => {
    it('일정 제목이 올바르게 표시된다', () => {
      renderCalendarView();

      expect(screen.getByText('테스트 일정 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 일정 2')).toBeInTheDocument();
    });

    it('알림 아이콘이 있는 일정에 알림 아이콘이 표시된다', () => {
      renderCalendarView();

      const notificationIcon = screen.getByTestId('NotificationsIcon');
      expect(notificationIcon).toBeInTheDocument();
    });
  });
});
