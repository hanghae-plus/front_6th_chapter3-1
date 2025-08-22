import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WeekView from '../../components/WeekView';
import { Event } from '../../types';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2024-07-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2024-07-17',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '레스토랑',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 60,
  },
];

const mockCurrentDate = new Date('2024-07-15');

const mockUseEventOperations = {
  events: mockEvents,
  saveEvent: vi.fn(),
  deleteEvent: vi.fn(),
};

vi.mock('../../hooks/useEventOperations', () => ({
  useEventOperations: () => mockUseEventOperations,
}));

const mockUseNotifications = {
  notifications: [],
  notifiedEvents: ['1'],
  setNotifications: vi.fn(),
};

vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => mockUseNotifications,
}));

const mockUseCalendarView = {
  view: 'week' as const,
  setView: vi.fn(),
  currentDate: mockCurrentDate,
  holidays: {},
  navigate: vi.fn(),
};

vi.mock('../../hooks/useCalendarView', () => ({
  useCalendarView: () => mockUseCalendarView,
}));

const mockUseSearch = {
  searchTerm: '',
  filteredEvents: mockEvents,
  setSearchTerm: vi.fn(),
};

vi.mock('../../hooks/useSearch', () => ({
  useSearch: () => mockUseSearch,
}));

vi.mock('../../utils/dateUtils', () => ({
  formatWeek: () => `2024년 7월 2주차`,
  getWeekDates: () => [
    new Date('2024-07-14'),
    new Date('2024-07-15'),
    new Date('2024-07-16'),
    new Date('2024-07-17'),
    new Date('2024-07-18'),
    new Date('2024-07-19'),
    new Date('2024-07-20'),
  ],
}));

const defaultProps = {
  editingEvent: null,
  setEditingEvent: vi.fn(),
};

describe('WeekView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('주간 뷰가 올바르게 렌더링되어야 한다', () => {
    render(<WeekView {...defaultProps} />);

    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    expect(screen.getByText('2024년 7월 2주차')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('요일 헤더가 올바르게 표시되어야 한다', () => {
    render(<WeekView {...defaultProps} />);

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('각 날짜가 올바르게 표시되어야 한다', () => {
    render(<WeekView {...defaultProps} />);

    const dates = ['14', '15', '16', '17', '18', '19', '20'];
    dates.forEach((date) => {
      expect(screen.getByText(date)).toBeInTheDocument();
    });
  });

  it('이벤트가 올바른 날짜에 표시되어야 한다', () => {
    render(<WeekView {...defaultProps} />);

    expect(screen.getByText('회의')).toBeInTheDocument();
    expect(screen.getByText('점심 약속')).toBeInTheDocument();
  });

  it('알림이 설정된 이벤트에 알림 아이콘이 표시되어야 한다', () => {
    render(<WeekView {...defaultProps} />);

    const notificationIcons = screen.getAllByTestId('NotificationsIcon');
    expect(notificationIcons).toHaveLength(1);
  });
});
