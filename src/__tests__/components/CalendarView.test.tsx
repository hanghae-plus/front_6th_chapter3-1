import { render, screen } from '@testing-library/react';

import { CalendarView } from '../../components/calendar/CalendarView';
import { createMockEvents } from '../utils';

const renderCalendarView = (props: Parameters<typeof CalendarView>[0]) =>
  render(<CalendarView {...props} />);

describe('CalendarView', () => {
  const mockEvents = createMockEvents();

  const mockHolidays = {
    '2025-01-01': '신정',
    '2025-01-15': '설날',
  };

  const mockSetView = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('Week이 선택되었을 때 해당 날짜의 주간 일정이 렌더링된다', () => {
    renderCalendarView({
      view: 'week',
      setView: mockSetView,
      currentDate: new Date('2025-01-15'),
      navigate: mockNavigate,
      filteredEvents: mockEvents,
      notifiedEvents: [],
      holidays: mockHolidays,
    });

    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    expect(screen.queryByTestId('month-view')).not.toBeInTheDocument();
  });

  it('휴일 정보가 올바르게 표시된다', () => {
    renderCalendarView({
      view: 'month',
      setView: mockSetView,
      currentDate: new Date('2025-01-15'),
      navigate: mockNavigate,
      filteredEvents: mockEvents,
      notifiedEvents: [],
      holidays: mockHolidays,
    });

    expect(screen.getByText('설날')).toBeInTheDocument();
  });
});
