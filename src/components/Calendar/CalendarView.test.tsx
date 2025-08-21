import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { CalendarView } from './CalendarView';

// 테스트 더블: WeekView, MonthView를 단순 div로 모킹
vi.mock('./WeekView', () => ({
  WeekView: ({ currentDate }: { currentDate: Date }) => (
    <div data-testid="week-view">WeekView {currentDate.toDateString()}</div>
  ),
}));
vi.mock('./MonthView', () => ({
  MonthView: ({ currentDate }: { currentDate: Date }) => (
    <div data-testid="month-view">MonthView {currentDate.toDateString()}</div>
  ),
}));

describe('<CalendarView />', () => {
  const baseProps = {
    setView: vi.fn(),
    currentDate: new Date('2025-10-01'),
    filteredEvents: [],
    notifiedEvents: [],
    holidays: {},
    weekDays: ['월', '화', '수', '목', '금', '토', '일'],
    onNavigate: vi.fn(),
  };

  it('view가 week일 때 WeekView만 렌더링된다', () => {
    render(<CalendarView {...baseProps} view="week" />);
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    expect(screen.queryByTestId('month-view')).not.toBeInTheDocument();
  });

  it('view가 month일 때 MonthView만 렌더링된다', () => {
    render(<CalendarView {...baseProps} view="month" />);
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
    expect(screen.queryByTestId('week-view')).not.toBeInTheDocument();
  });

  it('헤더 내 네비게이션 버튼 클릭 시 onNavigate가 호출된다', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<CalendarView {...baseProps} view="week" onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: /Previous/i }));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    expect(onNavigate).toHaveBeenCalledTimes(2);
    expect(onNavigate).toHaveBeenNthCalledWith(1, 'prev');
    expect(onNavigate).toHaveBeenNthCalledWith(2, 'next');
  });
});
