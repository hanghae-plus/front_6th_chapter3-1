import { render, screen } from '@testing-library/react';

import { CalendarView } from '../../components/calendar/CalendarView';
import { Event } from '../../types';

describe('CalendarView', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-01-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀원들과 점심',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
  ];

  const mockHolidays = {
    '2025-01-01': '신정',
    '2025-01-15': '설날',
  };

  const mockSetView = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    mockSetView.mockClear();
    mockNavigate.mockClear();
  });

  it('Week이 선택되었을 때 해당 날짜의 주간 일정이 렌더링된다', () => {
    render(
      <CalendarView
        view="week"
        setView={mockSetView}
        currentDate={new Date('2025-01-15')}
        navigate={mockNavigate}
        filteredEvents={mockEvents}
        notifiedEvents={[]}
        holidays={mockHolidays}
      />
    );

    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    expect(screen.queryByTestId('month-view')).not.toBeInTheDocument();
  });

  it('알림이 필요한 일정에 알림 아이콘이 표시된다', () => {
    render(
      <CalendarView
        view="month"
        setView={mockSetView}
        currentDate={new Date('2025-01-15')}
        navigate={mockNavigate}
        filteredEvents={mockEvents}
        notifiedEvents={['1']}
        holidays={mockHolidays}
      />
    );

    const notificationIcon = screen.getByTestId('notification-icon');
    expect(notificationIcon).toBeInTheDocument();
  });

  it('휴일 정보가 올바르게 표시된다', () => {
    render(
      <CalendarView
        view="month"
        setView={mockSetView}
        currentDate={new Date('2025-01-15')}
        navigate={mockNavigate}
        filteredEvents={mockEvents}
        notifiedEvents={[]}
        holidays={mockHolidays}
      />
    );

    expect(screen.getByText('설날')).toBeInTheDocument();
  });
});
